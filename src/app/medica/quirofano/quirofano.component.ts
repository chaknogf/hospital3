// quirofano.component.ts

import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ConsultaOut } from '../../interface/consultas';
import { IntervencionQuirurgica } from '../../interface/quirofano.interface';
import { ConsultaService } from '../../registros/consultas/consultas.service';
import { PacienteService } from '../../registros/patient/paciente.service';
import { IconService } from '../../service/icon.service';
import { ciclos } from '../../enum/diccionarios';
import { QuirofanoService } from './quirofano.service';

const ESTADOS_INACTIVOS = new Set(['recepcion', 'archivo', 'descartado', 'egreso']);
const TIPO_HOSPITALIZACION = 2;

/** Consulta y administra pacientes e intervenciones del área quirúrgica. */
@Component({
  selector: 'app-quirofano',
  templateUrl: './quirofano.component.html',
  styleUrls: ['./quirofano.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class QuirofanoComponent implements OnInit, OnDestroy {

  private consultasApi = inject(ConsultaService);
  private pacientesApi = inject(PacienteService);
  private router = inject(Router);
  private location = inject(Location);
  private iconService = inject(IconService);
  private cdr = inject(ChangeDetectorRef);

  private destroy$ = new Subject<void>();

  // ── Vista ──
  vista: 'ambos' | 'hospitalizacion' | 'intervenciones' = 'ambos';
  filtrar = false;
  ciclos = ciclos;

  // ── Expediente → crear intervención ──
  filtroExpediente = '';
  buscandoExpediente = false;

  // ── Hospitalización ──
  consultas: ConsultaOut[] = [];
  consultasTotal = 0;
  consultasCargando = false;
  readonly consultasPageSize = 10;
  consultasPagina = 1;

  // ── Intervenciones ──
  intervenciones: IntervencionQuirurgica[] = [];
  intervencionesTotal = 0;
  intervencionesCargando = false;
  readonly intPageSize = 10;
  intPagina = 1;

  filtroInt = { expediente: '', fecha_desde: '', fecha_hasta: '' };

  // ── Iconos ──
  icons: { [key: string]: any } = {};

  constructor(
    private api: QuirofanoService
  ) {
    this.icons = {
      menu: this.iconService.getIcon('menuIcon'),
      find: this.iconService.getIcon('findIcon'),
      search: this.iconService.getIcon('searchIcon'),
      delete: this.iconService.getIcon('deletInput'),
      create: this.iconService.getIcon('createIcon'),
      edit: this.iconService.getIcon('editIcon'),
      arrowDown: this.iconService.getIcon('arrowDown'),
      addPerson: this.iconService.getIcon('addPerson'),
    };
  }

  ngOnInit(): void {
    this.cargarHospitalizacion();
    this.cargarIntervenciones();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ══════════════════════════════════════════════════════════
  // CARGA HOSPITALIZACIÓN
  // ══════════════════════════════════════════════════════════
  cargarHospitalizacion(): void {
    this.consultasCargando = true;
    this.consultasApi.getConsultas({
      skip: (this.consultasPagina - 1) * this.consultasPageSize,
      limit: this.consultasPageSize,
      activo: true,
      tipo_consulta: TIPO_HOSPITALIZACION
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        this.consultasTotal = res.total;
        this.consultas = res.consultas.filter(c => this.esConsultaActiva(c));
        this.cdr.markForCheck();
      },
      error: () => {
        this.consultas = [];
        this.consultasTotal = 0;
        this.cdr.markForCheck();
      },
      complete: () => { this.consultasCargando = false; }
    });
  }

  private esConsultaActiva(c: ConsultaOut): boolean {
    if (!c.ultimo_estado) return true;
    return !ESTADOS_INACTIVOS.has(c.ultimo_estado);
  }

  // ══════════════════════════════════════════════════════════
  // CARGA INTERVENCIONES
  // ══════════════════════════════════════════════════════════
  cargarIntervenciones(): void {
    this.intervencionesCargando = true;
    const params: any = {
      skip: (this.intPagina - 1) * this.intPageSize,
      limit: this.intPageSize + 1
    };
    if (this.filtroInt.expediente) params.expediente = this.filtroInt.expediente;
    if (this.filtroInt.fecha_desde) params.fecha_desde = this.filtroInt.fecha_desde;
    if (this.filtroInt.fecha_hasta) params.fecha_hasta = this.filtroInt.fecha_hasta;

    this.api.getIntervenciones(params).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        this.intervencionesTotal = res.total;
        this.intervenciones = res.intervenciones.slice(0, this.intPageSize);
        this.cdr.markForCheck();
      },
      error: () => {
        this.intervenciones = [];
        this.intervencionesTotal = 0;
        this.cdr.markForCheck();
      },
      complete: () => { this.intervencionesCargando = false; }
    });
  }

  // ══════════════════════════════════════════════════════════
  // VISTA / FILTROS
  // ══════════════════════════════════════════════════════════
  setVista(v: 'ambos' | 'hospitalizacion' | 'intervenciones'): void {
    this.vista = v;
  }

  toggleFiltrar(): void { this.filtrar = !this.filtrar; }

  limpiarFiltros(): void {
    this.filtroExpediente = '';
    this.filtroInt = { expediente: '', fecha_desde: '', fecha_hasta: '' };
    this.intPagina = 1;
    this.consultasPagina = 1;
    this.cargarHospitalizacion();
    this.cargarIntervenciones();
  }

  buscarIntervenciones(): void {
    this.intPagina = 1;
    this.cargarIntervenciones();
  }

  // ══════════════════════════════════════════════════════════
  // NAVEGACIÓN / ACCIONES
  // ══════════════════════════════════════════════════════════
  nuevaIntervencion(): void { this.router.navigate(['/quirofano/nueva']); }

  editarIntervencion(id: number): void { this.router.navigate(['/quirofano/editar', id]); }

  eliminarIntervencion(id: number): void {
    if (!confirm('¿Eliminar esta intervención quirúrgica?')) return;
    this.api.eliminarIntervencion(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.cargarIntervenciones()
    });
  }

  registrarIntervencion(c: ConsultaOut): void {
    const expediente = c.expediente || c.paciente?.expediente || '';
    this.router.navigate(['/quirofano/nueva'], { queryParams: { expediente } });
  }

  buscarExpedienteParaIntervencion(): void {
    const expediente = this.filtroExpediente.trim();
    if (!expediente) return;
    this.buscandoExpediente = true;
    this.pacientesApi.pacienteExpediente(expediente).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.buscandoExpediente = false;
        this.router.navigate(['/quirofano/nueva'], { queryParams: { expediente } });
      },
      error: () => {
        this.buscandoExpediente = false;
        alert('No se encontró un paciente con ese expediente');
      }
    });
  }

  irAPaciente(c: ConsultaOut): void {
    this.router.navigate(['/detalleAdmision', c.id]);
  }

  // ══════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════
  nombrePaciente(c: ConsultaOut): string {
    const n = c.paciente?.nombre;
    if (!n) return c.expediente ?? '—';
    return [n.primer_nombre, n.segundo_nombre, n.primer_apellido, n.segundo_apellido].filter(Boolean).join(' ');
  }

  experienciaPaciente(c: ConsultaOut): string {
    return c.expediente || c.paciente?.expediente || '—';
  }

  ultimoEstadoLabel(estado: string | undefined): string {
    if (!estado) return '—';
    return this.ciclos.find(c => c.value === estado)?.label ?? estado;
  }

  trackById(index: number, item: any): any {
    return item.id ?? item.intervencion_id ?? index;
  }

  // ── Paginación consultas ──
  get consultasTotalPaginas(): number { return Math.ceil(this.consultasTotal / this.consultasPageSize) || 1; }
  get hayPaginaAnteriorConsultas(): boolean { return this.consultasPagina > 1; }
  get hayPaginaSiguienteConsultas(): boolean { return this.consultasPagina < this.consultasTotalPaginas; }
  cambiarPaginaConsulta(paso: number): void {
    const nueva = this.consultasPagina + paso;
    if (nueva < 1 || nueva > this.consultasTotalPaginas) return;
    this.consultasPagina = nueva;
    this.cargarHospitalizacion();
  }

  // ── Paginación intervenciones ──
  get intTotalPaginas(): number { return Math.ceil(this.intervencionesTotal / this.intPageSize) || 1; }
  get intHayPaginaAnterior(): boolean { return this.intPagina > 1; }
  get intHayPaginaSiguiente(): boolean { return this.intPagina < this.intTotalPaginas; }
  cambiarPaginaIntervencion(paso: number): void {
    const nueva = this.intPagina + paso;
    if (nueva < 1 || nueva > this.intTotalPaginas) return;
    this.intPagina = nueva;
    this.cargarIntervenciones();
  }

  volver(): void { this.router.navigate(['/clinica']); }
}
