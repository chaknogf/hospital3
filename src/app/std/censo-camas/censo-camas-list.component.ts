import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CensoCamasService } from './censo-camas.service';
import {
  CensoCamasOut,
  CensoCamasFiltros,
  CensoEstadisticaResponse,
  CensoEstadisticaServicio,
} from './censo-camas.interface';
import { Encamamiento } from '../../interface/interfaces';
import { ApiService } from '../../service/api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-censo-camas-list',
  templateUrl: './censo-camas-list.component.html',
  styleUrls: ['./censo-camas-list.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink]
})
export class CensoCamasListComponent implements OnInit, OnDestroy {

  private censoService = inject(CensoCamasService);
  private api = inject(ApiService);
  private router = inject(Router);

  private destroy$ = new Subject<void>();

  registros: CensoCamasOut[] = [];
  servicios: Encamamiento[] = [];
  cargando = false;
  error: string | null = null;
  filtrar = false;
  rowActiva: number | null = null;

  readonly pageSize = 20;
  paginaActual = 1;
  totalDeRegistros = 0;

  filtros: CensoCamasFiltros = {
    fecha: '',
    fecha_desde: '',
    fecha_hasta: '',
    servicio_id: null,
    sexo: null,
    skip: 0,
    limit: this.pageSize
  };

  tabActiva: 'registros' | 'estadisticas' = 'registros';
  estadisticaHoy: CensoEstadisticaResponse | null = null;
  estadisticaMes: CensoEstadisticaResponse | null = null;
  cargandoEstadisticas = false;

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
    return obj ? obj[key] : '';
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
      next: (data: Encamamiento[]) => this.servicios = data,
      error: () => this.servicios = []
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
      },
      error: () => {
        this.error = 'Error al cargar registros de censo';
        this.cargando = false;
      }
    });
  }

  trackById(index: number, item: any): any {
    return item.id ?? index;
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
      sexo: null,
      skip: 0,
      limit: this.pageSize
    };
    this.paginaActual = 1;
    this.cargar();
  }

  toggleFiltrar(): void {
    this.filtrar = !this.filtrar;
  }

  activarFila(id: number): void {
    this.rowActiva = this.rowActiva === id ? null : id;
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
      next: () => this.cargar(),
      error: (err) => console.error(err)
    });
  }

  get servicioNombre(): (id: number) => string {
    return (id: number) => {
      const svc = this.servicios.find(s => s.id === id);
      return svc?.nombre_servicio || `Servicio #${id}`;
    };
  }

  get sexoLabel(): (sexo: number) => string {
    return (sexo: number) => sexo === 0 ? 'Masculino' : 'Femenino';
  }

  // ── Tabs ──
  cambiarTab(tab: 'registros' | 'estadisticas'): void {
    this.tabActiva = tab;
    if (tab === 'estadisticas' && !this.estadisticaHoy) {
      this.cargarEstadisticas();
    }
  }

  cargarEstadisticas(): void {
    this.cargandoEstadisticas = true;
    const hoy = this.fechaActual();
    const primeroMes = this.primeroDelMes();

    this.censoService.getEstadisticas(primeroMes, hoy).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.estadisticaMes = res;
        this.cargandoEstadisticas = false;
      },
      error: () => {
        this.cargandoEstadisticas = false;
      }
    });

    this.censoService.getEstadisticas(hoy, hoy).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.estadisticaHoy = res;
      },
      error: () => {}
    });
  }

  private fechaActual(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private primeroDelMes(): string {
    const d = new Date();
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
