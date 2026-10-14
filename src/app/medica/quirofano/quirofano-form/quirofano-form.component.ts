// quirofano-form.component.ts

import { Location } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  FormatoProcedimiento,
  EstadoCirugia,
  RangoEspecialista,
  ProcedenciaProcedimiento,
  QuirofanoNumero,
  Especialidad,
  IntervencionCreate,
  IntervencionUpdate,
  EquipoQuirurgico,
  DatosExtraIntervencion,
} from '../../../interface/quirofano.interface';
import { CatalogoProcedimiento } from '../../../interface/procedimientos';
import { PacienteJoin } from '../../../interface/interfaces';
import { MedicoOut } from '../../../interface/medicos.interface';
import { PacienteService } from '../../../registros/patient/paciente.service';
import { MedicosService } from '../../../std/medicos/medicos.service';
import { IconService } from '../../../service/icon.service';
import { EspecialidadesService } from '../../../service/especialidades.service';
import { CatalogoService } from '../../../service/catalogo.service';
import { QuirofanoService } from '../quirofano.service';

/** Captura los datos de programación y realización de una intervención. */
@Component({
  selector: 'app-quirofano-form',
  templateUrl: './quirofano-form.component.html',
  styleUrls: ['./quirofano-form.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ReactiveFormsModule]
})
export class QuirofanoFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  intervencionId: number | null = null;
  consultaId: number | null = null;
  enEdicion = false;
  cargando = false;
  guardando = false;
  buscandoPaciente = false;

  pacienteId: number | null = null;
  pacienteInfo: PacienteJoin | null = null;
  pacienteLabel = '';
  errorPaciente = '';

  // ── Catálogos ──
  formatos: FormatoProcedimiento[] = [];
  estados: EstadoCirugia[] = [];
  rangos: RangoEspecialista[] = [];
  procedencias: ProcedenciaProcedimiento[] = [];
  quirofanosNumero: QuirofanoNumero[] = [];
  especialidades: Especialidad[] = [];
  catalogoProcedimientos: CatalogoProcedimiento[] = [];
  areasCuerpo: import('../../../interface/procedimientos').AreaCuerpoIntervenida[] = [];
  medicos: MedicoOut[] = [];

  form: FormGroup = this.fb.group({
    expediente: ['', Validators.required],
    especialidad_id: [null, Validators.required],
    procedimiento_principal: ['', Validators.required],
    procedimiento_2: [''],
    procedimiento_3: [''],
    procedimiento_4: [''],
    procedimiento_5: [''],
    area_cuerpo_intervenida: [''],
    id_area_cuerpo_intervenida: [null],
    estado_cirugia_id: [null],
    formato_procedimiento_id: [null],
    procedencia_procedimiento_id: [null],
    rango_especialista_id: [null],
    quirofano_numero_id: [null],
    personal_atencion_id: [null],
    hora_inicio_anestesia: [''],
    hora_inicio_intervencion: [''],
    hora_finaliza_intervencion: [''],
    hora_finaliza_limpieza_prepara_quirofano: [''],
    observaciones: [''],
    // Equipo quirúrgico (texto libre; se persiste dentro de datos_extra JSONB)
    circulante: [''],
    instrumentista: [''],
    pediatra: [''],
    medico_apoyo: [''],
  });

  saveIcon: any;
  cancelIcon: any;

  /** Mensaje de validación visible después de intentar guardar. */
  mensajeFormulario = '';

  /** Especialidades tal cual las devuelve el catálogo (incluye la seleccionada al editar). */
  private especialidadesCargadas: Especialidad[] = [];

  constructor(
    private api: QuirofanoService,
    private catalogoApi: CatalogoService,
    private especialidadesApi: EspecialidadesService,
    private pacientesApi: PacienteService,
    private medicosApi: MedicosService,
    private iconService: IconService
  ) {
    this.saveIcon = this.iconService.getIcon('saveIcon');
    this.cancelIcon = this.iconService.getIcon('cancelIcon');
  }

  get f() { return this.form.controls; }

  /** Etiqueta clara del botón principal. */
  get textoGuardar(): string {
    if (this.guardando) return 'Guardando…';
    return this.enEdicion ? 'Guardar cambios' : 'Registrar intervención';
  }

  /** Etiqueta clara del botón secundario. */
  get textoCancelar(): string {
    return this.guardando ? 'Un momento…' : 'Cancelar';
  }

  /** Campos obligatorios aún incompletos (para orientar al usuario). */
  get faltantes(): string[] {
    const pendientes: string[] = [];
    if (this.form.get('expediente')?.invalid) pendientes.push('Expediente');
    if (this.form.get('especialidad_id')?.invalid) pendientes.push('Especialidad');
    if (this.form.get('procedimiento_principal')?.invalid) pendientes.push('Procedimiento principal');
    if (!this.pacienteId) pendientes.push('Paciente vinculado');
    return pendientes;
  }

  /** Especialidades para el grupo de botones (siempre incluye la seleccionada al editar). */
  get especialidadesBotones(): Especialidad[] {
    const lista = this.especialidades;
    const sel = this.form.value.especialidad_id;
    if (sel == null || lista.some(e => e.id === sel)) return lista;
    const extra = this.especialidadesCargadas.find(e => e.id === sel);
    return extra ? [...lista, extra] : lista;
  }

  /** Médicos de la especialidad seleccionada (si hay filtro); si no, toda la plantilla. */
  get medicosFiltrados(): MedicoOut[] {
    const esp = this.form.value.especialidad_id;
    const sel = this.form.value.personal_atencion_id;
    let lista = this.medicos;
    if (esp) {
      const filtrados = this.medicos.filter(m => m.especialidad_id === esp);
      if (filtrados.length) lista = filtrados;
    }
    // Conserva el cirujano ya elegido aunque no pertenezca a la especialidad filtrada.
    if (sel != null && !lista.some(m => m.id === sel)) {
      const actual = this.medicos.find(m => m.id === sel);
      if (actual) lista = [...lista, actual];
    }
    return lista;
  }

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarMedicos();
    this.configurarEstadoAutomatico();

    // Al corregir cualquier dato se oculta el aviso de validación.
    this.form.valueChanges.subscribe(() => {
      if (this.mensajeFormulario && this.faltantes.length === 0) this.mensajeFormulario = '';
    });




    // Preseleccionar "Especialista" por defecto si existe en catálogo
    this.api.getRangosEspecialista(true).subscribe({
      next: rangos => {
        const def = rangos.find(r => (r.codigo || '').toUpperCase() === 'ESP' || (r.nombre || '').toLowerCase().includes('especialista'));
        if (def) {
          this.form.patchValue({ rango_especialista_id: def.rango_especialista_id });
        }
      },
      error: () => { }
    });

    const editarId = Number(this.route.snapshot.paramMap.get('id'));
    if (editarId) {
      this.enEdicion = true;
      this.intervencionId = editarId;
      this.cargarIntervencion(editarId);
      return;
    }

    const consultaId = Number(this.route.snapshot.queryParamMap.get('consulta_id'));
    if (consultaId) {
      this.consultaId = consultaId;
    }

    const expediente = this.route.snapshot.queryParamMap.get('expediente');
    if (expediente) {
      this.form.patchValue({ expediente });
      this.buscarPaciente();
    }
  }

  cargarCatalogos(): void {
    this.api.getFormatos().subscribe({ next: d => this.formatos = d, error: () => { } });
    this.api.getEstadosCirugia().subscribe({ next: d => this.estados = d.filter(e => ['FIN', 'CAN'].includes((e.codigo || '').toUpperCase())), error: () => { } });
    this.api.getRangosEspecialista().subscribe({ next: d => this.rangos = d.filter(r => ['ESP'].includes((r.codigo || '').toUpperCase())), error: () => { } });
    this.api.getProcedencias().subscribe({ next: d => this.procedencias = d.filter(p => ['ELE', 'EMG'].includes((p.codigo || '').toUpperCase())), error: () => { } });
    this.api.getQuirofanosNumero().subscribe({ next: d => this.quirofanosNumero = d, error: () => { } });
    this.especialidadesApi.getEspecialidades(true, true).subscribe({
      next: d => {
        this.especialidadesCargadas = d;
        this.especialidades = d.filter(e => {
          const c = (e.codigo ?? '').toUpperCase();
          const n = (e.nombre ?? '').toLowerCase();
          return c === 'CIRU' || c === 'TRAU' || c === 'GIN' || c === 'GINE' || n.includes('ginec') || n.includes('cirug') || n.includes('traum');
        });
      },
      error: () => { }
    });

    // Catálogo maestro de procedimientos
    this.catalogoApi.getCatalogoProcedimientos({ activo: true, limit: 5000 }).subscribe({
      next: d => this.catalogoProcedimientos = d,
      error: () => { }
    });
    // Catálogo de áreas del cuerpo intervenida
    this.catalogoApi.getAreasCuerpo(true).subscribe({
      next: d => this.areasCuerpo = d,
      error: () => { }
    });
  }

  // Catálogo maestro filtrado por la especialidad seleccionada (mantener comportamiento previo).
  get catalogoFiltrado(): CatalogoProcedimiento[] {
    const esp = this.form.value.especialidad_id;
    if (!esp) return this.catalogoProcedimientos;
    // Si no hay especialidad_ref, mostrar también (genéricas)
    return this.catalogoProcedimientos.filter(
      p => p.especialidad_ref === esp || p.especialidad_ref == null
    );
  }

  // Texto histórico del área cuando el registro es anterior al catálogo normalizado.
  get areaLegacyTexto(): string {
    const id = this.form.value.id_area_cuerpo_intervenida;
    const txt = this.form.value.area_cuerpo_intervenida;
    return id == null && txt ? txt : '';
  }

  onEspecialidadChange(): void {
    const campos = [
      'procedimiento_principal',
      'procedimiento_2',
      'procedimiento_3',
      'procedimiento_4',
      'procedimiento_5'
    ];
    const reset: any = {};
    for (const c of campos) reset[c] = '';
    this.form.patchValue(reset);
  }

  cargarMedicos(): void {
    this.medicosApi.getAllMedicos().subscribe({
      next: (data) => this.medicos = data.filter(m => m.activo),
      error: () => { }
    });
  }

  buscarPaciente(): void {
    if (this.enEdicion || this.buscandoPaciente) return;
    const expediente = (this.form.value.expediente ?? '').trim();
    if (!expediente) { this.errorPaciente = 'Ingrese un expediente'; return; }

    this.buscandoPaciente = true;
    this.errorPaciente = '';
    this.pacientesApi.pacienteExpediente(expediente).subscribe({
      next: (p) => {
        this.pacienteInfo = p;
        this.pacienteId = p.id;
        this.pacienteLabel = [
          p.nombre.primer_nombre,
          p.nombre.segundo_nombre,
          p.nombre.primer_apellido,
          p.nombre.segundo_apellido,
        ].filter(Boolean).join(' ');
        this.buscandoPaciente = false;
        this.mensajeFormulario = '';
      },
      error: () => {
        this.buscandoPaciente = false;
        this.pacienteId = null;
        this.pacienteInfo = null;
        this.errorPaciente = 'Paciente no encontrado';
      }
    });
  }

  limpiarPaciente(): void {
    this.pacienteId = null;
    this.pacienteInfo = null;
    this.pacienteLabel = '';
    this.errorPaciente = '';
    this.form.patchValue({ expediente: '' });
  }

  cargarIntervencion(id: number): void {
    this.cargando = true;
    this.api.getIntervencion(id).subscribe({
      next: (data) => {
        this.pacienteId = data.paciente_id;
        this.pacienteLabel = data.paciente_nombre || '';
        this.consultaId = data.consulta_id ?? this.consultaId;
        this.form.patchValue({
          expediente: data.expediente || data.paciente_id?.toString() || '',
          procedimiento_principal: data.procedimiento_principal || data.procedimiento_principal_catalogo_nombre || '',
          procedimiento_2: data.procedimiento_2 || data.procedimiento_2_catalogo_nombre || '',
          procedimiento_3: data.procedimiento_3 || data.procedimiento_3_catalogo_nombre || '',
          procedimiento_4: data.procedimiento_4 || data.procedimiento_4_catalogo_nombre || '',
          procedimiento_5: data.procedimiento_5 || data.procedimiento_5_catalogo_nombre || '',
          area_cuerpo_intervenida: data.area_cuerpo_intervenida || '',
          id_area_cuerpo_intervenida: data.id_area_cuerpo_intervenida ?? null,
          estado_cirugia_id: data.estado_cirugia_id ?? null,
          formato_procedimiento_id: data.formato_procedimiento_id ?? null,
          procedencia_procedimiento_id: data.procedencia_procedimiento_id ?? null,
          rango_especialista_id: data.rango_especialista_id ?? (this.form.value.rango_especialista_id ?? null),
          especialidad_id: data.especialidad_id ?? null,
          quirofano_numero_id: data.quirofano_numero_id ?? null,
          personal_atencion_id: data.personal_atencion_id ?? null,
          hora_inicio_anestesia: (data.hora_inicio_anestesia || '').slice(0, 5),
          hora_inicio_intervencion: (data.hora_inicio_intervencion || '').slice(0, 5),
          hora_finaliza_intervencion: (data.hora_finaliza_intervencion || '').slice(0, 5),
          hora_finaliza_limpieza_prepara_quirofano: (data.hora_finaliza_limpieza_prepara_quirofano || '').slice(0, 5),
          observaciones: data.observaciones || '',
          circulante: data.datos_extra?.equipo?.circulante ?? '',
          instrumentista: data.datos_extra?.equipo?.instrumentista ?? '',
          pediatra: data.datos_extra?.equipo?.pediatra ?? '',
          medico_apoyo: data.datos_extra?.equipo?.medico_apoyo ?? '',
        });
      },
      error: () => { },
      complete: () => { this.cargando = false; }
    });
  }

  private limpiarPayload(obj: any): any {
    const limpio: any = {};
    for (const key in obj) {
      const val = obj[key];
      if (val !== undefined && val !== null && val !== '') limpio[key] = val;
    }
    return limpio;
  }

  /** Empaqueta el equipo quirúrgico (texto libre) en la estructura JSONB `datos_extra`. */
  private construirDatosExtra(v: any): DatosExtraIntervencion | undefined {
    const equipo: EquipoQuirurgico = {};
    if (v.circulante?.trim()) equipo.circulante = v.circulante.trim();
    if (v.instrumentista?.trim()) equipo.instrumentista = v.instrumentista.trim();
    if (v.pediatra?.trim()) equipo.pediatra = v.pediatra.trim();
    if (v.medico_apoyo?.trim()) equipo.medico_apoyo = v.medico_apoyo.trim();
    return Object.keys(equipo).length ? { equipo } : undefined;
  }

  guardar(): void {
    if (this.guardando) return;
    if (this.form.invalid || !this.pacienteId) {
      this.form.markAllAsTouched();
      this.mensajeFormulario = 'Faltan datos: ' + this.faltantes.join(', ');
      return;
    }
    this.mensajeFormulario = '';
    this.guardando = true;
    const v = this.form.value;
    const areaSel = this.areasCuerpo.find(a => a.id === v.id_area_cuerpo_intervenida);

    const base = {
      consulta_id: this.consultaId ?? undefined,
      personal_atencion_id: v.personal_atencion_id ?? undefined,
      estado_cirugia_id: v.estado_cirugia_id ?? undefined,
      formato_procedimiento_id: v.formato_procedimiento_id ?? undefined,
      procedencia_procedimiento_id: v.procedencia_procedimiento_id ?? undefined,
      rango_especialista_id: v.rango_especialista_id ?? undefined,
      especialidad_id: v.especialidad_id ?? undefined,
      quirofano_numero_id: v.quirofano_numero_id ?? undefined,
      procedimiento_principal: v.procedimiento_principal || undefined,
      procedimiento_2: v.procedimiento_2 || undefined,
      procedimiento_3: v.procedimiento_3 || undefined,
      procedimiento_4: v.procedimiento_4 || undefined,
      procedimiento_5: v.procedimiento_5 || undefined,
      area_cuerpo_intervenida: areaSel?.nombre || v.area_cuerpo_intervenida || undefined,
      id_area_cuerpo_intervenida: v.id_area_cuerpo_intervenida ?? undefined,
      hora_inicio_anestesia: v.hora_inicio_anestesia || undefined,
      hora_inicio_intervencion: v.hora_inicio_intervencion || undefined,
      hora_finaliza_intervencion: v.hora_finaliza_intervencion || undefined,
      hora_finaliza_limpieza_prepara_quirofano: v.hora_finaliza_limpieza_prepara_quirofano || undefined,
      observaciones: v.observaciones || undefined,
      datos_extra: this.construirDatosExtra(v),
    };

    if (this.enEdicion && this.intervencionId) {
      const payload = this.limpiarPayload(base) as IntervencionUpdate;
      this.api.actualizarIntervencion(this.intervencionId, payload).subscribe({
        next: () => this.router.navigate(['/quirofano']),
        error: () => { this.guardando = false; }
      });
      return;
    }

    const payload = this.limpiarPayload({
      ...base,
      paciente_id: this.pacienteId,
      expediente: v.expediente || undefined,
    }) as IntervencionCreate;

    this.api.crearIntervencion(payload).subscribe({
      next: () => this.router.navigate(['/quirofano']),
      error: () => { this.guardando = false; }
    });
  }

  volver(): void { this.location.back(); }

  onAreaCuerpoInput(event: Event): void {
    const texto = (event.target as HTMLInputElement).value;
    const textoNormalizado = texto.trim().toLocaleLowerCase();
    const area = this.areasCuerpo.find(
      a => a.nombre.trim().toLocaleLowerCase() === textoNormalizado
    );
    this.form.patchValue({
      id_area_cuerpo_intervenida: area?.id ?? null
    }, { emitEvent: false });
  }

  private configurarEstadoAutomatico(): void {
    this.form.get('hora_finaliza_intervencion')?.valueChanges.subscribe(hora => {
      if (hora) {
        const estadoFinalizado = this.estados.find(
          e => (e.codigo || '').toUpperCase() === 'FIN'
        );
        if (estadoFinalizado) {
          this.form.patchValue({
            estado_cirugia_id: estadoFinalizado.estado_cirugia_id
          }, { emitEvent: false });
        }
      }
    });
  }

}
