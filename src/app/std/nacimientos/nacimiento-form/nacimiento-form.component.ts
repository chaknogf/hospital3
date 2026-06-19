import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NacimientoOut, NacimientoCreate, NacimientoUpdate } from '../../../interface/nacimientos';
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
  guardando = false;
  error: string | null = null;
  success: string | null = null;

  modelo: NacimientoCreate = {
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
        this.modelo.paciente_id = n.paciente_id;
        this.modelo.madre_id = n.madre_id;
        this.modelo.expediente = n.expediente;
        this.modelo.nombre_completo = n.nombre_completo;
        this.modelo.sexo = n.sexo;
        this.modelo.fecha_nacimiento = n.fecha_nacimiento;
        this.modelo.peso_nacimiento = n.peso_nacimiento;
        this.modelo.edad_gestacional = n.edad_gestacional;
        this.modelo.tipo_parto = n.tipo_parto;
        this.modelo.clase_parto = n.clase_parto;
        this.modelo.gemelo = n.gemelo;
        this.modelo.hora_nacimiento = n.hora_nacimiento;
        this.modelo.extrahospitalario = n.extrahospitalario ?? false;
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

    if (this.editando && this.nacimientoId) {
      const update: NacimientoUpdate = {
        peso_nacimiento: this.modelo.peso_nacimiento,
        edad_gestacional: this.modelo.edad_gestacional,
        tipo_parto: this.modelo.tipo_parto,
        clase_parto: this.modelo.clase_parto,
        gemelo: this.modelo.gemelo,
        hora_nacimiento: this.modelo.hora_nacimiento,
        extrahospitalario: this.modelo.extrahospitalario
      };
      this.api.updateNacimiento(this.nacimientoId, update).subscribe({
        next: () => {
          this.success = 'Nacimiento actualizado exitosamente';
          this.guardando = false;
        },
        error: () => {
          this.error = 'Error al actualizar nacimiento';
          this.guardando = false;
        }
      });
    } else {
      this.api.createNacimiento(this.modelo).subscribe({
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
