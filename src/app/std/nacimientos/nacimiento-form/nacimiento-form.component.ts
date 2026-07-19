import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NacimientoOut, NacimientoCreate, NacimientoUpdate, NeonatalesPayload, PacienteResumen, NacimientoFormModel } from '../../../interface/nacimientos';
import { NacimientosService } from '../nacimientos.service';

@Component({
  selector: 'app-nacimiento-form',
  templateUrl: './nacimiento-form.component.html',
  styleUrls: ['./nacimiento-form.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class NacimientoFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(NacimientosService);

  editando = false;
  nacimientoId: number | null = null;
  pacienteId: number | null = null;
  pacienteInfo: PacienteResumen | null = null;
  nombreMadre: string | null = null;
  guardando = false;
  error: string | null = null;
  success: string | null = null;

  modelo: NacimientoFormModel = {
    paciente_id: null,
    madre_id: null,
    expediente: null,
    nombre_completo: null,
    sexo: null,
    fecha_nacimiento: null,
    peso_nacimiento: null,
    edad_gestacional: null,
    tipo_parto: null,
    clase_parto: null,
    gemelo: null,
    hora_nacimiento: null,
    extrahospitalario: false,
    mortinato: false,
    registrador_id: null,
    datos_extra: undefined
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.nacimientoId = Number(id);
      this.editando = true;
      this.cargarNacimiento(this.nacimientoId);
    }
  }

  cargarNacimiento(id: number): void {
    this.api.getNacimiento(id).subscribe({
      next: n => {
        this.pacienteId = n.paciente_id ?? null;
        this.pacienteInfo = n.paciente ?? null;
        this.nombreMadre = n.nombre_madre ?? null;
        this.modelo.paciente_id = n.paciente_id ?? null;
        this.modelo.madre_id = n.madre_id ?? null;
        this.modelo.expediente = n.paciente?.expediente ?? null;
        this.modelo.nombre_completo = n.paciente?.nombre_completo ?? null;
        this.modelo.sexo = n.paciente?.sexo ?? null;
        this.modelo.fecha_nacimiento = n.paciente?.fecha_nacimiento ?? null;
        this.modelo.peso_nacimiento = n.neonatales?.peso_nacimiento ?? null;
        this.modelo.edad_gestacional = n.neonatales?.edad_gestacional ?? null;
        this.modelo.tipo_parto = n.neonatales?.tipo_parto ?? null;
        this.modelo.clase_parto = n.neonatales?.clase_parto ?? null;
        this.modelo.gemelo = n.neonatales?.gemelo ?? null;
        this.modelo.hora_nacimiento = n.neonatales?.hora_nacimiento ?? null;
        this.modelo.extrahospitalario = n.neonatales?.extrahospitalario ?? false;
        this.modelo.mortinato = n.mortinato ?? false;
      },
      error: () => {
        this.error = 'Error al cargar el nacimiento';
      }
    });
  }

  guardar(): void {
    this.error = null;
    this.success = null;

    if (!this.modelo.nombre_completo?.trim()) {
      this.error = 'El nombre del neonato es requerido';
      return;
    }

    this.guardando = true;

    if (this.editando && this.pacienteId && this.nacimientoId) {
      const neonatales: NeonatalesPayload = {
        peso_nacimiento: this.modelo.peso_nacimiento,
        edad_gestacional: this.modelo.edad_gestacional,
        tipo_parto: this.modelo.tipo_parto,
        clase_parto: this.modelo.clase_parto,
        gemelo: this.modelo.gemelo,
        hora_nacimiento: this.modelo.hora_nacimiento,
        extrahospitalario: this.modelo.extrahospitalario
      };
      this.api.updatePacienteNeonatales(this.pacienteId, neonatales).subscribe({
        next: () => {
          const nacUpdate: NacimientoUpdate = {
            madre_id: this.modelo.madre_id,
            mortinato: this.modelo.mortinato
          };
          this.api.updateNacimiento(this.nacimientoId!, nacUpdate).subscribe({
            next: () => {
              this.success = 'Nacimiento actualizado exitosamente';
              this.guardando = false;
            },
            error: () => {
              this.success = 'Neonatales actualizados, error al actualizar registro';
              this.guardando = false;
            }
          });
        },
        error: () => {
          this.error = 'Error al actualizar nacimiento';
          this.guardando = false;
        }
      });
    } else {
      const payload: NacimientoCreate = {
        paciente_id: this.modelo.paciente_id,
        madre_id: this.modelo.madre_id,
        mortinato: this.modelo.mortinato || null
      };
      this.api.createNacimiento(payload).subscribe({
        next: () => {
          this.success = 'Nacimiento registrado exitosamente';
          this.guardando = false;
        },
        error: () => {
          this.error = 'Error al registrar nacimiento';
          this.guardando = false;
        }
      });
    }
  }

  volver(): void {
    this.router.navigate(['/nacimientos-std']);
  }
}
