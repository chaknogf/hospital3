import { CommonModule, Location } from '@angular/common';
import { Component, Input, OnInit, ViewChild, ElementRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { NacimientoOut, NacimientoCreate, NacimientoUpdate, NeonatalesPayload, PacienteResumen, NacimientoFormModel } from '../../../interface/nacimientos';
import { NacimientosService } from '../nacimientos.service';
import { ApiService } from '../../../service/api.service';
import { PacienteService } from '../../../registros/patient/paciente.service';
import { Paciente } from '../../../interface/interfaces';
import { ConstanciasService } from '../../../registros/nacimientos/constancias.service';
import { ConstanciaNacimiento } from '../../../registros/nacimientos/constancias.inteface';
import { DatosExtraPipe } from 'app/pipes/datos-extra.pipe';
import { LibrasOnzasPipe } from 'app/pipes/librasOnza.pipe';
import { CapitalizePipe } from 'app/pipes/capitalize.pipe';

@Component({
  selector: 'app-lista-nacimientos',
  templateUrl: './lista-nacimientos.component.html',
  styleUrls: ['./lista-nacimientos.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, DatosExtraPipe, LibrasOnzasPipe, CapitalizePipe]
})
export class ListaNacimientosComponent implements OnInit {
  @Input() sinEditar = false;
  @Input() rutaVolver = '/estadistica';

  private location = inject(Location);
  private api = inject(NacimientosService);

  @ViewChild('modalCard') set modalCardRef(el: ElementRef | undefined) {
    if (el) setTimeout(() => el.nativeElement.focus());
  }
  private router = inject(Router);
  private authApi = inject(ApiService);
  private pacienteApi = inject(PacienteService);
  private constanciaApi = inject(ConstanciasService);

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

  // Paciente detail modal
  mostrarPacienteModal = signal(false);
  pacienteDetalle = signal<Paciente | null>(null);
  cargandoPaciente = signal(false);

  // Constancia data inside paciente modal
  constanciaData = signal<ConstanciaNacimiento | null>(null);
  constanciaCargando = signal(false);
  constanciaError = signal(false);

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
    this.router.navigate([this.rutaVolver]);
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

    if (!this.editando() && !this.modelo.paciente_id) {
      this.modalError.set('El ID del paciente es requerido');
      return;
    }

    this.guardando.set(true);

    if (this.editando() && this.pacienteId && this.nacimientoId) {
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
              this.modalSuccess.set('Nacimiento actualizado exitosamente');
              this.guardando.set(false);
              this.cargarNacimientos();
              setTimeout(() => this.cerrarModal(), 1500);
            },
            error: () => {
              this.modalSuccess.set('Neonatales actualizados, error al actualizar registro');
              this.guardando.set(false);
              this.cargarNacimientos();
              setTimeout(() => this.cerrarModal(), 1500);
            }
          });
        },
        error: () => {
          this.modalError.set('Error al actualizar nacimiento');
          this.guardando.set(false);
        }
      });
    } else {
      const payload: NacimientoCreate = {
        paciente_id: this.modelo.paciente_id,
        madre_id: this.modelo.madre_id,
        mortinato: null
      };
      this.api.createNacimiento(payload).subscribe({
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

  eliminar(id: number, nombre: string | null | undefined): void {
    const respuesta = prompt(`Escriba "confirmar" para eliminar el nacimiento de "${nombre || 'desconocido'}" (ID: ${id}):`);
    if (respuesta !== 'confirmar') return;

    this.api.deleteNacimiento(id).subscribe({
      next: () => {
        this.cargarNacimientos();
      },
      error: () => {
        alert('Error al eliminar el nacimiento');
      }
    });
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
      mortinato: false,
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

  verPaciente(id: number | null | undefined): void {
    if (!id) return;
    this.cargandoPaciente.set(true);
    this.mostrarPacienteModal.set(true);
    this.pacienteDetalle.set(null);
    this.constanciaData.set(null);
    this.constanciaError.set(false);
    this.pacienteApi.getPaciente(id).subscribe({
      next: p => {
        this.pacienteDetalle.set(p);
        this.cargandoPaciente.set(false);
      },
      error: () => {
        this.cargandoPaciente.set(false);
      }
    });
    this.cargarConstancia(id);
  }

  private cargarConstancia(pacienteId: number): void {
    this.constanciaCargando.set(true);
    this.constanciaError.set(false);
    this.constanciaData.set(null);
    this.constanciaApi.getConstanciaByPacienteId(pacienteId).subscribe({
      next: c => {
        this.constanciaData.set(c);
        this.constanciaCargando.set(false);
      },
      error: () => {
        this.constanciaCargando.set(false);
        this.constanciaError.set(true);
      }
    });
  }

  madreNombre(madre: Paciente | null | undefined): string {
    if (!madre?.nombre) return '—';
    const n = madre.nombre;
    const parts = [n.primer_nombre, n.segundo_nombre, n.otro_nombre, n.primer_apellido, n.segundo_apellido];
    const nombre = parts.filter(Boolean).join(' ');
    if (n.apellido_casada) return `${nombre} de ${n.apellido_casada}`;
    return nombre || '—';
  }

  cerrarPacienteModal(): void {
    this.mostrarPacienteModal.set(false);
    this.pacienteDetalle.set(null);
    this.constanciaData.set(null);
    this.constanciaError.set(false);
  }

  filtrarDatosExtra(obj: Record<string, any> | null | undefined): { key: string; valor: any }[] {
    if (!obj) return [];
    return Object.entries(obj)
      .filter(([, valor]) => valor !== null && valor !== undefined && valor !== '' && valor !== 0)
      .map(([key, valor]) => ({ key, valor }));
  }

  convertirClave(key: string): string {
    const mapa: Record<string, string> = {
      idioma: 'Idioma',
      pueblo: 'Pueblo',
      nacionalidad: 'Nacionalidad',
      lugar_nacimiento: 'Lugar de nacimiento',
      departamento_nacimiento: 'Departamento de nacimiento',
      vecindad: 'Vecindad',
      estado_civil: 'Estado civil',
      ocupacion: 'Ocupación',
      educacion: 'Nivel educativo',
      estudiante_publico: 'Estudiante público',
      personal_hospital: 'Personal del hospital',
      discapacidad: 'Discapacidad',
      peso_nacimiento: 'Peso al nacimiento',
      edad_gestacional: 'Edad gestacional',
      tipo_parto: 'Tipo de parto',
      clase_parto: 'Clase de parto',
      gemelo: 'Gemelo',
      hora_nacimiento: 'Hora de nacimiento',
      extrahospitalario: 'Extrahospitalario',
      expediente_madre: 'Expediente madre',
      personaid: 'ID Persona',
      defuncion: 'Defunción',
    };
    return mapa[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  sexoLabel(s: string | null | undefined): string {
    if (s === 'M') return 'Masculino';
    if (s === 'F') return 'Femenino';
    return '—';
  }

  descargarExcel(): void {
    if (!this.filtros.fecha_desde || !this.filtros.fecha_hasta) {
      alert('Debe seleccionar un rango de fechas para descargar el Excel.');
      return;
    }
    if (this.filtros.fecha_desde > this.filtros.fecha_hasta) {
      alert('La fecha "desde" no puede ser mayor que la fecha "hasta".');
      return;
    }
    this.api.getAllNacimientos(this.filtros).subscribe({
      next: data => {
        if (!data.length) {
          alert('No hay registros para exportar en el rango seleccionado.');
          return;
        }
        const rows = data.map(n => ({
          ID: n.id,
          Expediente: n.paciente?.expediente || '',
          Neonato: n.paciente?.nombre_completo || '',
          Sexo: this.sexoLabel(n.paciente?.sexo),
          Estado: n.paciente?.estado || '',
          'Fecha Nacimiento': n.paciente?.fecha_nacimiento || '',
          'Hora Nacimiento': n.neonatales?.hora_nacimiento || '',
          'Peso (g)': n.neonatales?.peso_nacimiento || n.peso_gramos || '',
          'Edad Gestacional': n.neonatales?.edad_gestacional || '',
          'Tipo Parto': n.neonatales?.tipo_parto || '',
          'Clase Parto': n.neonatales?.clase_parto || '',
          Gemelo: n.neonatales?.gemelo || '',
          Clasificación: n.clasificacion_nacimiento || '',
          'Trabajo Parto': n.trabajo_parto || '',
          Extrahospitalario: n.neonatales?.extrahospitalario ? 'Sí' : 'No',
          'Nombre Madre': n.nombre_madre || '',
          'ID Paciente': n.paciente_id ?? '',
          'ID Madre': n.madre_id ?? ''
        }));

        const ws = XLSX.utils.json_to_sheet(rows);
        const colWidths = Object.keys(rows[0] || {}).map(k => ({ wch: Math.max(k.length, 18) }));
        ws['!cols'] = colWidths;
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Nacimientos');
        XLSX.writeFile(wb, `nacimientos_${new Date().toISOString().slice(0, 10)}.xlsx`);
      },
      error: err => {
        console.error('Error al descargar Excel:', err);
        alert('Error al descargar el Excel. Verifique los filtros e intente de nuevo.');
      }
    });
  }
}
