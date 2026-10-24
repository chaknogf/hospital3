import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConsultaResponse } from '../../interface/consultas';
import { CuiPipe } from '../../pipes/cui.pipe';
import { TimePipe } from '../../pipes/time.pipe';
import { IconService } from '../../service/icon.service';
import { ConsultaService } from '../../registros/consultas/consultas.service';
import { CicloService } from '../../medica/ciclo.service';
import { DatosExtraPipe } from '../../pipes/datos-extra.pipe';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/** Pestaña de la lista: tipo de consulta y, opcionalmente, un servicio concreto. */
interface ServicioLista {
  key: string;
  label: string;
  tipo: number;
  servicio: string | null;
}

@Component({
  selector: 'app-encamamiento',
  templateUrl: './encamamiento.component.html',
  styleUrls: ['./encamamiento.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CuiPipe, TimePipe, DatosExtraPipe]
})
/** Lista de pacientes activos por COEX, Emergencia y cada servicio de hospitalización. */
export class EncamamientoComponent implements OnInit, OnDestroy {

  private api = inject(ConsultaService);
  private cicloApi = inject(CicloService);
  private router = inject(Router);
  private iconService = inject(IconService);
  private cdr = inject(ChangeDetectorRef);

  private destroy$ = new Subject<void>();

  /** Pestañas fijas: Consulta Externa (tipo 1) y Emergencia (tipo 3). */
  private readonly serviciosBase: ServicioLista[] = [
    { key: 'coex', label: 'COEX', tipo: 1, servicio: null },
    { key: 'emer', label: 'Emergencia', tipo: 3, servicio: null },
  ];

  /** Servicios de tipo 2 sin área hospitalaria real: no generan pestaña. */
  private readonly serviciosOmitidos = ['SOPR', 'AROJ', 'OTRO', 'HOSPITALIZACION', 'EMER'];

  /** Servicios conocidos de tipo 2, usados si el backend no responde. */
  private readonly serviciosFallback = [
    'NEON', 'MATE', 'PEDA', 'GINI', 'CIHO', 'MEDI',
    'CIMU', 'MEMU', 'TRHO', 'MEHO', 'TRMU', 'UCIN', 'CRN_', 'UCIA',
  ];

  /**
   * Pestañas de la lista. Se arman con COEX, Emergencia y una por cada servicio
   * real de hospitalización (`tipo_consulta=2`) presente en las consultas.
   */
  serviciosLista: ServicioLista[] = [...this.serviciosBase];

  seleccionado = 'coex';
  conteosPorKey: Record<string, number> = {};

  consultas: ConsultaResponse[] = [];
  cargando = false;
  filtrar = false;
  modalActivo = false;
  pageSize = 8;
  paginaActual = 1;
  totalDeRegistros = 0;
  rowActiva: number | null = null;

  /** Estados no encamados: salidas (egreso/archivo/referido/fallecido) y aún-en-recepción. */
  private readonly estadosExcluidos = 'egreso,archivo,referido,fallecido,recepcion';

  filtros: any = {
    skip: 0,
    limit: this.pageSize,
    expediente: '',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    fecha: '',
    ultimo_estado: '',
    archivo: false,
    identificador: '',
    excluir_estados: this.estadosExcluidos,
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
      notaUisau: this.iconService.getIcon("notaMedica"),
      historiaUisau: this.iconService.getIcon("historiaMedicaIcon"),
    };
  }

  ngOnInit(): void {
    this.cargarServicios();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ══════════════════════════════════════════════════════════
  // CARGA
  // ══════════════════════════════════════════════════════════

  /** Pestaña activa; nunca es nula (arranca en COEX mientras se resuelven los servicios). */
  get servicioActual(): ServicioLista {
    return (
      this.serviciosLista.find(s => s.key === this.seleccionado) ??
      this.serviciosLista[0] ?? { key: 'coex', label: 'COEX', tipo: 1, servicio: null }
    );
  }

  /** Arma las pestañas: COEX, Emergencia y los servicios reales de hospitalización. */
  private cargarServicios(): void {
    this.api
      .getServiciosPorTipo({ tipo_consulta: 2, archivo: false, excluir_estados: this.estadosExcluidos })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: filas => {
          this.construirPestanas(filas.map(f => f.servicio));
          this.iniciarLista();
        },
        error: () => {
          this.construirPestanas(this.serviciosFallback);
          this.iniciarLista();
        }
      });
  }

  /** Construye `serviciosLista` a partir de los servicios de tipo 2 reportados. */
  private construirPestanas(servicios: (string | null)[]): void {
    const pestañas: ServicioLista[] = [...this.serviciosBase];
    const vistos = new Set(pestañas.map(p => p.key));

    for (const raw of servicios) {
      const code = (raw ?? '').trim();
      if (!code || this.serviciosOmitidos.includes(this.normalizar(code))) continue;
      const key = `svc:${code}`;
      if (vistos.has(key)) continue;
      vistos.add(key);
      pestañas.push({ key, label: code, tipo: 2, servicio: code });
    }

    // Sin servicios de hospitalización (o error): cae al catálogo conocido.
    if (pestañas.length === this.serviciosBase.length) {
      for (const code of this.serviciosFallback) {
        const key = `svc:${code}`;
        if (vistos.has(key)) continue;
        vistos.add(key);
        pestañas.push({ key, label: code, tipo: 2, servicio: code });
      }
    }

    this.serviciosLista = pestañas;
  }

  /** Selecciona el primer servicio de hospitalización y hace la carga inicial. */
  private iniciarLista(): void {
    const primero =
      this.serviciosLista.find(s => s.tipo === 2) ?? this.serviciosLista[0];
    this.seleccionado = primero.key;
    this.cargarConsultas();
    this.cargarConteos();
  }

  private normalizar(valor: string): string {
    return valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toUpperCase();
  }

  cargarConsultas(): void {
    this.cargando = true;
    const sel = this.servicioActual;
    const params: any = { ...this.filtros, tipo_consulta: sel.tipo };
    if (sel.servicio) params.servicio = sel.servicio;

    this.api.getConsultas(params).pipe(takeUntil(this.destroy$)).subscribe({
      next: resultado => {
        this.totalDeRegistros = resultado.total;
        this.consultas = resultado.consultas;
        this.cargarEstadosUisau(resultado.consultas);
        this.cdr.markForCheck();
      },
      error: err => {
        console.error('Error cargando consultas:', err);
        this.consultas = [];
        this.totalDeRegistros = 0;
        this.cdr.markForCheck();
      },
      complete: () => { this.cargando = false; }
    });
  }

  /** Totales por pestaña de servicio (una petición ligera por pestaña). */
  cargarConteos(): void {
    const conteos: Record<string, number> = {};
    const pendientesIniciales = this.serviciosLista.length;
    if (pendientesIniciales === 0) {
      this.conteosPorKey = conteos;
      return;
    }
    let pendientes = pendientesIniciales;

    this.serviciosLista.forEach(({ key, tipo, servicio }) => {
      const params: any = {
        skip: 0,
        limit: 1,
        archivo: false,
        excluir_estados: this.estadosExcluidos,
        tipo_consulta: tipo,
      };
      if (servicio) params.servicio = servicio;

      this.api.getConsultas(params).pipe(takeUntil(this.destroy$)).subscribe({
        next: r => { conteos[key] = r.total; this.cdr.markForCheck(); },
        error: () => { conteos[key] = 0; },
        complete: () => {
          pendientes--;
          if (pendientes === 0) {
            this.conteosPorKey = conteos;
            this.cdr.markForCheck();
          }
        }
      });
    });
  }

  /**
   * Completa el indicador de nota UISAU en cada fila.
   * El backend ya lo envía en `tiene_uisau`; si el campo no llega (servicio desactualizado),
   * se resuelve con una consulta de ciclos por consulta.
   */
  private cargarEstadosUisau(filas: ConsultaResponse[]): void {
    const sinFlag = filas.filter(f => f.tiene_uisau === undefined || f.tiene_uisau === null);
    if (sinFlag.length === 0) return;

    sinFlag.forEach(fila => {
      this.cicloApi.getCiclosDeConsulta(fila.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: ciclos => {
          fila.tiene_uisau = Array.isArray(ciclos) && ciclos.some(c => c?.uisau);
          this.cdr.markForCheck();
        },
        error: () => { /* sin indicador */ }
      });
    });
  }

  // ══════════════════════════════════════════════════════════
  // SERVICIOS / FILTROS
  // ══════════════════════════════════════════════════════════

  /** Cambia la pestaña de servicio (por tipo de consulta y/o servicio concreto). */
  seleccionarServicio(key: string): void {
    if (this.seleccionado === key) return;
    this.seleccionado = key;
    this.paginaActual = 1;
    this.filtros.skip = 0;
    this.cargarConsultas();
  }

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
      expediente: '',
      primer_nombre: '',
      segundo_nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      fecha: '',
      ultimo_estado: '',
      archivo: false,
      identificador: '',
      excluir_estados: this.estadosExcluidos,
    };
    this.paginaActual = 1;
    this.cargarConsultas();
    this.cargarConteos();
  }

  // ══════════════════════════════════════════════════════════
  // PAGINACIÓN
  // ══════════════════════════════════════════════════════════

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
  // NAVEGACIÓN
  // ══════════════════════════════════════════════════════════

  editar(id: number): void { this.router.navigate(['/editarAdmision', id, 'ingreso']); }
  agregar(): void { this.router.navigate(['/registros/pacientes']); }
  verDetalle(consultaId: number): void {
    this.router.navigate(['/detalleAdmision', consultaId], { queryParams: { origen: 'ingreso' } });
  }
  imprimir(consultaId: number): void { this.router.navigate(['/ingreso', consultaId]); }
  volver(): void { this.router.navigate(['/uisau/consultar']); }

  /** Abre el registro de la nota UISAU para la consulta seleccionada. */
  agregarNotaUisau(consultaId: number): void {
    this.router.navigate(['/uisau', 'nota', consultaId]);
  }

  /** Abre la historia UISAU del paciente (pestaña "Historia" de la página unificada). */
  verHistoriaUisau(pacienteId?: number | null): void {
    if (!pacienteId) return;
    this.router.navigate(['/uisau', 'nota', 'paciente', pacienteId]);
  }

  // ══════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════

  trackById(index: number, item: any): any {
    return item.id ?? index;
  }
}
