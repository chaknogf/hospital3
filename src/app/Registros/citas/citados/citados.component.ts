import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CitaResponse } from '../../../interface/citas';
import { ApiService } from '../../../service/api.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-citados',
  templateUrl: './citados.component.html',
  styleUrls: ['./citados.component.css']
})
export class CitadosComponent implements OnInit {
  // ======= INYECCIONES =======
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  // ======= ESTADO =======
  citas: CitaResponse[] = [];
  citasFiltradas: CitaResponse[] = [];
  citaSeleccionada: CitaResponse | null = null;
  cargando = false;
  filtrar = false;
  visible = false;

  // ======= FILTROS =======
  filtros: any = {
    id: 0,
    expediente: '',
    paciente_id: 0,
    especialidad: '',
    fecha: '',
    limit: 200,
  };

  filtroForm: FormGroup = this.fb.group({
    expediente: [''],
    especialidad: [''],
    fecha: [''],
  });

  constructor() { }

  // ======= CICLO DE VIDA =======
  ngOnInit(): void {
    this.cargarCitas();
  }

  // ======= CARGA DE DATOS =======
  cargarCitas(): void {
    this.cargando = true;
    this.api.getCitas(this.filtros).subscribe({
      next: (data) => {
        this.citas = data;
        this.citasFiltradas = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar citas:', error);
        this.cargando = false;
      },
    });
  }

  // ======= FILTRADO =======
  aplicarFiltros(): void {
    const { expediente, especialidad, fecha } = this.filtroForm.value;

    this.filtros = {
      ...this.filtros,
      expediente: expediente ?? '',
      especialidad: especialidad ?? '',
      fecha: fecha ?? '',
    };

    this.cargarCitas();
  }

  limpiarFiltros(): void {
    this.filtroForm.reset();
    this.filtros = {
      id: 0,
      expediente: '',
      paciente_id: 0,
      especialidad: '',
      fecha: '',
      limit: 200,
    };
    this.cargarCitas();
  }

  toggleFiltros(): void {
    this.filtrar = !this.filtrar;
  }

  // ======= SELECCIÓN / DETALLE =======
  verDetalle(cita: CitaResponse): void {
    this.citaSeleccionada = cita;
    this.visible = true;
  }

  cerrarDetalle(): void {
    this.citaSeleccionada = null;
    this.visible = false;
  }

  // ======= NAVEGACIÓN =======
  nuevaCita(): void {
    this.router.navigate(['nueva'], { relativeTo: this.route });
  }

  editarCita(id: number): void {
    this.router.navigate(['editar', id], { relativeTo: this.route });
  }

  // ======= ELIMINACIÓN =======
  // eliminarCita(id: number): void {
  //   if (!confirm('¿Está seguro de eliminar esta cita?')) return;

  //   this.api.deleteCita(id).subscribe({
  //     next: () => {
  //       this.citas = this.citas.filter((c) => c.id !== id);
  //       this.citasFiltradas = this.citasFiltradas.filter((c) => c.id !== id);
  //       if (this.citaSeleccionada?.id === id) this.cerrarDetalle();
  //     },
  //     error: (error) => console.error('Error al eliminar cita:', error),
  //   });
  // }

  // ======= UTILIDADES =======
  trackById(_index: number, cita: CitaResponse): number {
    return cita.id;
  }

  get totalCitas(): number {
    return this.citasFiltradas.length;
  }
}
