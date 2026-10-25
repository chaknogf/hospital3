import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, input, output, OnDestroy, signal, inject, effect } from '@angular/core';
import {
  CicloConsulta,
  DatosQuirurgicos,
  DatoMedico,
  SignosVitales,
  Antecedentes,
  Cuerpo,
  Glasgow,
  Silverman,
  Downe,
  Apgar,
  Bishop,
  Egreso,
  Dx,
} from '../../interface/ciclo';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatosExtraPipe } from '../../pipes/datos-extra.pipe';
import { EdadPipe } from '../../pipes/edad.pipe';
import { ActivatedRoute, Router } from '@angular/router';
import { IconService } from '../../service/icon.service';
import { CicloService } from '../ciclo.service';
import { ConsultaService } from '../../registros/consultas/consultas.service';
import { PacienteService } from '../../registros/patient/paciente.service';
import { PacienteJoin } from '../../interface/interfaces';
import { ConsultasIdPaciente } from '../../interface/consultas';
import { Subject, of } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { OdontogramaComponent } from './odontograma.component';
import { NotaOdontologica } from './odontograma.model';

/** Registra una nueva nota dentro de la secuencia clínica de una consulta. */
@Component({
  selector: 'app-notaMedica',
  templateUrl: './notaMedica.component.html',
  styleUrls: ['./notaMedica.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, DatosExtraPipe, OdontogramaComponent]
})
export class NotaMedicaComponent implements OnInit, OnDestroy {

  private api = inject(CicloService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private iconService = inject(IconService);
  private consultasApi = inject(ConsultaService);
  private pacientesApi = inject(PacienteService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();
  private consultaId: number | null = null;
  private pacienteId: number | null = null;
  private odontogramaPrecargado = false;

  busquedaExpediente = '';
  pacienteBuscado = signal<PacienteJoin | null>(null);
  consultasPaciente = signal<ConsultasIdPaciente[]>([]);
  intervencionesPaciente = signal<DatosQuirurgicos[]>([]);
  buscandoPaciente = signal(false);
  cargandoConsultas = signal(false);

  /* ── Signals ─────────────────────────────────────────── */
  ciclo = signal<CicloConsulta | null>(null);
  intervencionQuirurgica = signal<CicloConsulta['quirofano'] | null>(null);
  isLoading = signal(false);
  guardando = signal(false);
  tieneConsulta = signal(false);
  odontologiaActiva = signal(false);
  error = signal<string | null>(null);
  mensaje = signal<{ texto: string; tipo: 'success' | 'error' } | null>(null);
  readonly id = input<number | null>(null);
  readonly cerrar = output<void>();


  odontologia: NotaOdontologica = {
    motivo_consulta: '',
    examen_extraoral: '',
    examen_intraoral: '',
    diagnostico: '',
    plan_tratamiento: '',
    procedimientos: '',
    odontograma: { denticion: 'permanente', dientes: {} },
  };

  /* ── UI state ─────────────────────────────────────────── */
  tabActivo: string = 'clinica';
  escalaActiva: string = 'glasgow';
  horaSignos: string = new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });

  antecedentesAbiertos: Record<string, boolean> = {};

  /* ── Datos médicos ─────────────────────────────────────── */
  datosMedicos: DatoMedico = {
    detalle_clinicos: '',
    ordenes: '',
    estudios: '',
    comentario: '',
    impresion_clinica: '',
    tratamiento: '',
    contraindicado: '',
  };

  signosVitales: SignosVitales = {
    pa: '', fc: '', fr: '', sat02: '', temp: '',
    peso: '', talla: '', pt: '', te: '', pe: '', gmt: '',
  };

  antecedentes: Antecedentes = {
    familiares: [],
    medicos: [],
    quirurgicos: [],
    alergicos: [],
    traumaticos: [],
    ginecoobstetricos: [],
    habitos: [],
  };

  // 👉 Datos reales del paciente
  cuerpo: Cuerpo = {
    cabeza: '', ojos: '', oidos: '', nariz: '', boca: '',
    cuello: '', torax: '', pulmones: '', corazon: '', abdomen: '',
    genitales: '', extremidades: '', columna: '', piel: '', neurologico: '',
  };

  // 👉 Configuración del formulario
  segmentosCuerpo: { key: keyof Cuerpo; label: string }[] = [
    { key: 'cabeza', label: 'Cabeza' },
    { key: 'ojos', label: 'Ojos' },
    { key: 'oidos', label: 'Oídos' },
    { key: 'nariz', label: 'Nariz' },
    { key: 'boca', label: 'Boca' },
    { key: 'cuello', label: 'Cuello' },
    { key: 'torax', label: 'Tórax' },
    { key: 'pulmones', label: 'Pulmones' },
    { key: 'corazon', label: 'Corazón' },
    { key: 'abdomen', label: 'Abdomen' },
    { key: 'genitales', label: 'Genitales' },
    { key: 'extremidades', label: 'Extremidades' },
    { key: 'columna', label: 'Columna' },
    { key: 'piel', label: 'Piel' },
    { key: 'neurologico', label: 'Neurológico' },
  ];

  glasgow: Glasgow = {
    apertura_ocular: 4,
    respuesta_verbal: 5,
    respuesta_motora: 6,
    puntuacion_total: 15,
  };

  silverman: Silverman = {
    retraso_esternal: 0,
    aleteo_nasal: 0,
    quejido_expiratorio: 0,
    movimiento_toracico: 0,
    retraccion_supraclavicular: 0,
    puntuacion_total: 0,
  };

  downe: Downe = {
    frecuencia_respiratoria: 0,
    aleteo_nasal: 0,
    quejido_respiratorio: 0,
    retraccion_toracoabdominal: 0,
    cinoasis: 0,
    puntuacion_total: 0,
  };

  apgar: Apgar = {
    tono_muscular: 2,
    respuesta_refleja: 2,
    llanto: 2,
    respiracion: 2,
    coloracion: 2,
    puntuacion_total: 10,
    interpretacion: 'Normal',
  };

  bishop: Bishop = {
    dilatacion: 0,
    borramiento: 0,
    posicion: 0,
    consistencia: 0,
    altura_presentacion: 0,
    puntuacion_total: 0,
  };

  egreso: Egreso = {
    condicion: '',
    referencia: '',
    medico: '',
    diagnosticos: [],
  };

  /* ── Metadatos de formulario ───────────────────────────── */
  gruposAntecedentes = [
    { key: 'familiares', label: 'Familiares', icon: '👨‍👩‍👧' },
    { key: 'medicos', label: 'Médicos', icon: '🏥' },
    { key: 'quirurgicos', label: 'Quirúrgicos', icon: '🔪' },
    { key: 'alergicos', label: 'Alérgicos', icon: '⚠️' },
    { key: 'traumaticos', label: 'Traumáticos', icon: '🦴' },
    { key: 'ginecoobstetricos', label: 'Gineco-Obstétricos', icon: '🤰' },
    { key: 'habitos', label: 'Hábitos', icon: '🚬' },
  ];

  // segmentosCuerpo = [
  //   { key: 'cabeza', label: 'Cabeza' },
  //   { key: 'ojos', label: 'Ojos' },
  //   { key: 'oidos', label: 'Oídos' },
  //   { key: 'nariz', label: 'Nariz' },
  //   { key: 'boca', label: 'Boca' },
  //   { key: 'cuello', label: 'Cuello' },
  //   { key: 'torax', label: 'Tórax' },
  //   { key: 'pulmones', label: 'Pulmones' },
  //   { key: 'corazon', label: 'Corazón' },
  //   { key: 'abdomen', label: 'Abdomen' },
  //   { key: 'genitales', label: 'Genitales' },
  //   { key: 'extremidades', label: 'Extremidades' },
  //   { key: 'columna', label: 'Columna' },
  //   { key: 'piel', label: 'Piel' },
  //   { key: 'neurologico', label: 'Neurológico' },
  // ];

  glasgowFields = [
    { key: 'apertura_ocular', label: 'Apertura Ocular', min: 1, max: 4, hint: '1-4' },
    { key: 'respuesta_verbal', label: 'Respuesta Verbal', min: 1, max: 5, hint: '1-5' },
    { key: 'respuesta_motora', label: 'Respuesta Motora', min: 1, max: 6, hint: '1-6' },
  ];

  silvermanFields = [
    { key: 'retraso_esternal', label: 'Retraso Esternal', min: 0, max: 2 },
    { key: 'aleteo_nasal', label: 'Aleteo Nasal', min: 0, max: 2 },
    { key: 'quejido_expiratorio', label: 'Quejido Expiratorio', min: 0, max: 2 },
    { key: 'movimiento_toracico', label: 'Mov. Torácico', min: 0, max: 2 },
    { key: 'retraccion_supraclavicular', label: 'Retr. Supraclavicular', min: 0, max: 2 },
  ];

  downeFields = [
    { key: 'frecuencia_respiratoria', label: 'Frec. Respiratoria', min: 0, max: 2 },
    { key: 'aleteo_nasal', label: 'Aleteo Nasal', min: 0, max: 2 },
    { key: 'quejido_respiratorio', label: 'Quejido Respiratorio', min: 0, max: 2 },
    { key: 'retraccion_toracoabdominal', label: 'Retr. Toracoabdominal', min: 0, max: 2 },
    { key: 'cinoasis', label: 'Cianosis', min: 0, max: 2 },
  ];

  apgarFields = [
    { key: 'tono_muscular', label: 'Tono Muscular', min: 0, max: 2 },
    { key: 'respuesta_refleja', label: 'Resp. Refleja', min: 0, max: 2 },
    { key: 'llanto', label: 'Llanto', min: 0, max: 2 },
    { key: 'respiracion', label: 'Respiración', min: 0, max: 2 },
    { key: 'coloracion', label: 'Coloración', min: 0, max: 2 },
  ];

  bishopFields = [
    { key: 'dilatacion', label: 'Dilatación', min: 0, max: 3 },
    { key: 'borramiento', label: 'Borramiento', min: 0, max: 3 },
    { key: 'posicion', label: 'Posición', min: 0, max: 2 },
    { key: 'consistencia', label: 'Consistencia', min: 0, max: 2 },
    { key: 'altura_presentacion', label: 'Altura Present.', min: 0, max: 3 },
  ];

  /* ── Totales computados ────────────────────────────────── */
  get glasgowTotal(): number {
    return (this.glasgow.apertura_ocular || 0)
      + (this.glasgow.respuesta_verbal || 0)
      + (this.glasgow.respuesta_motora || 0);
  }

  get silvermanTotal(): number {
    return (this.silverman.retraso_esternal || 0)
      + (this.silverman.aleteo_nasal || 0)
      + (this.silverman.quejido_expiratorio || 0)
      + (this.silverman.movimiento_toracico || 0)
      + (this.silverman.retraccion_supraclavicular || 0);
  }

  get downeTotal(): number {
    return (this.downe.frecuencia_respiratoria || 0)
      + (this.downe.aleteo_nasal || 0)
      + (this.downe.quejido_respiratorio || 0)
      + (this.downe.retraccion_toracoabdominal || 0)
      + (this.downe.cinoasis || 0);
  }

  get apgarTotal(): number {
    return (this.apgar.tono_muscular || 0)
      + (this.apgar.respuesta_refleja || 0)
      + (this.apgar.llanto || 0)
      + (this.apgar.respiracion || 0)
      + (this.apgar.coloracion || 0);
  }

  get bishopTotal(): number {
    return (this.bishop.dilatacion || 0)
      + (this.bishop.borramiento || 0)
      + (this.bishop.posicion || 0)
      + (this.bishop.consistencia || 0)
      + (this.bishop.altura_presentacion || 0);
  }

  /* ── Lifecycle ─────────────────────────────────────────── */
  constructor() {
    // Soportar uso en modal con input
    effect(() => {
      const inputId = this.id();
      if (inputId && !this.consultaId) {
        this.cargarDatosDesdeInput(inputId);
        this.gruposAntecedentes.forEach(g => {
          this.antecedentesAbiertos[g.key] = false;
        });
      }
    });
  }

  ngOnInit(): void {
    const inputId = this.id();
    const queryId = this.route.snapshot.queryParamMap.get('consultaId') || this.route.snapshot.queryParamMap.get('id');
    const id = inputId ? Number(inputId) : (queryId ? Number(queryId) : null);
    if (id) {
      this.cargarDatosDesdeInput(id);
    } else {
      this.cargarDatos();
    }
    this.gruposAntecedentes.forEach(g => {
      this.antecedentesAbiertos[g.key] = false;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarDatos(): void {
    const id = Number(this.route.snapshot.paramMap.get('consultaId'));
    if (!id) {
      return;
    }
    this.cargarDatosDesdeInput(id);
  }

  cargarDatosDesdeInput(id: number): void {
    if (!id) {
      return;
    }

    this.consultaId = id;
    this.tieneConsulta.set(true);
    this.isLoading.set(true);
    this.api.getCiclosDeConsulta(id).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading.set(false)),
      catchError(error => {
        this.error.set(error?.error?.detail ?? 'No se pudo cargar el expediente clínico.');
        return of([] as CicloConsulta[]);
      })
    ).subscribe(ciclos => {
      this.intervencionQuirurgica.set(
        [...ciclos].reverse().find(item => item.quirofano)?.quirofano ?? null
      );
      // Una nota creada es inmutable: NO se precarga. Se prepara una nota NUEVA,
      // con continuidad de especialidad/servicio y el número siguiente.
      const ultimo = ciclos[ciclos.length - 1];
      this.ciclo.set({
        consulta_id: id,
        numero: (ultimo?.numero ?? 0) + 1,
        activo: true,
        registro: new Date().toISOString(),
        usuario: '',
        especialidad: ultimo?.especialidad,
        especialidad_id: ultimo?.especialidad_id,
        servicio: ultimo?.servicio,
      });
      this.aplicarEspecialidad(ultimo?.especialidad);
      this.precargarUltimoOdontograma();
    });

    this.consultasApi.getConsultaId(id).pipe(
      takeUntil(this.destroy$),
      catchError(() => of(null))
    ).subscribe(consulta => {
      if (!consulta) return;
      this.pacienteId = (consulta as any).paciente_id ?? null;
      this.ciclo.update(actual => actual ? {
        ...actual,
        especialidad: consulta.especialidad ?? actual.especialidad,
        especialidad_id: (consulta as any).especialidad_id ?? actual.especialidad_id,
        servicio: consulta.servicio ?? actual.servicio,
      } : actual);
      this.aplicarEspecialidad(consulta.especialidad ?? this.ciclo()?.especialidad);
      this.precargarUltimoOdontograma();
    });
  }

  /**
   * Al abrir una nota odontológica nueva, trae el ÚLTIMO odontograma del
   * paciente (solo el odontograma, no el resto de la nota) para no volver a
   * capturarlo desde cero. Es idempotente: se dispara una sola vez.
   */
  private precargarUltimoOdontograma(): void {
    if (this.odontogramaPrecargado) return;
    if (!this.odontologiaActiva() || !this.pacienteId) return;
    this.odontogramaPrecargado = true;

    const pacienteId = this.pacienteId;
    this.api.getUltimoOdontograma(pacienteId).pipe(
      takeUntil(this.destroy$),
      catchError(() => of(null))
    ).subscribe(odontograma => {
      if (!odontograma) return;
      this.odontologia = { ...this.odontologia, odontograma };
      this.cdr.markForCheck();
    });
  }

  private aplicarEspecialidad(especialidad?: string): void {
    const normalizada = (especialidad ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    const esOdontologia = normalizada === 'ODON' || normalizada.includes('ODONTO');
    this.odontologiaActiva.set(esOdontologia);
    if (esOdontologia && this.tabActivo === 'clinica') this.tabActivo = 'odontologia';
    if (!esOdontologia && this.tabActivo === 'odontologia') this.tabActivo = 'clinica';
  }

  buscarPaciente(): void {
    const expediente = this.busquedaExpediente.trim();
    if (!expediente) {
      this.error.set('Escribe un expediente para buscar el paciente.');
      return;
    }

    this.buscandoPaciente.set(true);
    this.error.set(null);
    this.pacientesApi.pacienteExpediente(expediente).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.buscandoPaciente.set(false)),
      catchError(error => {
        this.error.set(error?.error?.detail ?? 'No se encontró el paciente.');
        return of(null);
      })
    ).subscribe(paciente => {
      if (!paciente) return;
      this.pacienteBuscado.set(paciente);
      this.intervencionesPaciente.set([]);
      this.api.getHistoriaClinica(paciente.id, true).pipe(
        takeUntil(this.destroy$),
        catchError(() => of(null))
      ).subscribe(historia => {
        const intervenciones = historia?.consultas.flatMap(grupo =>
          grupo.ciclos.map(ciclo => ciclo.quirofano).filter(
            (quirofano): quirofano is DatosQuirurgicos => !!quirofano
          )
        ) ?? [];
        this.intervencionesPaciente.set(intervenciones);
      });
      this.cargandoConsultas.set(true);
      this.consultasApi.getConsultasPorPaciente(paciente.id).pipe(
        takeUntil(this.destroy$),
        finalize(() => this.cargandoConsultas.set(false)),
        catchError(() => {
          this.error.set('No se pudieron cargar las consultas del paciente.');
          return of([] as ConsultasIdPaciente[]);
        })
      ).subscribe(consultas => this.consultasPaciente.set(consultas));
    });
  }

  seleccionarConsulta(consulta: ConsultasIdPaciente): void {
    this.router.navigate(['/enfermeria/notas-medicas', consulta.id]);
  }

  mapearDatos(ciclo: CicloConsulta): void {
    const dm = ciclo.datos_medicos;
    if (!dm) return;

    if (dm.detalle_clinicos) this.datosMedicos.detalle_clinicos = dm.detalle_clinicos;
    if (dm.impresion_clinica) this.datosMedicos.impresion_clinica = dm.impresion_clinica;
    if (dm.tratamiento) this.datosMedicos.tratamiento = dm.tratamiento;
    if (dm.ordenes) this.datosMedicos.ordenes = dm.ordenes;
    if (dm.estudios) this.datosMedicos.estudios = dm.estudios;
    if (dm.comentario) this.datosMedicos.comentario = dm.comentario;
    if (dm.contraindicado) this.datosMedicos.contraindicado = dm.contraindicado;
    if (dm.odontologia) {
      this.odontologia = {
        ...this.odontologia,
        ...dm.odontologia,
        odontograma: dm.odontologia.odontograma ?? this.odontologia.odontograma,
      };
    }

    if (dm.signos_vitales) this.signosVitales = { ...dm.signos_vitales };
    if (dm.antecedentes) this.antecedentes = { ...dm.antecedentes };
    if (dm.egreso) this.egreso = { ...dm.egreso, diagnosticos: dm.egreso.diagnosticos ?? [] };

    if (dm.examen_fisico) {
      const ef = dm.examen_fisico;
      const lastKey = (obj: any) => obj ? Object.keys(obj).pop() : null;

      const cuerpoKey = lastKey(ef.cuerpo);
      if (cuerpoKey && ef.cuerpo[cuerpoKey]) this.cuerpo = { ...ef.cuerpo[cuerpoKey] };

      const glasgowKey = lastKey(ef.glasgow);
      if (glasgowKey && ef.glasgow[glasgowKey]) this.glasgow = { ...ef.glasgow[glasgowKey] };

      const silvermanKey = lastKey(ef.silverman);
      if (silvermanKey && ef.silverman[silvermanKey]) this.silverman = { ...ef.silverman[silvermanKey] };

      const downeKey = lastKey(ef.downe);
      if (downeKey && ef.downe[downeKey]) this.downe = { ...ef.downe[downeKey] };

      const apgarKey = lastKey(ef.apgar);
      if (apgarKey && ef.apgar[apgarKey]) this.apgar = { ...ef.apgar[apgarKey] };

      const bishopKey = lastKey(ef.bishop);
      if (bishopKey && ef.bishop[bishopKey]) this.bishop = { ...ef.bishop[bishopKey] };
    }
  }

  procedimientosQuirofanoNota(datos: NonNullable<CicloConsulta['quirofano']>): string {
    return [datos.procedimiento_principal, datos.procedimiento_2, datos.procedimiento_3,
    datos.procedimiento_4, datos.procedimiento_5]
      .filter((valor): valor is string => !!valor?.trim()).join(' · ');
  }

  camposQuirofanoNota(datos: NonNullable<CicloConsulta['quirofano']>): Array<{ etiqueta: string; valor: string }> {
    const etiquetas: Record<string, string> = {
      intervencion_id: 'ID de intervención',
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

  /* ── Acciones UI ───────────────────────────────────────── */
  setTab(tab: string): void {
    this.tabActivo = tab;
  }

  /** Ajusta un valor numérico de escala respetando min/max (steppers táctiles). */
  ajustar(obj: any, campo: string, delta: number, min: number, max: number): void {
    const actual = Number(obj[campo]) || 0;
    obj[campo] = Math.min(max, Math.max(min, actual + delta));
  }

  /** Lee el valor numérico actual de un campo de escala. */
  val(obj: any, campo: string): number {
    return Number(obj[campo]) || 0;
  }

  /* ── Examen físico: selector corporal ────────────────────── */
  regionActiva: string | null = null;
  regionHover: string | null = null;

  /** Resalta y enfoca el campo asociado a una zona del cuerpo. */
  seleccionarRegion(key: string): void {
    this.regionActiva = key;
    const el = document.getElementById('campo-' + key) as HTMLInputElement | null;
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el?.focus({ preventScroll: true });
  }

  /** Etiqueta legible de una zona del cuerpo. */
  labelRegion(key: string | null): string {
    if (!key) return '';
    return this.segmentosCuerpo.find(s => s.key === key)?.label ?? '';
  }

  toggleAntecedente(key: string): void {
    this.antecedentesAbiertos[key] = !this.antecedentesAbiertos[key];
  }

  getAntecedentes(key: string): any[] {
    return (this.antecedentes as any)[key] ?? [];
  }

  agregarAntecedente(key: string): void {
    (this.antecedentes as any)[key].push({ descripcion: '' });
  }

  eliminarAntecedente(key: string, index: number): void {
    (this.antecedentes as any)[key].splice(index, 1);
  }

  agregarDx(): void {
    if (!this.egreso.diagnosticos) this.egreso.diagnosticos = [];
    this.egreso.diagnosticos.push({ codigo: '', descripcion: '' });
  }

  eliminarDx(index: number): void {
    this.egreso.diagnosticos?.splice(index, 1);
  }

  /* ── Helpers matemáticos ────────────────────────────────── */
  min = Math.min;
  max = Math.max;

  /* ── Interpretaciones ───────────────────────────────────── */
  interpretarGlasgow(): string {
    const t = this.glasgowTotal;
    if (t >= 13) return 'Leve / Normal';
    if (t >= 9) return 'Moderado';
    return 'Grave';
  }

  interpretarSilverman(): string {
    const t = this.silvermanTotal;
    if (t === 0) return 'Sin dificultad';
    if (t <= 3) return 'Dificultad leve';
    if (t <= 6) return 'Dificultad moderada';
    return 'Dificultad grave';
  }

  interpretarDowne(): string {
    const t = this.downeTotal;
    if (t <= 3) return 'Dificultad leve';
    if (t <= 6) return 'Dificultad moderada';
    return 'Dificultad grave';
  }

  interpretarApgar(): string {
    const t = this.apgarTotal;
    if (t >= 7) return 'Normal';
    if (t >= 4) return 'Depresión moderada';
    return 'Depresión grave';
  }

  interpretarBishop(): string {
    const t = this.bishopTotal;
    if (t >= 8) return 'Favorable para inducción';
    if (t >= 6) return 'Moderadamente favorable';
    return 'Desfavorable';
  }

  /* ── Guardar ────────────────────────────────────────────── */
  guardar(): void {
    if (!this.consultaId || this.guardando()) {
      if (!this.consultaId) this.mostrarMensaje('No se puede guardar: falta la consulta asociada.', 'error');
      return;
    }

    const ahora = new Date().toISOString();

    const odontologia = this.odontologiaActiva() ? {
      ...this.odontologia,
      odontograma: { ...this.odontologia.odontograma, dientes: { ...this.odontologia.odontograma.dientes } },
    } : undefined;
    const datosMedicos: DatoMedico = {
      ...this.datosMedicos,
      ...(odontologia ? {
        detalle_clinicos: odontologia.motivo_consulta || odontologia.examen_intraoral || this.datosMedicos.detalle_clinicos,
        impresion_clinica: odontologia.diagnostico || this.datosMedicos.impresion_clinica,
        tratamiento: odontologia.plan_tratamiento || this.datosMedicos.tratamiento,
        odontologia,
      } : {}),
      signos_vitales: { ...this.signosVitales },
      antecedentes: { ...this.antecedentes },
      egreso: { ...this.egreso },
      examen_fisico: {
        cuerpo: { [ahora]: { ...this.cuerpo } },
        glasgow: { [ahora]: { ...this.glasgow, puntuacion_total: this.glasgowTotal } },
        silverman: { [ahora]: { ...this.silverman, puntuacion_total: this.silvermanTotal } },
        downe: { [ahora]: { ...this.downe, puntuacion_total: this.downeTotal } },
        apgar: { [ahora]: { ...this.apgar, puntuacion_total: this.apgarTotal, interpretacion: this.interpretarApgar() } },
        bishop: { [ahora]: { ...this.bishop, puntuacion_total: this.bishopTotal } },
      },
    };

    this.guardando.set(true);
    this.error.set(null);
    this.api.iniciarClico({
      consulta_id: this.consultaId,
      numero: 0,
      activo: true,
      registro: ahora,
      usuario: '',
      especialidad: this.ciclo()?.especialidad,
      especialidad_id: this.ciclo()?.especialidad_id,
      servicio: this.ciclo()?.servicio,
      contenido: datosMedicos.impresion_clinica || datosMedicos.detalle_clinicos || (odontologia ? 'Nota odontológica' : 'Nota médica'),
      datos_medicos: datosMedicos,
    } as CicloConsulta).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.guardando.set(false)),
      catchError(error => {
        this.mostrarMensaje(error?.error?.detail ?? 'No se pudo guardar la nota médica.', 'error');
        return of(null);
      })
    ).subscribe(ciclo => {
      if (!ciclo) return;
      this.ciclo.set(ciclo);
      this.mostrarMensaje('Nota médica guardada correctamente.', 'success');
    });
  }

  private mostrarMensaje(texto: string, tipo: 'success' | 'error'): void {
    this.mensaje.set({ texto, tipo });
    setTimeout(() => this.mensaje.set(null), 4500);
  }

  regresar(): void {
    this.location.back();
  }

  editar(id: number | undefined): void {
    // TODO: this.router.navigate(['/consultas', id, 'editar']);
    console.log('[NotaMedica] Editar ciclo', id);
  }
}
