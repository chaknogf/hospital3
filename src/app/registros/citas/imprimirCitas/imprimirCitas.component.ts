import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Citas } from '../../../interface/citas';
import { CitaService } from '../cita.service';
import { DatosExtraPipe } from '../../../pipes/datos-extra.pipe';
import { Especialidades, KeyValue } from '../../../enum/especialidades';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-imprimir-citas',
  templateUrl: './imprimirCitas.component.html',
  styleUrls: ['./imprimirCitas.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, DatosExtraPipe],
})
export class ImprimirCitasComponent implements OnInit {
  // ======= INYECCIONES =======
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(CitaService);
  private location = inject(Location);

  // ======= ESTADO =======
  citas: Citas[] = [];
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
    // Leer parámetros de la URL si vienen preconfigurados
    this.route.queryParams.subscribe((params) => {
      if (params['especialidad']) this.filtros.especialidad = params['especialidad'];
      if (params['fecha_cita']) this.filtros.fecha_cita = params['fecha_cita'];
      this.cargarCitas();
    });
  }

  // ======= CARGA =======
  cargarCitas(): void {
    this.cargando = true;
    this.api.getCitas(this.filtros).subscribe({
      next: (data) => {
        this.citas = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      },
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

  // ======= ACCIONES =======
  imprimir(): void {
    window.print();
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
