import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ConstanciasService } from '../constancias.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { ApiService } from '../../../service/api.service';
import { CnAcimientoInformeComponent, CnacimientoOut, MedicoInfo } from './cnacimiento-informe.component';

@Component({
  selector: 'app-hoja-cnacimiento',
  standalone: true,
  templateUrl: './hoja-cnacimiento.component.html',
  styleUrls: ['./hoja-cnacimiento.component.css'],
  imports: [CommonModule, CnAcimientoInformeComponent]
})
export class HojaCnacimientoComponent implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ConstanciasService);
  private apis = inject(ApiService);

  constancia = signal<CnacimientoOut | undefined>(undefined);
  medico = signal<MedicoInfo | undefined>(undefined);
  isLoading = signal(false);
  error = signal<string | null>(null);
  detalleVisible = signal(false);

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id && !isNaN(id)) {
      this.cargarDatos(id);
    } else {
      this.error.set('ID de constancia inválido');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarDatos(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.api.getConstancia(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
        catchError(error => {
          console.error('❌ Error cargando constancia:', error);
          this.error.set('Error al cargar la constancia');
          this.detalleVisible.set(true);
          return of(null);
        })
      )
      .subscribe(data => {
        if (!data) {
          this.error.set('Constancia no encontrada');
          this.detalleVisible.set(true);
          return;
        }

        const out: CnacimientoOut = {
          id: data.id,
          documento: data.documento,
          fecha_registro: data.fecha_registro,
          hijos: data.hijos,
          vivos: data.vivos,
          muertos: data.muertos,
          observaciones: data.observaciones,
          paciente: data.paciente as any,
          madre: data.madre as any,
        };
        this.constancia.set(out);

        const medicoId = data.paciente?.datos_extra?.neonatales?.id_medico;
        if (medicoId) {
          this.apis.getMedicos({ id: medicoId })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: res => {
                if (res?.length) {
                  const m = res[0];
                  this.medico.set({
                    nombre: m.nombre,
                    sexo: m.sexo,
                    colegiado: m.colegiado,
                    dpi: m.dpi,
                  });
                }
              }
            });
        }
        this.detalleVisible.set(true);
      });
  }

  imprimir(): void {
    setTimeout(() => window.print(), 100);
  }

  regresar(): void {
    this.router.navigate(['/nacimientos']);
  }
}
