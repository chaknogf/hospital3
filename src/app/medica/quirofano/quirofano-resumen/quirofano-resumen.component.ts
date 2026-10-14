// quirofano-resumen.component.ts

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import {
  Especialidad,
  QuirofanoNumero,
  QuirofanoConfigPeriodo,
  QuirofanoConfigPeriodoUpdate,
  ResumenReporteResponse,
  ReporteQuirofanoParams,
} from '../../../interface/quirofano.interface';
import { EspecialidadesService } from '../../../service/especialidades.service';
import { IconService } from '../../../service/icon.service';
import { QuirofanoService } from '../quirofano.service';
import { QuirofanoExcelExportComponent } from './quirofano-excel-export.component';
import {
  formatoDias,
  formatoPorcentaje,
  segundosAHoraMinuto,
  segundosAHoraMinutoSegundo,
} from '../quirofano-tiempos.util';

/** Barra de un gráfico simple (valor normalizado 0..1). */
interface BarraGrafico {
  etiqueta: string;
  fraccion: number;
  texto: string;
}

/** Segmento de la barra apilada de estados. */
interface SegmentoEstado {
  etiqueta: string;
  cantidad: number;
  fraccion: number;
  clase: 'fin' | 'can' | 'rep';
}

const MAX_DIAS_PERIODO = 366;

/** Reporte estadístico del área quirúrgica (KPIs, gráficos y detalle). */
@Component({
  selector: 'app-quirofano-resumen',
  templateUrl: './quirofano-resumen.component.html',
  styleUrls: ['./quirofano-resumen.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, QuirofanoExcelExportComponent],
})
export class QuirofanoResumenComponent implements OnInit {
  private api = inject(QuirofanoService);
  private especialidadesApi = inject(EspecialidadesService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private iconService = inject(IconService);

  readonly icons = {
    back: this.iconService.getIcon('backIcon'),
    search: this.iconService.getIcon('searchIcon'),
    save: this.iconService.getIcon('saveIcon'),
  };

  // ── Estado ──
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly reporte = signal<ResumenReporteResponse | null>(null);
  readonly especialidades = signal<Especialidad[]>([]);
  readonly quirofanos = signal<QuirofanoNumero[]>([]);
  readonly configPeriodo = signal<QuirofanoConfigPeriodo[]>([]);
  readonly guardandoConfig = signal<number | null>(null);
  readonly detalleIndex = signal(0);
  readonly configAbierta = signal(false);

  readonly maxDias = MAX_DIAS_PERIODO;

  // ── Formulario de filtros ──
  readonly filtros = this.fb.group({
    fecha_desde: [this.hoy(), Validators.required],
    fecha_hasta: [this.hoy(), Validators.required],
    especialidad_id: [null as number | null],
    quirofano_numero_id: [null as number | null],
    usar_jornada: [false],
    hora_apertura: [''],
    hora_cierre: [''],
    dias_abiertos: [null as number | null],
  });

  // ── Derivados ──
  readonly kpiGlobal = computed(() => this.reporte()?.kpi_global ?? null);

  /** Parámetros vigentes del formulario (se recalcula en cada detección de cambios). */
  paramsActuales(): ReporteQuirofanoParams {
    return this.construirParams();
  }

  readonly barrasUso = computed<BarraGrafico[]>(() => {
    const r = this.reporte();
    if (!r) return [];
    return r.por_quirofano.map(p => ({
      etiqueta: p.kpi.nombre,
      fraccion: Math.min(1, Math.max(0, p.kpi.porcentaje_uso)),
      texto: formatoPorcentaje(p.kpi.porcentaje_uso),
    }));
  });

  readonly segmentosEstado = computed<SegmentoEstado[]>(() => {
    const k = this.kpiGlobal();
    if (!k) return [];
    const total = k.total_intervenciones || 0;
    if (total === 0) return [];
    return [
      { etiqueta: 'Finalizadas', cantidad: k.finalizadas, fraccion: k.finalizadas / total, clase: 'fin' },
      { etiqueta: 'Canceladas', cantidad: k.canceladas, fraccion: k.canceladas / total, clase: 'can' },
      { etiqueta: 'Reprogramadas', cantidad: k.reprogramadas, fraccion: k.reprogramadas / total, clase: 'rep' },
    ];
  });

  readonly detalleActual = computed(() => {
    const r = this.reporte();
    if (!r || r.por_quirofano.length === 0) return null;
    const idx = Math.min(this.detalleIndex(), r.por_quirofano.length - 1);
    return r.por_quirofano[idx];
  });

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarConfigPeriodo();
    this.generar();
  }

  // ══════════════════════════════════════════════════════════
  // CARGA
  // ══════════════════════════════════════════════════════════
  private cargarCatalogos(): void {
    this.especialidadesApi.getEspecialidades(true, true).subscribe({
      next: list => this.especialidades.set(list),
      error: () => this.especialidades.set([]),
    });
    this.api.getQuirofanosNumero(true).subscribe({
      next: list => this.quirofanos.set(list),
      error: () => this.quirofanos.set([]),
    });
  }

  private cargarConfigPeriodo(): void {
    this.api.getConfigPeriodo().subscribe({
      next: list => this.configPeriodo.set(list),
      error: () => this.configPeriodo.set([]),
    });
  }

  generar(): void {
    const errorValidacion = this.validarFiltros();
    if (errorValidacion) {
      this.error.set(errorValidacion);
      return;
    }
    this.cargando.set(true);
    this.error.set(null);
    this.api.getResumenReporte(this.construirParams()).subscribe({
      next: reporte => {
        this.reporte.set(reporte);
        this.detalleIndex.set(0);
        this.cargando.set(false);
      },
      error: err => {
        this.error.set(this.mensajeError(err));
        this.reporte.set(null);
        this.cargando.set(false);
      },
    });
  }

  limpiar(): void {
    this.filtros.reset({
      fecha_desde: this.primerDiaMes(),
      fecha_hasta: this.hoy(),
      especialidad_id: null,
      quirofano_numero_id: null,
      usar_jornada: false,
      hora_apertura: '',
      hora_cierre: '',
      dias_abiertos: null,
    });
    this.generar();
  }

  toggleConfig(): void {
    this.configAbierta.set(!this.configAbierta());
  }

  // ══════════════════════════════════════════════════════════
  // CONFIGURACIÓN DE JORNADA
  // ══════════════════════════════════════════════════════════
  onCampoConfig(quirofanoId: number, campo: 'hora_apertura' | 'hora_cierre' | 'dias_habiles', event: Event): void {
    const input = event.target as HTMLInputElement | HTMLSelectElement;
    this.guardarJornada(quirofanoId, campo, input.value);
  }

  guardarJornada(quirofanoId: number, campo: 'hora_apertura' | 'hora_cierre' | 'dias_habiles', valor: string): void {
    const actual = this.configPeriodo().find(c => c.quirofano_numero_id === quirofanoId);
    if (!actual) return;
    const data: QuirofanoConfigPeriodoUpdate = {};
    if (campo === 'hora_apertura') data.hora_apertura = valor || null;
    else if (campo === 'hora_cierre') data.hora_cierre = valor || null;
    else data.dias_habiles = valor === '' ? null : Number(valor);

    this.guardandoConfig.set(quirofanoId);
    this.api.actualizarConfigPeriodo(quirofanoId, data).subscribe({
      next: actualizada => {
        this.configPeriodo.update(list =>
          list.map(c => (c.quirofano_numero_id === quirofanoId ? actualizada : c))
        );
        this.guardandoConfig.set(null);
      },
      error: err => {
        this.guardandoConfig.set(null);
        alert(this.mensajeError(err));
      },
    });
  }

  // ══════════════════════════════════════════════════════════
  // NAVEGACIÓN
  // ══════════════════════════════════════════════════════════
  volver(): void {
    this.router.navigate(['/quirofano']);
  }

  seleccionarDetalle(index: number): void {
    this.detalleIndex.set(index);
  }

  // ══════════════════════════════════════════════════════════
  // HELPERS DE PLANTILLA
  // ══════════════════════════════════════════════════════════
  readonly fmtHM = segundosAHoraMinuto;
  readonly fmtHMS = segundosAHoraMinutoSegundo;
  readonly fmtPct = formatoPorcentaje;
  readonly fmtDias = formatoDias;

  claseEstado(estado?: string | null): string {
    const e = (estado ?? '').toLowerCase();
    if (e.startsWith('final')) return 'chip-fin';
    if (e.startsWith('cancel')) return 'chip-can';
    if (e.startsWith('reprog')) return 'chip-rep';
    return 'chip-neutral';
  }

  private construirParams(): ReporteQuirofanoParams {
    const v = this.filtros.getRawValue();
    const params: ReporteQuirofanoParams = {
      fecha_desde: v.fecha_desde ?? this.hoy(),
      fecha_hasta: v.fecha_hasta ?? this.hoy(),
    };
    if (v.especialidad_id != null) params.especialidad_id = v.especialidad_id;
    if (v.quirofano_numero_id != null) params.quirofano_numero_id = v.quirofano_numero_id;
    if (v.usar_jornada) {
      if (v.hora_apertura) params.hora_apertura = v.hora_apertura;
      if (v.hora_cierre) params.hora_cierre = v.hora_cierre;
      if (v.dias_abiertos != null) params.dias_abiertos = v.dias_abiertos;
    }
    return params;
  }

  private validarFiltros(): string | null {
    const v = this.filtros.getRawValue();
    if (!v.fecha_desde || !v.fecha_hasta) {
      return 'Debes indicar la fecha de inicio y la fecha de fin del período.';
    }
    if (v.fecha_desde > v.fecha_hasta) {
      return 'La fecha de inicio no puede ser posterior a la fecha de fin.';
    }
    const dias = (new Date(v.fecha_hasta).getTime() - new Date(v.fecha_desde).getTime()) / 86400000;
    if (dias > MAX_DIAS_PERIODO) {
      return `El período no puede exceder ${MAX_DIAS_PERIODO} días.`;
    }
    if (v.usar_jornada && v.hora_apertura && v.hora_cierre && v.hora_cierre <= v.hora_apertura) {
      return 'La hora de cierre debe ser posterior a la hora de apertura.';
    }
    return null;
  }

  private mensajeError(err: unknown): string {
    const detalle = (err as { error?: { detail?: string | { msg?: string }[] } })?.error?.detail;
    if (typeof detalle === 'string') return detalle;
    if (Array.isArray(detalle) && detalle.length > 0) {
      return detalle.map(d => d.msg ?? 'Dato inválido').join(', ');
    }
    return 'No se pudo generar el reporte. Intenta de nuevo.';
  }

  private hoy(): string {
    return new Date().toLocaleDateString('en-CA');
  }

  private primerDiaMes(): string {
    const d = new Date();
    d.setDate(1);
    return d.toLocaleDateString('en-CA');
  }
}
