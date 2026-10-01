import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CensoCamasService } from './censo-camas.service';
import {
  CensoCamasOut,
  CensoCamasFiltros,
  CensoEstadisticaResponse,
  CensoEstadisticaServicio,
  HospitalizacionEspecialidadItem,
  HospitalizacionDiariaItem,
} from './censo-camas.interface';
import { Encamamiento } from '../../interface/interfaces';
import { ApiService } from '../../service/api.service';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-censo-camas-list',
  templateUrl: './censo-camas-list.component.html',
  styleUrls: ['./censo-camas-list.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, DecimalPipe]
})
/** Consulta censos diarios y sus resúmenes por fecha y servicio. */
export class CensoCamasListComponent implements OnInit, OnDestroy {

  private censoService = inject(CensoCamasService);
  private api = inject(ApiService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private destroy$ = new Subject<void>();

  registros: CensoCamasOut[] = [];
  servicios: Encamamiento[] = [];
  cargando = false;
  error: string | null = null;
  filtrar = false;

  readonly pageSize = 20;
  paginaActual = 1;
  totalDeRegistros = 0;

  filtros: CensoCamasFiltros = {
    fecha: '',
    fecha_desde: '',
    fecha_hasta: '',
    servicio_id: null,
    skip: 0,
    limit: this.pageSize
  };

  tabActiva: 'registros' | 'estadisticas' | 'hospitalizacion' = 'registros';
  estadisticaHoy: CensoEstadisticaResponse | null = null;
  estadisticaMes: CensoEstadisticaResponse | null = null;
  cargandoEstadisticas = false;
  cargandoTablaHospitalizacionDiaria = false;
  hospitalizacionDiaria: HospitalizacionDiariaItem[] = [];
  fechaEstadistica: string = this.fechaAyer();
  fechaHoy: string = this.fechaActual();

  hospitalizacion: HospitalizacionEspecialidadItem[] = [];
  totalHospitalizados = 0;
  cargandoHospitalizacion = false;
  rangoHospitalizacion: { desde: string; hasta: string } | null = null;

  get totalMasculinosHosp(): number {
    return this.hospitalizacion.reduce((acc, e) => acc + (e.masculinos || 0), 0);
  }
  get totalFemeninosHosp(): number {
    return this.hospitalizacion.reduce((acc, e) => acc + (e.femeninos || 0), 0);
  }
  get camasOcupadasHoy(): number {
    const hoy = this.estadisticaHoy?.global?.dco ?? 0;
    return hoy;
  }
  get brechaCensoHosp(): number {
    return this.camasOcupadasHoy - this.totalHospitalizados;
  }
  get absBrechaCensoHosp(): number {
    return Math.abs(this.brechaCensoHosp);
  }
  get especialidadesConServicio(): HospitalizacionEspecialidadItem[] {
    return this.hospitalizacion.filter(e => !!e.servicio_encamamiento);
  }

  get totalesHospitalizacionDiaria(): Omit<HospitalizacionDiariaItem, 'servicio_id' | 'servicio_nombre'> {
    const totales = this.hospitalizacionDiaria.reduce((sum, servicio) => ({
      camas_censables: sum.camas_censables + servicio.camas_censables,
      camas_ocupadas: sum.camas_ocupadas + servicio.camas_ocupadas,
      camas_disponibles: sum.camas_disponibles + servicio.camas_disponibles,
      egresos_diarios: sum.egresos_diarios + servicio.egresos_diarios,
      egresos_contraindicados: sum.egresos_contraindicados + servicio.egresos_contraindicados,
      fallecidos: sum.fallecidos + servicio.fallecidos,
    }), {
      camas_censables: 0,
      camas_ocupadas: 0,
      camas_disponibles: 0,
      egresos_diarios: 0,
      egresos_contraindicados: 0,
      fallecidos: 0,
    });

    return {
      ...totales,
      porcentaje_ocupacional: totales.camas_censables > 0
        ? Number(((totales.camas_ocupadas / totales.camas_censables) * 100).toFixed(2))
        : 0,
    };
  }
  porcentajeServicio(esp: string): number {
    const item = this.hospitalizacion.find(e => e.especialidad === esp);
    if (!item) return 0;
    const svc = this.servicios.find(s => s.nombre_servicio === item.servicio_encamamiento);
    if (!svc || svc.camas_censables <= 0) return 0;
    return Math.round((item.total / svc.camas_censables) * 100);
  }

  readonly metricas = [
    { key: 'camas_censables', label: 'Camas Censables' },
    { key: 'porcentaje_ocupacion', label: '% Ocupación', isPct: true },
    { key: 'dco', label: 'D.C.O.' },
    { key: 'dcd', label: 'D.C.D.' },
    { key: 'dias_estancia', label: 'Días Estancia' },
    { key: 'egresos_totales', label: 'Egresos Totales' },
    { key: 'rotacion', label: 'Rotación' },
    { key: 'dias_en_rango', label: 'Días en Rango' },
  ];

  val(obj: any, key: string): any {
    if (!obj) return '';
    if (key === 'camas_censables' && obj.camas_censables_total !== undefined) {
      return obj.camas_censables_total;
    }
    return obj[key] ?? '';
  }

  ngOnInit(): void {
    this.cargarServicios();
    this.cargar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarServicios(): void {
    this.api.getServiciosEncamamiento(true).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: Encamamiento[]) => { this.servicios = data; this.cdr.markForCheck(); },
      error: () => { this.servicios = []; this.cdr.markForCheck(); }
    });
  }

  cargar(): void {
    this.cargando = true;
    this.error = null;
    this.filtros.skip = (this.paginaActual - 1) * this.pageSize;
    this.filtros.limit = this.pageSize;

    this.censoService.getRegistros(this.filtros).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.registros = res.registros;
        this.totalDeRegistros = res.total;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Error al cargar registros de censo';
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  buscar(): void {
    this.paginaActual = 1;
    this.cargar();
  }

  limpiarFiltros(): void {
    this.filtros = {
      fecha: '',
      fecha_desde: '',
      fecha_hasta: '',
      servicio_id: null,
      skip: 0,
      limit: this.pageSize
    };
    this.paginaActual = 1;
    this.cargar();
  }

  toggleFiltrar(): void {
    this.filtrar = !this.filtrar;
  }

  nuevo(): void {
    this.router.navigate(['/censo-camas/nuevo']);
  }

  editar(id: number): void {
    this.router.navigate(['/censo-camas/editar', id]);
  }

  eliminar(id: number): void {
    const confirmar = confirm('¿Desea eliminar este registro de censo?');
    if (!confirmar) return;

    this.censoService.eliminar(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.cargar(); this.cdr.markForCheck(); },
      error: (err) => { console.error(err); this.cdr.markForCheck(); }
    });
  }

  servicioNombre(id: number): string {
    const servicio = this.servicios.find(item => item.id === id);
    return servicio?.nombre_servicio || `Servicio #${id}`;
  }

  porcentajeOcupacional(r: CensoCamasOut): number {
    const svc = this.servicios.find(s => s.id === r.servicio_id);
    if (!svc || svc.camas_censables <= 0) return 0;
    return Math.round((r.camas_ocupadas / svc.camas_censables) * 100);
  }

  porcentajeVisual(r: CensoCamasOut): number {
    return Math.min(100, Math.max(0, this.porcentajeOcupacional(r)));
  }

  nivelOcupacion(r: CensoCamasOut): 'bajo' | 'medio' | 'alto' | 'critico' {
    const porcentaje = this.porcentajeOcupacional(r);
    if (porcentaje >= 100) return 'critico';
    if (porcentaje >= 80) return 'alto';
    if (porcentaje >= 50) return 'medio';
    return 'bajo';
  }

  formatearFecha(fecha: string): string {
    return new Date(`${fecha}T12:00:00`).toLocaleDateString('es-GT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatearFechaCorta(fecha: string | null | undefined): string {
    if (!fecha) return '—';
    const [anio, mes, dia] = fecha.split('-');
    if (!anio || !mes || !dia) return fecha;
    return `${dia}/${mes}/${anio.slice(-2)}`;
  }

  // ── Tabs ──
  cambiarTab(tab: 'registros' | 'estadisticas' | 'hospitalizacion'): void {
    this.tabActiva = tab;
    if (tab === 'estadisticas' && !this.estadisticaHoy) {
      this.cargarEstadisticas();
    }
    if (tab === 'hospitalizacion' && this.hospitalizacion.length === 0) {
      this.cargarHospitalizaciones();
    }
  }

  cargarHospitalizaciones(): void {
    this.cargandoHospitalizacion = true;
    const fechaSeleccionada = this.fechaEstadistica || this.fechaAyer();
    const inicioMes = this.primeroDelMes(fechaSeleccionada);

    this.censoService.getHospitalizacionPorEspecialidad(inicioMes, fechaSeleccionada).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.hospitalizacion = res.especialidades;
        this.totalHospitalizados = res.total_hospitalizados;
        this.rangoHospitalizacion = { desde: res.desde, hasta: res.hasta };
        this.cargandoHospitalizacion = false;
        if (!this.estadisticaHoy) this.cargarEstadisticasHoy();
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargandoHospitalizacion = false;
        this.cdr.markForCheck();
      }
    });
  }

  private cargarEstadisticasHoy(fechaSeleccionada = this.fechaEstadistica || this.fechaAyer()): void {
    this.cargandoTablaHospitalizacionDiaria = true;
    forkJoin({
      estadisticas: this.censoService.getEstadisticas(fechaSeleccionada, fechaSeleccionada),
      registros: this.censoService.getRegistros({ fecha: fechaSeleccionada, skip: 0, limit: 500 }),
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ estadisticas, registros }) => {
        this.estadisticaHoy = estadisticas;
        this.hospitalizacionDiaria = this.armarTablaHospitalizacionDiaria(estadisticas.servicios, registros.registros);
        this.cargandoTablaHospitalizacionDiaria = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.hospitalizacionDiaria = [];
        this.cargandoTablaHospitalizacionDiaria = false;
        this.cdr.markForCheck();
      }
    });
  }

  armarTablaHospitalizacionDiaria(
    servicios: CensoEstadisticaServicio[],
    registros: CensoCamasOut[],
  ): HospitalizacionDiariaItem[] {
    const movimientos = new Map<number, Pick<HospitalizacionDiariaItem,
      'camas_ocupadas' | 'egresos_diarios' | 'egresos_contraindicados' | 'fallecidos'>>();

    for (const registro of registros) {
      const actual = movimientos.get(registro.servicio_id) ?? {
        camas_ocupadas: 0,
        egresos_diarios: 0,
        egresos_contraindicados: 0,
        fallecidos: 0,
      };
      actual.camas_ocupadas += registro.camas_ocupadas;
      actual.egresos_diarios += registro.egresos;
      actual.egresos_contraindicados += registro.contraindicados;
      actual.fallecidos += registro.fallecidos;
      movimientos.set(registro.servicio_id, actual);
    }

    return servicios.map(servicio => {
      const movimiento = movimientos.get(servicio.servicio_id);
      const camasOcupadas = movimiento?.camas_ocupadas ?? 0;
      const camasCensables = servicio.camas_censables;

      return {
        servicio_id: servicio.servicio_id,
        servicio_nombre: servicio.servicio_nombre,
        camas_censables: camasCensables,
        camas_ocupadas: camasOcupadas,
        camas_disponibles: Math.max(camasCensables - camasOcupadas, 0),
        porcentaje_ocupacional: camasCensables > 0
          ? Number(((camasOcupadas / camasCensables) * 100).toFixed(2))
          : 0,
        egresos_diarios: movimiento?.egresos_diarios ?? 0,
        egresos_contraindicados: movimiento?.egresos_contraindicados ?? 0,
        fallecidos: movimiento?.fallecidos ?? 0,
      };
    });
  }

  cargarEstadisticas(): void {
    this.cargandoEstadisticas = true;
    const fechaSeleccionada = this.fechaEstadistica || this.fechaAyer();
    const primeroMes = this.primeroDelMes(fechaSeleccionada);

    this.censoService.getEstadisticas(primeroMes, fechaSeleccionada).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.estadisticaMes = res;
        this.cargandoEstadisticas = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargandoEstadisticas = false;
        this.cdr.markForCheck();
      }
    });

    this.cargarEstadisticasHoy(fechaSeleccionada);
  }

  /** Carga estadísticas para una fecha específica (seleccionada por el usuario) */
  cargarEstadisticasPorFecha(): void {
    this.cargandoEstadisticas = true;
    const fecha = this.fechaEstadistica || this.fechaAyer();
    const primeroMes = this.primeroDelMes(fecha);

    this.censoService.getEstadisticas(primeroMes, fecha).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.estadisticaMes = res;
        this.cargandoEstadisticas = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargandoEstadisticas = false;
        this.cdr.markForCheck();
      }
    });

    this.cargarEstadisticasHoy(fecha);
  }

  /** Fecha de ayer (el censo refleja cómo amaneció el día anterior) */
  private fechaAyer(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private fechaActual(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private primeroDelMes(fechaBase?: string): string {
    const d = fechaBase ? new Date(fechaBase + 'T12:00:00') : new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }

  // Pagination
  get totalPaginas(): number {
    return Math.ceil(this.totalDeRegistros / this.pageSize) || 1;
  }
  get hayPaginaAnterior(): boolean { return this.paginaActual > 1; }
  get hayPaginaSiguiente(): boolean { return this.paginaActual < this.totalPaginas; }
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
    this.cargar();
  }
  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.cargar();
  }
}
