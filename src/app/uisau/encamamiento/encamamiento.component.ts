import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Dict, ciclos, especialidadesConsulta, servicios } from '../../enum/diccionarios';
import { ConsultaResponse } from '../../interface/consultas';
import { Totales, Paciente } from '../../interface/interfaces';
import { CuiPipe } from '../../pipes/cui.pipe';
import { TimePipe } from '../../pipes/time.pipe';
import { IconService } from '../../service/icon.service';
import { ConsultaService } from '../../registros/consultas/consultas.service';
import { DatosExtraPipe } from '../../pipes/datos-extra.pipe';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-encamamiento',
  templateUrl: './encamamiento.component.html',
  styleUrls: ['./encamamiento.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CuiPipe, TimePipe, DatosExtraPipe]
})
export class EncamamientoComponent implements OnInit, OnDestroy {

  private location = inject(Location);
  private api = inject(ConsultaService);
  private router = inject(Router);
  private iconService = inject(IconService);

  private destroy$ = new Subject<void>();

  esEmergencia = true;
  consultas: ConsultaResponse[] = [];
  totales: Totales[] = [];

  estadosValidos = [
    { label: 'Admisión', value: 'admision' },
    { label: 'Signos', value: 'signos' },
    { label: 'Consulta', value: 'consulta' },
    { label: 'Estudios', value: 'estudios' },
    { label: 'Tratamiento', value: 'tratamiento' },
    { label: 'Observación', value: 'observacion' },
    { label: 'Evolución', value: 'evolucion' },
    { label: 'Procedimiento', value: 'procedimiento' },
    { label: 'Recuperación', value: 'recuperacion' },
    { label: 'Referido', value: 'referido' },
    { label: 'Traslado', value: 'traslado' },
    { label: 'Préstamo', value: 'prestamo' },
    { label: 'Actualizado', value: 'actualizado' },
    { label: 'Descartado', value: 'descartado' },
    { label: 'Reprogramado', value: 'reprogramado' },
    // excluidos: archivo, recepcion, egreso
  ];

  serviciosIngreso: Dict[] = servicios.filter(s => s.ref === 'ingreso');

  // ── Mapa de consultas y conteos por servicio ──────────────────
  consultasPorServicio: Record<string, ConsultaResponse[]> = {};
  conteosPorServicio: Record<any, any> = {};

  // ✅ después
  especialidadesIngreso: Dict[] = especialidadesConsulta; // todas, sin filtrar
  consultasPorEspecialidad: Record<string, ConsultaResponse[]> = {};
  conteosPorEspecialidad: Record<any, any> = {};

  paciente: Paciente | null = null;
  public status: 'activo' | 'inactivo' | 'none' = 'none';
  cargando = false;
  cargandoConteos = false;
  filtrar = false;
  visible = false;
  modalActivo = false;
  espacio: string = ' ';
  pageSize: number = 8;
  skip: number = 0;
  tipoConsultas: number = 2;
  paginaActual: number = 1;
  finPagina: boolean = false;
  totalDeRegistros = 0;
  porcentajeDeCarga = 0;
  ciclos: Dict[] = ciclos;

  filtros: any = {
    skip: 0,
    limit: this.pageSize,
    tipo_consulta: 2,
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    fecha: '',
    ciclo: '',
    archivo: false,
    ultimo_estado: '',
    especialidad: '',
    servicio: '',
    identificador: '',
  };

  icons: { [key: string]: any } = {};

  constructor() {
    this.icons = {
      docuento: this.iconService.getIcon("documentoIcon"),
      activo: this.iconService.getIcon("activoIcon"),
      search: this.iconService.getIcon("searchIcon"),
      delete: this.iconService.getIcon("deletInput"),
      create: this.iconService.getIcon("createIcon"),
      edit: this.iconService.getIcon("editIcon"),
      trash: this.iconService.getIcon("trashIcon"),
      tabla: this.iconService.getIcon("tablaShanonIcon"),
      medical: this.iconService.getIcon("medicalServiceIcon"),
      man: this.iconService.getIcon("manIcon"),
      woman: this.iconService.getIcon("womanIcon"),
      paw: this.iconService.getIcon("huellitaIcon"),
      find: this.iconService.getIcon("findIcon"),
      menu: this.iconService.getIcon("menuIcon"),
      arrowDown: this.iconService.getIcon("arrowDown"),
      skipLeft: this.iconService.getIcon("skipLeft"),
      skipRight: this.iconService.getIcon("skipRight"),
      print: this.iconService.getIcon("printIcon"),
    };
  }

  ngOnInit(): void {
    this.api.consultas$.pipe(takeUntil(this.destroy$)).subscribe(data => { this.consultas = data; });
    this.cargarConsultas();
    // this.cargarTodosPorServicio();
    this.cargarTodosPorEspecialidad();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ══════════════════════════════════════════════════════════
  // CARGA PRINCIPAL
  // ══════════════════════════════════════════════════════════

  cargarConsultas(): void {
    this.cargando = true;
    this.api.getConsultas(this.filtros).pipe(takeUntil(this.destroy$)).subscribe({
      next: resultado => {
        this.totalDeRegistros = resultado.total;
        this.consultas = resultado.consultas;
        if (this.paginaActual > this.totalPaginas) {
          this.paginaActual = this.totalPaginas;
        }
      },
      error: err => {
        console.error('Error cargando consultas:', err);
        this.consultas = [];
        this.totalDeRegistros = 0;
      },
      complete: () => { this.cargando = false; }
    });
  }

  // ══════════════════════════════════════════════════════════
  // CARGA POR SERVICIO (una vez al init)
  // ══════════════════════════════════════════════════════════

  cargarTodosPorServicio(): void {
    this.cargandoConteos = true;
    let pendientes = this.serviciosIngreso.length;

    this.serviciosIngreso.forEach(servicio => {
      const filtro = {
        tipo_consulta: 2,
        servicio: servicio.value,
        archivo: false,
        skip: 0,
        limit: 200
      };

      this.api.getConsultas(filtro).pipe(takeUntil(this.destroy$)).subscribe({
        next: resultado => {
          this.consultasPorServicio[servicio.value] = resultado.consultas;
          this.conteosPorServicio[servicio.value] = resultado.total;
        },
        error: () => {
          this.consultasPorServicio[servicio.value] = [];
          this.conteosPorServicio[servicio.value] = 0;
        },
        complete: () => {
          pendientes--;
          if (pendientes === 0) this.cargandoConteos = false;
        }
      });
    });
  }

  // ══════════════════════════════════════════════════════════
  // CARGA POR ESPECIALIDAD (una vez al init)
  // ══════════════════════════════════════════════════════════

  cargarTodosPorEspecialidad(): void {
    this.cargandoConteos = true;
    let pendientes = this.especialidadesIngreso.length;

    this.especialidadesIngreso.forEach(esp => {
      const filtro = {
        tipo_consulta: 2,
        especialidad: esp.value,  // ← especialidad, no servicio
        archivo: false,
        skip: 0,
        limit: 10
      };

      this.api.getConsultas(filtro).pipe(takeUntil(this.destroy$)).subscribe({
        next: resultado => {
          this.consultasPorEspecialidad[esp.value] = resultado.consultas;
          this.conteosPorEspecialidad[esp.value] = resultado.total;
        },
        error: () => {
          this.consultasPorEspecialidad[esp.value] = [];
          this.conteosPorEspecialidad[esp.value] = 0;
        },
        complete: () => {
          pendientes--;
          if (pendientes === 0) this.cargandoConteos = false;
        }
      });
    });
  }

  seleccionarEspecialidad(value: string): void {
    this.filtros.especialidad = value;  // ← especialidad
    this.filtros.servicio = '';         // limpiar servicio al cambiar especialidad
    this.paginaActual = 1;
    this.filtros.skip = 0;

    if (value === '') {
      this.cargarConsultas();
    } else {
      this.consultas = this.consultasPorEspecialidad[value] ?? [];
      this.totalDeRegistros = this.conteosPorEspecialidad[value] ?? 0;
    }
  }

  // ══════════════════════════════════════════════════════════
  // SELECCIÓN DE SERVICIO
  // ══════════════════════════════════════════════════════════

  seleccionarServicio(value: string): void {
    this.filtros.servicio = value;
    this.paginaActual = 1;
    this.filtros.skip = 0;

    if (value === '') {
      // Todos → llamada normal al backend con filtros actuales
      this.cargarConsultas();
    } else {
      // Servicio específico → usar datos ya en memoria
      this.consultas = this.consultasPorServicio[value] ?? [];
      this.totalDeRegistros = this.conteosPorServicio[value] ?? 0;
    }
  }

  // ══════════════════════════════════════════════════════════
  // PAGINACIÓN
  // ══════════════════════════════════════════════════════════

  rowActiva: number | null = null;
  activarFila(id: number): void {
    this.rowActiva = this.rowActiva === id ? null : id;
  }

  get totalPaginas(): number {
    return Math.ceil(this.totalDeRegistros / this.pageSize) || 1;
  }

  get hayPaginaAnterior(): boolean { return this.paginaActual > 1; }
  get hayPaginaSiguiente(): boolean { return this.paginaActual < this.totalPaginas; }

  cambiarPagina(paso: number): void {
    const nueva = this.paginaActual + paso;
    if (nueva < 1 || nueva > this.totalPaginas) return;
    this.paginaActual = nueva;
    this.filtros.skip = (this.paginaActual - 1) * this.pageSize;
    this.filtros.limit = this.pageSize;
    this.cargarConsultas();
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.filtros.skip = (pagina - 1) * this.pageSize;
    this.filtros.limit = this.pageSize;
    this.cargarConsultas();
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

  // ══════════════════════════════════════════════════════════
  // FILTROS
  // ══════════════════════════════════════════════════════════

  buscar(): void {
    this.filtros.skip = 0;
    this.paginaActual = 1;
    this.cargarConsultas();
  }

  toggleFiltrar(): void {
    this.filtrar = !this.filtrar;
  }

  limpiarFiltros(): void {
    this.filtros = {
      skip: 0,
      limit: this.pageSize,
      tipo_consulta: 2,
      primer_nombre: '',
      segundo_nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      fecha: '',
      ciclo: '',
      ultimo_estado: '',
      servicio: '',
      especialidad: '',
      archivo: false,
      identificador: ''
    };
    this.paginaActual = 1;
    this.cargarConsultas();
    // this.cargarTodosPorServicio();
    this.cargarTodosPorEspecialidad();
  }

  // ══════════════════════════════════════════════════════════
  // NAVEGACIÓN
  // ══════════════════════════════════════════════════════════

  editar(id: number): void { this.router.navigate(['/editarAdmision', id, 'ingreso']); }
  agregar(): void { this.router.navigate(['/pacientes']); }
  verDetalle(consultaId: number): void {
    this.router.navigate(['/detalleAdmision', consultaId], { queryParams: { origen: 'ingreso' } });
  }
  imprimir(consultaId: number): void { this.router.navigate(['/ingreso', consultaId]); }
  volver(): void { this.router.navigate(['/uisau']); }
  mostrar(): void { this.visible = !this.visible; }

  // ══════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════

  trackById(index: number, item: any): any {
    return item.id ?? index;
  }

  getCicloStatus(ciclo: Record<string, any>): 'activo' | 'inactivo' {
    if (!ciclo) return 'activo';
    const registros = Object.values(ciclo);
    if (registros.length === 0) return 'activo';
    registros.sort((a: any, b: any) =>
      new Date(b.registro).getTime() - new Date(a.registro).getTime()
    );
    const ultimo = registros[0];
    const encontrado = ciclos.find(c => c.value === ultimo.estado);
    return encontrado?.ref === 'inactivo' ? 'inactivo' : 'activo';
  }
}
