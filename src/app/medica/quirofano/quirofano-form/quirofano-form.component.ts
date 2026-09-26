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
  ProcedimientoQuirofano,
  IntervencionCreate,
  IntervencionUpdate,
} from '../../../interface/quirofano.interface';
import { PacienteJoin } from '../../../interface/interfaces';
import { MedicoOut } from '../../../interface/medicos.interface';
import { PacienteService } from '../../../registros/patient/paciente.service';
import { MedicosService } from '../../../std/medicos/medicos.service';
import { IconService } from '../../../service/icon.service';
import { EspecialidadesService } from '../../../service/especialidades.service';
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
  procedimientosQuirofano: ProcedimientoQuirofano[] = [];
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
  });

  saveIcon: any;
  cancelIcon: any;

  constructor(
    private api: QuirofanoService,
    private especialidadesApi: EspecialidadesService,
    private pacientesApi: PacienteService,
    private medicosApi: MedicosService,
    private iconService: IconService
  ) {
    this.saveIcon = this.iconService.getIcon('saveIcon');
    this.cancelIcon = this.iconService.getIcon('cancelIcon');
  }

  get f() { return this.form.controls; }

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarMedicos();

    const editarId = Number(this.route.snapshot.paramMap.get('id'));
    if (editarId) {
      this.enEdicion = true;
      this.intervencionId = editarId;
      this.cargarIntervencion(editarId);
      return;
    }

    const expediente = this.route.snapshot.queryParamMap.get('expediente');
    if (expediente) {
      this.form.patchValue({ expediente });
      this.buscarPaciente();
    }
  }

  cargarCatalogos(): void {
    this.api.getFormatos().subscribe({ next: d => this.formatos = d, error: () => {} });
    this.api.getEstadosCirugia().subscribe({ next: d => this.estados = d, error: () => {} });
    this.api.getRangosEspecialista().subscribe({ next: d => this.rangos = d, error: () => {} });
    this.api.getProcedencias().subscribe({ next: d => this.procedencias = d, error: () => {} });
    this.api.getQuirofanosNumero().subscribe({ next: d => this.quirofanosNumero = d, error: () => {} });
    this.especialidadesApi.getEspecialidades(true, true).subscribe({ next: d => this.especialidades = d, error: () => {} });
    this.api.getProcedimientosQuirofano().subscribe({ next: d => this.procedimientosQuirofano = d, error: () => {} });
  }

  // Sugerencias del autocompletado: si hay especialidad, sus procedimientos
  // más los de "Todas (mixta)"; si no, todo el catálogo.
  get procedimientos(): ProcedimientoQuirofano[] {
    const esp = this.form.value.especialidad_id;
    if (!esp) return this.procedimientosQuirofano;
    return this.procedimientosQuirofano.filter(
      p => p.especialidad_id === esp || p.especialidad_id == null
    );
  }

  onEspecialidadChange(): void {
    const campos = ['procedimiento_principal', 'procedimiento_2', 'procedimiento_3', 'procedimiento_4', 'procedimiento_5'];
    for (const c of campos) {
      this.form.patchValue({ [c]: '' });
    }
  }

  cargarMedicos(): void {
    this.medicosApi.getMedicos({}).subscribe({
      next: (data) => this.medicos = data.personal_atencion.filter(m => m.activo),
      error: () => {}
    });
  }

  buscarPaciente(): void {
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
        this.form.patchValue({
          expediente: data.expediente || data.paciente_id?.toString() || '',
          procedimiento_principal: data.procedimiento_principal || '',
          procedimiento_2: data.procedimiento_2 || '',
          procedimiento_3: data.procedimiento_3 || '',
          procedimiento_4: data.procedimiento_4 || '',
          procedimiento_5: data.procedimiento_5 || '',
          area_cuerpo_intervenida: data.area_cuerpo_intervenida || '',
          estado_cirugia_id: data.estado_cirugia_id ?? null,
          formato_procedimiento_id: data.formato_procedimiento_id ?? null,
          procedencia_procedimiento_id: data.procedencia_procedimiento_id ?? null,
          rango_especialista_id: data.rango_especialista_id ?? null,
          quirofano_numero_id: data.quirofano_numero_id ?? null,
          personal_atencion_id: data.personal_atencion_id ?? null,
          hora_inicio_anestesia: (data.hora_inicio_anestesia || '').slice(0, 5),
          hora_inicio_intervencion: (data.hora_inicio_intervencion || '').slice(0, 5),
          hora_finaliza_intervencion: (data.hora_finaliza_intervencion || '').slice(0, 5),
          hora_finaliza_limpieza_prepara_quirofano: (data.hora_finaliza_limpieza_prepara_quirofano || '').slice(0, 5),
          observaciones: data.observaciones || '',
        });
      },
      error: () => {},
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

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.pacienteId) {
      this.errorPaciente = 'Debe seleccionar un paciente';
      return;
    }

    this.guardando = true;
    const v = this.form.value;

    const base = {
      personal_atencion_id: v.personal_atencion_id ?? undefined,
      estado_cirugia_id: v.estado_cirugia_id ?? undefined,
      formato_procedimiento_id: v.formato_procedimiento_id ?? undefined,
      procedencia_procedimiento_id: v.procedencia_procedimiento_id ?? undefined,
      rango_especialista_id: v.rango_especialista_id ?? undefined,
      quirofano_numero_id: v.quirofano_numero_id ?? undefined,
      procedimiento_principal: v.procedimiento_principal || undefined,
      procedimiento_2: v.procedimiento_2 || undefined,
      procedimiento_3: v.procedimiento_3 || undefined,
      procedimiento_4: v.procedimiento_4 || undefined,
      procedimiento_5: v.procedimiento_5 || undefined,
      area_cuerpo_intervenida: v.area_cuerpo_intervenida || undefined,
      hora_inicio_anestesia: v.hora_inicio_anestesia || undefined,
      hora_inicio_intervencion: v.hora_inicio_intervencion || undefined,
      hora_finaliza_intervencion: v.hora_finaliza_intervencion || undefined,
      hora_finaliza_limpieza_prepara_quirofano: v.hora_finaliza_limpieza_prepara_quirofano || undefined,
      observaciones: v.observaciones || undefined,
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
}
