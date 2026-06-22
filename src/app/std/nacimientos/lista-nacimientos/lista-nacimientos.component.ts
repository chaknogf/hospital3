import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NacimientoOut, NacimientoCreate, NeonatalesPayload, PacienteResumen } from '../../../interface/nacimientos';
import { NacimientosService } from '../nacimientos.service';
import { ApiService } from '../../../service/api.service';
import { DatosExtraPipe } from 'app/pipes/datos-extra.pipe';
import { LibrasOnzasPipe } from 'app/pipes/librasOnza.pipe';

@Component({
  selector: 'app-lista-nacimientos',
  templateUrl: './lista-nacimientos.component.html',
  styleUrls: ['./lista-nacimientos.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, DatosExtraPipe, LibrasOnzasPipe]
})
export class ListaNacimientosComponent implements OnInit {
  private location = inject(Location);
  private api = inject(NacimientosService);
  private router = inject(Router);
  private authApi = inject(ApiService);

  get esAdmin(): boolean {
    return this.authApi.role() === 'admin';
  }

  nacimientos: NacimientoOut[] = [];
  cargando = false;
  filtrar = false;
  rowActiva: number | null = null;
  pageSize = 20;
  paginaActual = 1;
  totalDeRegistros = 0;

  filtros: any = {
    q: '',
    expediente: '',
    sexo: '',
    fecha_desde: '',
    fecha_hasta: '',
    clasificacion: '',
    trabajo_parto: '',
    skip: 0,
    limit: this.pageSize
  };

  // Modal state
  mostrarModal = signal(false);
  editando = signal(false);
  guardando = signal(false);
  modalError = signal<string | null>(null);
  modalSuccess = signal<string | null>(null);
  pacienteId: number | null = null;
  pacienteInfo: PacienteResumen | null = null;
  nombreMadre: string | null = null;
  nacimientoId: number | null = null;

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

  constructor() { }

  ngOnInit(): void {
    this.api.nacimientos$.subscribe(data => {
      this.nacimientos = data;
    });
    this.cargarNacimientos();
  }

  cargarNacimientos(): void {
    this.cargando = true;
    this.api.getNacimientos(this.filtros).subscribe({
      next: resultado => {
        this.nacimientos = resultado.nacimientos;
        this.totalDeRegistros = resultado.total;
        if (this.paginaActual > this.totalPaginas) {
          this.paginaActual = this.totalPaginas;
        }
      },
      error: () => {
        this.nacimientos = [];
        this.totalDeRegistros = 0;
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }

  buscar(): void {
    this.paginaActual = 1;
    this.filtros.skip = 0;
    this.cargarNacimientos();
  }

  limpiarFiltros(): void {
    this.paginaActual = 1;
    this.filtros = {
      q: '',
      expediente: '',
      sexo: '',
      fecha_desde: '',
      fecha_hasta: '',
      clasificacion: '',
      trabajo_parto: '',
      skip: 0,
      limit: this.pageSize
    };
    this.cargarNacimientos();
  }

  toggleFiltrar(): void {
    this.filtrar = !this.filtrar;
  }

  activarFila(id: number): void {
    this.rowActiva = this.rowActiva === id ? null : id;
  }

  volver(): void {
    this.router.navigate(['/estadistica']);
  }

  agregar(): void {
    this.resetFormulario();
    this.editando.set(false);
    this.mostrarModal.set(true);
  }

  editar(id: number): void {
    this.resetFormulario();
    this.editando.set(true);
    this.nacimientoId = id;
    this.mostrarModal.set(true);
    this.api.getNacimiento(id).subscribe({
      next: n => {
        this.pacienteId = n.paciente_id ?? null;
        this.pacienteInfo = n.paciente ?? null;
        this.nombreMadre = n.nombre_madre ?? null;
        this.modelo.paciente_id = n.paciente_id ?? null;
        this.modelo.madre_id = n.madre_id;
        this.modelo.expediente = n.paciente?.expediente ?? n.expediente;
        this.modelo.nombre_completo = n.paciente?.nombre_completo ?? n.nombre_completo;
        this.modelo.sexo = n.paciente?.sexo ?? n.sexo;
        this.modelo.fecha_nacimiento = n.paciente?.fecha_nacimiento ?? n.fecha_nacimiento;
        this.modelo.peso_nacimiento = n.neonatales?.peso_nacimiento;
        this.modelo.edad_gestacional = n.neonatales?.edad_gestacional;
        this.modelo.tipo_parto = n.neonatales?.tipo_parto;
        this.modelo.clase_parto = n.neonatales?.clase_parto;
        this.modelo.gemelo = n.neonatales?.gemelo;
        this.modelo.hora_nacimiento = n.neonatales?.hora_nacimiento;
        this.modelo.extrahospitalario = n.neonatales?.extrahospitalario ?? false;
      },
      error: () => {
        this.modalError.set('Error al cargar el nacimiento');
      }
    });
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.modalError.set(null);
    this.modalSuccess.set(null);
    this.guardando.set(false);
  }

  guardar(): void {
    this.modalError.set(null);
    this.modalSuccess.set(null);

    if (!this.modelo.nombre_completo?.trim()) {
      this.modalError.set('El nombre del neonato es requerido');
      return;
    }

    this.guardando.set(true);

    if (this.editando() && this.pacienteId) {
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
          this.modalSuccess.set('Nacimiento actualizado exitosamente');
          this.guardando.set(false);
          this.cargarNacimientos();
          setTimeout(() => this.cerrarModal(), 1500);
        },
        error: () => {
          this.modalError.set('Error al actualizar nacimiento');
          this.guardando.set(false);
        }
      });
    } else {
      this.api.createNacimiento(this.modelo).subscribe({
        next: () => {
          this.modalSuccess.set('Nacimiento registrado exitosamente');
          this.guardando.set(false);
          this.cargarNacimientos();
          setTimeout(() => this.cerrarModal(), 1500);
        },
        error: () => {
          this.modalError.set('Error al registrar nacimiento');
          this.guardando.set(false);
        }
      });
    }
  }

  private resetFormulario(): void {
    this.modelo = {
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
    this.pacienteId = null;
    this.pacienteInfo = null;
    this.nombreMadre = null;
    this.nacimientoId = null;
    this.modalError.set(null);
    this.modalSuccess.set(null);
  }

  get totalPaginas(): number {
    return Math.ceil(this.totalDeRegistros / this.pageSize) || 1;
  }

  get hayPaginaAnterior(): boolean {
    return this.paginaActual > 1;
  }

  get hayPaginaSiguiente(): boolean {
    return this.paginaActual < this.totalPaginas;
  }

  get paginas(): number[] {
    const total = this.totalPaginas;
    const actual = this.paginaActual;
    const delta = 2;
    const rango: number[] = [];
    for (let i = Math.max(1, actual - delta); i <= Math.min(total, actual + delta); i++) {
      rango.push(i);
    }
    return rango;
  }

  cambiarPagina(paso: number): void {
    const nueva = this.paginaActual + paso;
    if (nueva < 1 || nueva > this.totalPaginas) return;
    this.paginaActual = nueva;
    this.filtros.skip = (this.paginaActual - 1) * this.pageSize;
    this.filtros.limit = this.pageSize;
    this.cargarNacimientos();
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.filtros.skip = (pagina - 1) * this.pageSize;
    this.filtros.limit = this.pageSize;
    this.cargarNacimientos();
  }

  sexoLabel(s: string | null | undefined): string {
    if (s === 'M') return 'Masculino';
    if (s === 'F') return 'Femenino';
    return '—';
  }
}
