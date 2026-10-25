import { Component, OnInit, inject, signal, input, output, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Observable, Subject, catchError, finalize, switchMap, tap, throwError } from 'rxjs';

import { CicloService } from '../ciclo.service';
import { PacienteService } from '../../registros/patient/paciente.service';
import { ConsultaService } from '../../registros/consultas/consultas.service';
import {
  HistoriaClinicaResponse,
  CicloResumen,
} from '../../interface/ciclo';

const LOCALE = 'es-GT';

const FMT_FECHA = new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: 'short', year: 'numeric' });
const FMT_FECHA_HORA = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
});
const FMT_FECHA_HORA_LARGA = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
});

const TIPOS_CONSULTA: Record<number, { nombre: string; color: string }> = {
  1: { nombre: 'COEX', color: '#22d3ee' },
  2: { nombre: 'Hospitalización', color: '#f97316' },
  3: { nombre: 'Emergencia', color: '#ef4444' },
};

/** Presenta el historial de consultas y ciclos clínicos de un paciente. */
@Component({
  selector: 'app-historia-clinica',
  templateUrl: './historiaClinica.component.html',
  styleUrls: ['./historiaClinica.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class HistoriaClinicaComponent implements OnInit {

  private cicloService = inject(CicloService);
  private pacienteService = inject(PacienteService);
  private consultaService = inject(ConsultaService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  router = inject(Router);

  readonly id = input<number | null>(null);
  readonly cerrar = output<void>();
  /** Se conserva por compatibilidad con quien use [by]; la lógica ya no lo necesita. */
  readonly by = input<string | null>(null);

  historia = signal<HistoriaClinicaResponse | null>(null);
  /** Solo es true mientras hay una petición en curso. */
  cargando = signal(false);
  error = signal<string | null>(null);
  consultasColapsadas = signal<Set<number>>(new Set());
  expedienteBusqueda = '';

  readonly fechaFormateada = FMT_FECHA_HORA_LARGA.format(new Date());

  /** Cola de solicitudes: switchMap cancela la anterior si llega una nueva. */
  private readonly solicitud$ = new Subject<Observable<HistoriaClinicaResponse>>();

  constructor() {
    this.solicitud$.pipe(
      switchMap(fuente$ => {
        this.cargando.set(true);
        this.error.set(null);
        return fuente$.pipe(
          tap(data => this.historia.set(data)),
          catchError(err => {
            this.error.set(err instanceof Error ? err.message : 'Error al cargar historia clínica');
            return EMPTY;
          }),
          finalize(() => this.cargando.set(false))
        );
      }),
      takeUntilDestroyed()
    ).subscribe();
  }

  ngOnInit(): void {
    const inputId = this.id();
    if (inputId) {
      this.solicitud$.next(this.porPaciente(inputId));
      return;
    }

    const params = this.route.snapshot.paramMap;
    const query = this.route.snapshot.queryParamMap;

    const idParam = Number(params.get('id'));
    const queryId = Number(query.get('id') || query.get('pacienteId'));
    const id = idParam || queryId;
    if (!id) return; // nada que buscar: no se activa el loading

    const by = query.get('by') || (queryId ? 'paciente' : null);
    this.solicitud$.next(
      by === 'paciente' || queryId ? this.porPaciente(id) : this.porConsulta(id)
    );
  }

  regresar(): void {
    this.location.back();
  }

  // ── Fuentes de datos ──────────────────────────────────────
  private porPaciente(pacienteId: number): Observable<HistoriaClinicaResponse> {
    return this.cicloService.getHistoriaClinica(pacienteId).pipe(
      catchError(() => throwError(() => new Error('Error al cargar historia clínica')))
    );
  }

  private porConsulta(consultaId: number): Observable<HistoriaClinicaResponse> {
    return this.consultaService.getConsultaId(consultaId).pipe(
      catchError(() => throwError(() => new Error('Error al cargar la consulta'))),
      switchMap(consulta => {
        const pacienteId = consulta?.paciente_id ?? (consulta?.paciente as any)?.id;
        return pacienteId
          ? this.porPaciente(pacienteId)
          : throwError(() => new Error('No se pudo resolver el paciente de la consulta'));
      })
    );
  }

  private porExpediente(expediente: string): Observable<HistoriaClinicaResponse> {
    return this.pacienteService.pacienteExpediente(expediente).pipe(
      catchError(() => throwError(() => new Error('Error al buscar paciente'))),
      switchMap((paciente: any) =>
        paciente?.id
          ? this.porPaciente(paciente.id)
          : throwError(() => new Error('No se encontró paciente con ese expediente'))
      )
    );
  }

  // ── Búsqueda por expediente ───────────────────────────────
  buscarPorExpediente(): void {
    const exp = this.expedienteBusqueda.trim();
    if (!exp) return; // nada que buscar: no se activa el loading
    this.solicitud$.next(this.porExpediente(exp));
  }

  // ── Utilidades ────────────────────────────────────────────
  toggleConsulta(consultaId: number): void {
    const actual = new Set(this.consultasColapsadas());
    if (!actual.delete(consultaId)) actual.add(consultaId);
    this.consultasColapsadas.set(actual);
  }

  estaColapsada(consultaId: number): boolean {
    return this.consultasColapsadas().has(consultaId);
  }

  nombreTipoConsulta(tipo: number | undefined): string {
    return TIPOS_CONSULTA[tipo ?? 0]?.nombre ?? 'Consulta';
  }

  colorTipoConsulta(tipo: number | undefined): string {
    return TIPOS_CONSULTA[tipo ?? 0]?.color ?? '#64748b';
  }

  formatearFecha(fecha: string | undefined): string {
    return fecha ? FMT_FECHA.format(new Date(`${fecha}T12:00:00`)) : '';
  }

  formatearHora(hora: string | undefined): string {
    return hora ? hora.substring(0, 5) : '';
  }

  formatearRegistro(registro: string | undefined): string {
    return registro ? FMT_FECHA_HORA.format(new Date(registro)) : '';
  }

  resumenCiclo(ciclo: CicloResumen): string {
    return ciclo.resumen
      || ciclo.impresion_clinica?.substring(0, 120)
      || 'Sin resumen';
  }

  signosVitalesCompactos(ciclo: CicloResumen): string {
    if (!ciclo.signos_vitales) return '';
    return Object.entries(ciclo.signos_vitales)
      .filter(([, val]) => val)
      .map(([key, val]) => `${key}:${val}`)
      .join(' | ');
  }

  badgeEgreso(ciclo: CicloResumen): string {
    return ciclo.egreso?.condicion ?? '';
  }

  irANota(cicloId: number): void {
    this.router.navigate(['/verNota', cicloId]);
  }

  imprimir(): void {
    window.print();
  }

  esNotaOdontologica(ciclo: CicloResumen): boolean {
    return !!ciclo.odontologia;
  }

  resumenOdontologico(ciclo: CicloResumen): string {
    const odonto = ciclo.odontologia;
    if (!odonto) return '';
    const partes = [odonto.diagnostico, odonto.motivo_consulta, odonto.plan_tratamiento]
      .filter((parte): parte is string => !!parte?.trim());
    if (odonto.piezas_afectadas?.length) partes.push(`Piezas: ${odonto.piezas_afectadas.join(', ')}`);
    return partes.join(' · ') || 'Nota odontológica registrada';
  }
}
