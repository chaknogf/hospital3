import { Console } from 'console';
// pacientes.component.ts
import { Component, OnInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../service/api.service';
import { Paciente, Renap, Totales } from '../../../interface/interfaces';
import { IconService } from '../../../service/icon.service';
import { PacienteFiltros } from '../../../interface/filtros.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EdadPipe } from '../../../pipes/edad.pipe';
import { DatosExtraPipe } from '../../../pipes/datos-extra.pipe';
import { CuiPipe } from '../../../pipes/cui.pipe';

@Component({
  selector: 'app-pacientes',
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, EdadPipe, DatosExtraPipe, CuiPipe]
})
export class PacientesComponent implements OnInit {

  // ── Datos ──────────────────────────────────────────────────
  pacientes: Paciente[] = [];
  enRenap: Renap[] = [];
  existePaciente = false;

  // ── UI ─────────────────────────────────────────────────────
  cargando = false;
  filtrar = false;
  visible = false;
  modalActivo = false;
  espacio = ' ';

  // ── Paginación con skip/limit del backend ──────────────────
  readonly pageSize = 8;
  paginaActual = 1;
  totalDeRegistros = 0;   // total real que devuelve el backend

  get totalPaginas(): number {
    return Math.ceil(this.totalDeRegistros / this.pageSize) || 1;
  }

  get hayPaginaAnterior(): boolean { return this.paginaActual > 1; }
  get hayPaginaSiguiente(): boolean { return this.paginaActual < this.totalPaginas; }

  // ── Filtros ────────────────────────────────────────────────
  filtros: PacienteFiltros = {
    skip: 0,
    limit: this.pageSize,
    q: '',
    id: '',
    cui: '',
    expediente: '',
    nombre: '',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    sexo: '',
    fecha_nac: '',
    estado: ''
  };

  // ── Modal admisión ─────────────────────────────────────────
  pacienteSeleccionado = 0;
  @ViewChild('dialogAdmision') dialog!: ElementRef<HTMLDialogElement>;

  optionsTipoConsulta = [
    { nombre: 'Coex', valor: 1, icon: '🏥' },
    { nombre: 'Emergencia', valor: 2, icon: '🚨' },
    { nombre: 'Ingreso', valor: 3, icon: '🛏️' }
  ];

  // ── Icons ──────────────────────────────────────────────────
  icons: { [key: string]: any } = {};

  constructor(
    private api: ApiService,
    private router: Router,
    private iconService: IconService
  ) {
    this.icons = {
      editPerson: this.iconService.getIcon('editPerson'),
      addExpediente: this.iconService.getIcon('addExpediente'),
      addPerson: this.iconService.getIcon('addPerson'),
      search: this.iconService.getIcon('searchIcon'),
      delete: this.iconService.getIcon('deletInput'),
      create: this.iconService.getIcon('createIcon'),
      edit: this.iconService.getIcon('editIcon'),
      trash: this.iconService.getIcon('trashIcon'),
      tabla: this.iconService.getIcon('tablaShanonIcon'),
      medical: this.iconService.getIcon('medicalServiceIcon'),
      man: this.iconService.getIcon('manIcon'),
      woman: this.iconService.getIcon('womanIcon'),
      beat: this.iconService.getIcon('beatIcon'),
      ghost: this.iconService.getIcon('ghostIcon'),
      heart: this.iconService.getIcon('heartIcon'),
      paw: this.iconService.getIcon('huellitaIcon'),
      find: this.iconService.getIcon('findIcon'),
      menu: this.iconService.getIcon('menuPuntos'),
      arrowDown: this.iconService.getIcon('arrowDown'),
      skipLeft: this.iconService.getIcon('skipLeft'),
      skipRight: this.iconService.getIcon('skipRight'),
    };
  }

  // ══════════════════════════════════════════════════════════
  ngOnInit(): void {
    // El BehaviorSubject actualiza la tabla cuando el servicio refresca
    this.api.pacientes$.subscribe(data => { this.pacientes = data; });
    this.cargarPacientes();
  }

  // ══════════════════════════════════════════════════════════
  // CARGA — usa skip/limit del backend
  // ══════════════════════════════════════════════════════════
  cargarPacientes(): void {
    this.cargando = true;

    this.api.getPacientes(this.filtros).subscribe({

      next: resultado => {
        // console.log('Cargando pacientes con filtros:', this.filtros);
        // El backend devuelve { total, pacientes[] }
        this.totalDeRegistros = resultado.total;
        // pacientes se actualiza via BehaviorSubject en api.service
        // pero por si acaso también lo asignamos directo:

        this.pacientes = resultado.pacientes;

        // Ajustar página si el backend devolvió menos de lo esperado
        if (this.paginaActual > this.totalPaginas) {
          this.paginaActual = this.totalPaginas;
        }
      },
      error: err => {
        console.error('Error cargando pacientes:', err);
        this.pacientes = [];
        this.totalDeRegistros = 0;
      },
      complete: () => { this.cargando = false; }
    });
  }

  // ══════════════════════════════════════════════════════════
  // PAGINACIÓN
  // ══════════════════════════════════════════════════════════
  cambiarPagina(paso: number): void {
    const nueva = this.paginaActual + paso;
    if (nueva < 1 || nueva > this.totalPaginas) return;

    this.paginaActual = nueva;
    this.filtros.skip = (this.paginaActual - 1) * this.pageSize;
    this.filtros.limit = this.pageSize;
    this.cargarPacientes();
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.filtros.skip = (pagina - 1) * this.pageSize;
    this.filtros.limit = this.pageSize;
    this.cargarPacientes();
  }

  // ══════════════════════════════════════════════════════════
  // BÚSQUEDA Y FILTROS
  // ══════════════════════════════════════════════════════════
  buscar(): void {
    this.paginaActual = 1;
    this.filtros.skip = 0;
    this.filtros.limit = this.pageSize;
    this.cargarPacientes();
    // console.log('Filtros aplicados:', this.filtros);
  }

  limpiarFiltros(): void {
    this.filtros = {
      skip: 0, limit: this.pageSize,
      q: '',
      id: '', cui: '', expediente: '', nombre: '',
      sexo: '',
      fecha_nac: '', referencias: '', estado: ''
    };
    this.paginaActual = 1;
    this.cargarPacientes();
  }

  toggleFiltrar(): void { this.filtrar = !this.filtrar; }

  // ══════════════════════════════════════════════════════════
  // ACCIONES DE PACIENTE
  // ══════════════════════════════════════════════════════════
  editarPaciente(id: number): void { this.router.navigate(['/pacienteEdit', id]); }
  agregar(): void { this.router.navigate(['/paciente']); }
  agregarConExpediente(): void { this.router.navigate(['/paciente', true]); }
  verDetallesPaciente(id: number): void { this.router.navigate(['/detallePaciente', id]); }
  volver(): void { this.router.navigate(['/registros']); }

  eliminarPaciente(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este paciente?')) {
      this.api.deletePaciente(id);
    }
  }

  // ══════════════════════════════════════════════════════════
  // MODAL ADMISIÓN
  // ══════════════════════════════════════════════════════════
  abrirModalAdmision(id: number): void {
    this.pacienteSeleccionado = id;
    this.dialog.nativeElement.showModal();
  }

  admision(opt: number, id: number): void {
    const rutas: Record<number, [string, string]> = {
      1: ['coex', 'coex'],
      2: ['emergencia', 'emergencia'],
      3: ['ingreso', 'ingreso'],
    };
    const [tipo, origen] = rutas[opt] ?? ['coex', 'coex'];

    this.router.navigate(
      ['/admisionPaciente', tipo, id],
      { queryParams: { origen } }
    );
    this.dialog.nativeElement.close();
  }

  // ══════════════════════════════════════════════════════════
  // UI HELPERS
  // ══════════════════════════════════════════════════════════
  mostrar(): void { this.visible = !this.visible; }

  rowActiva: number | null = null;
  activarFila(id: number): void {
    this.rowActiva = this.rowActiva === id ? null : id;
  }

  // Genera array de páginas para mostrar en el paginador
  get paginas(): number[] {
    const total = this.totalPaginas;
    const actual = this.paginaActual;
    const delta = 2; // páginas a cada lado de la actual

    const rango: number[] = [];
    for (let i = Math.max(1, actual - delta); i <= Math.min(total, actual + delta); i++) {
      rango.push(i);
    }
    return rango;
  }
}
