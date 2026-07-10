import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { CitaResponse, Citas } from '../../../interface/citas';
import { CitaService } from '../cita.service';
import { DatosExtraPipe } from '../../../pipes/datos-extra.pipe';
import { Especialidades, KeyValue } from '../../../enum/especialidades';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-imprimir-citas',
  templateUrl: './imprimirCitas.component.html',
  styleUrls: ['./imprimirCitas.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, DatosExtraPipe],
})
export class ImprimirCitasComponent implements OnInit, OnDestroy {
  // ======= INYECCIONES =======
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(CitaService);
  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef);

  private destroy$ = new Subject<void>();

  // ======= ESTADO =======
  citas: CitaResponse[] = [];
  cargando = false;
  especialidadesList: KeyValue[] = Especialidades;

  // ======= FILTROS =======
  filtros: any = {
    expediente: '',
    especialidad: '',
    fecha_cita: this.hoy(),
    limit: 500,
  };

  private hoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  get fechaImpresion(): string {
    return new Date().toLocaleDateString('es-GT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  get labelEspecialidad(): string {
    if (!this.filtros.especialidad) return 'Todas las Especialidades';
    const esp = this.especialidadesList.find(
      (e) => e.value === this.filtros.especialidad
    );
    return esp ? esp.label : this.filtros.especialidad;
  }

  // ======= CICLO DE VIDA =======
  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['especialidad']) this.filtros.especialidad = params['especialidad'];
      if (params['fecha_cita']) this.filtros.fecha_cita = params['fecha_cita'];
      this.cargarCitas();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ======= CARGA =======
  cargarCitas(): void {
    this.cargando = true;
    this.api.getCitas(this.filtros).pipe(takeUntil(this.destroy$)).subscribe({
      next: resultado => {

        this.citas = resultado.citas;

        this.cargando = false;
        // Ajustar página si el backend devolvió menos de lo esperado

        this.cdr.markForCheck();
      },
      error: error => {
        console.error('Error al cargar citas:', error);
        this.cargando = false;
        this.cdr.markForCheck();
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }

  limpiarFiltros(): void {
    this.filtros = {
      expediente: '',
      especialidad: '',
      fecha_cita: this.hoy(),
      limit: 500,
    };
    this.cargarCitas();
  }

  imprimir(): void {
    const body = document.body;
    const html = document.documentElement;

    // Guardar estilos originales
    const bodyOverflow = body.style.overflow;
    const bodyHeight = body.style.height;
    const htmlOverflow = html.style.overflow;
    const htmlHeight = html.style.height;

    // Liberar para impresión
    body.style.overflow = 'visible';
    body.style.height = 'auto';
    html.style.overflow = 'visible';
    html.style.height = 'auto';

    setTimeout(() => {
      window.print();

      // Restaurar después de imprimir
      body.style.overflow = bodyOverflow;
      body.style.height = bodyHeight;
      html.style.overflow = htmlOverflow;
      html.style.height = htmlHeight;
    }, 100);
  }

  volver(): void {
    this.location.back();
  }

  // ======= UTILIDADES =======
  trackById(_index: number, cita: Citas): number {
    return cita.id;
  }

  get totalCitas(): number {
    return this.citas.length;
  }

  nombreCompleto(cita: Citas): string {
    const n = cita.paciente.nombre;
    return [
      n.primer_nombre,
      n.segundo_nombre,
      n.otro_nombre,
      n.primer_apellido,
      n.segundo_apellido,
      n.apellido_casada,
    ]
      .filter(Boolean)
      .join(' ')
      .toUpperCase();
  }
}
