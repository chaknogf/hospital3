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

  procedimientosQuirofano(datos: NonNullable<CicloResumen['quirofano']>): string {
    return [
      datos.procedimiento_principal,
      datos.procedimiento_2,
      datos.procedimiento_3,
      datos.procedimiento_4,
      datos.procedimiento_5,
    ].filter((valor): valor is string => !!valor?.trim()).join(' · ');
  }

  camposQuirofano(datos: NonNullable<CicloResumen['quirofano']>): Array<{ etiqueta: string; valor: string }> {
    const etiquetas: Record<string, string> = {
      intervencion_id: 'ID de intervención', paciente_id: 'ID de paciente', consulta_id: 'ID de consulta',
      paciente_nombre: 'Paciente', fecha: 'Fecha', expediente: 'Expediente',
      personal_atencion_id: 'ID del médico', personal_atencion_nombre: 'Médico responsable',
      procedimiento_principal: 'Procedimiento principal', procedimiento_principal_id: 'ID procedimiento principal',
      procedimiento_principal_catalogo_nombre: 'Nombre catálogo procedimiento principal',
      procedimiento_2: 'Procedimiento 2', procedimiento_2_id: 'ID procedimiento 2', procedimiento_2_catalogo_nombre: 'Nombre catálogo procedimiento 2',
      procedimiento_3: 'Procedimiento 3', procedimiento_3_id: 'ID procedimiento 3', procedimiento_3_catalogo_nombre: 'Nombre catálogo procedimiento 3',
      procedimiento_4: 'Procedimiento 4', procedimiento_4_id: 'ID procedimiento 4', procedimiento_4_catalogo_nombre: 'Nombre catálogo procedimiento 4',
      procedimiento_5: 'Procedimiento 5', procedimiento_5_id: 'ID procedimiento 5', procedimiento_5_catalogo_nombre: 'Nombre catálogo procedimiento 5',
      area_cuerpo_intervenida: 'Área intervenida', id_area_cuerpo_intervenida: 'ID del área', area_cuerpo_intervenida_nombre: 'Nombre del área',
      estado_cirugia_id: 'ID estado de cirugía', estado_cirugia_nombre: 'Estado de cirugía',
      formato_procedimiento_id: 'ID formato', formato_procedimiento_nombre: 'Formato',
      procedencia_procedimiento_id: 'ID procedencia', procedencia_procedimiento_nombre: 'Procedencia',
      rango_especialista_id: 'ID rango especialista', rango_especialista_nombre: 'Rango especialista',
      especialidad_id: 'ID especialidad', especialidad_nombre: 'Especialidad',
      quirofano_numero_id: 'ID quirófano', quirofano_numero_nombre: 'Quirófano',
      hora_inicio_anestesia: 'Hora de inicio de anestesia', hora_inicio_intervencion: 'Hora de inicio de intervención',
      hora_finaliza_intervencion: 'Hora de finalización de intervención',
      hora_finaliza_limpieza_prepara_quirofano: 'Hora de fin de limpieza y preparación',
      observaciones: 'Observaciones', activo: 'Activo', created_at: 'Creado', updated_at: 'Actualizado',
    };
    const filas: Array<{ etiqueta: string; valor: string }> = [];
    const recorrer = (obj: Record<string, unknown>, prefijo = '') => {
      Object.entries(obj).forEach(([clave, valor]) => {
        if (clave === 'id' || clave.endsWith('_id')) return;
        if (valor === null || valor === undefined || valor === '') return;
        const ruta = prefijo ? `${prefijo}.${clave}` : clave;
        if (valor && typeof valor === 'object' && !Array.isArray(valor)) {
          recorrer(valor as Record<string, unknown>, ruta);
          return;
        }
        const etiqueta = etiquetas[clave] ?? ruta.split('.').map(p => p.replaceAll('_', ' ')).join(' · ');
        filas.push({ etiqueta, valor: Array.isArray(valor) ? valor.join(', ') : String(valor) });
      });
    };
    recorrer(datos as unknown as Record<string, unknown>);
    return filas;
  }
}
