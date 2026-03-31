import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { ApiService } from '../../../service/api.service';
import { ConsultaUtilService } from '../../../service/consulta-util.service';
import { Dict, ciclos, tipoConsulta, especialidades, servicios } from '../../../enum/diccionarios';
import { Paciente } from '../../../interface/interfaces';
import {
  ConsultaOut, ConsultaUpdate, RegistroConsultaCreate,
  CicloClinico, EstadoCiclo, Indicador, Egreso, Dx
} from './../../../interface/consultas';
import { EdadPipe } from '../../../pipes/edad.pipe';
import { DatosExtraPipe } from '../../../pipes/datos-extra.pipe';
import { CuiPipe } from '../../../pipes/cui.pipe';
import { addIcon, removeIcon, saveIcon, cancelIcon, findIcon, manIcon, womanIcon } from '../../../shared/icons/svg-icon';

@Component({
  selector: 'app-formConsulta',
  templateUrl: './formConsulta.component.html',
  styleUrls: ['./formConsulta.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, EdadPipe, DatosExtraPipe, CuiPipe]
})
export class FormConsultaComponent implements OnInit {

  form: FormGroup = new FormGroup({});
  paciente: Paciente = {} as Paciente;
  consultaActual?: ConsultaOut;
  private consultaId?: number;
  historialCiclos: CicloClinico[] = [];
  enEdicion = false;
  usuarioActual = '';

  tipoConsulta: Dict[] = tipoConsulta;
  ciclos: Dict[] = ciclos;
  especialidades: Dict[] = especialidades;
  servicios: Dict[] = servicios;

  condicionesEgreso = [
    { value: 'recuperado', label: 'Recuperado' },
    { value: 'mismo_estado', label: 'Mismo estado' },
    { value: 'referido', label: 'Referido' },
    { value: 'fallecido', label: 'Fallecido' },
    { value: 'contraindicado', label: 'Contraindicado' },
    { value: 'fugado', label: 'Fugado' },
  ];

  addIcon!: SafeHtml; removeIcon!: SafeHtml; saveIcon!: SafeHtml;
  cancelIcon!: SafeHtml; findIcon!: SafeHtml; womanIcon!: SafeHtml; manIcon!: SafeHtml;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private consultaUtil: ConsultaUtilService,
    private sanitizer: DomSanitizer
  ) {
    this.inicializarFormulario();
    this.inicializarSVG();
  }

  ngOnInit(): void {
    this.usuarioActual = this.api.getUsuarioActual().username;

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id && !isNaN(id) && id !== 0) {
      this.consultaId = id;
      this.enEdicion = true;
      this.cargarConsulta(id);
    }
  }

  // ══════════════════════════════════════════════════════════
  // FORMULARIO
  // ══════════════════════════════════════════════════════════
  private inicializarFormulario(): void {
    this.form = this.fb.group({
      // Solo lectura
      id: [{ value: null, disabled: true }],
      expediente: [{ value: '', disabled: true }],
      documento: [{ value: '', disabled: true }],
      fecha_consulta: [{ value: '', disabled: true }],
      hora_consulta: [{ value: '', disabled: true }],
      orden: [{ value: null, disabled: true }],

      // Editables
      paciente_id: [0],
      tipo_consulta: [0],
      especialidad: [''],
      servicio: [''],

      // Indicadores
      indicadores: this.fb.group({
        estudiante_publico: [false], empleado_publico: [false],
        accidente_laboral: [false], discapacidad: [false],
        accidente_transito: [false], arma_fuego: [false],
        arma_blanca: [false], ambulancia: [false],
        embarazo: [false],
      }),

      // Nuevo ciclo
      nuevo_estado: [''],
      nuevo_servicio: [''],
      nuevo_comentario: [''],

      // Egreso — campo propio de la consulta (fuera del ciclo)
      egreso: this.fb.group({
        condicion: [''],
        referencia: [''],
        medico: [''],
        registro: [''],   // datetime-local → se convierte a ISO al guardar
        codigo: [''],   // código del diagnóstico (opcional)
        descripcion: [''],   // descripción del diagnóstico
      }),
    });
  }

  private inicializarSVG(): void {
    this.addIcon = this.sanitizer.bypassSecurityTrustHtml(addIcon);
    this.removeIcon = this.sanitizer.bypassSecurityTrustHtml(removeIcon);
    this.saveIcon = this.sanitizer.bypassSecurityTrustHtml(saveIcon);
    this.cancelIcon = this.sanitizer.bypassSecurityTrustHtml(cancelIcon);
    this.findIcon = this.sanitizer.bypassSecurityTrustHtml(findIcon);
    this.womanIcon = this.sanitizer.bypassSecurityTrustHtml(womanIcon);
    this.manIcon = this.sanitizer.bypassSecurityTrustHtml(manIcon);
  }

  // ══════════════════════════════════════════════════════════
  // CARGA
  // ══════════════════════════════════════════════════════════
  cargarConsulta(id: number): void {
    this.api.getConsultaId(id)
      .pipe(catchError(err => { this.mostrarError('cargar consulta', err); return of(null); }))
      .subscribe(data => {
        if (!data) return;
        this.consultaActual = data;

        this.form.patchValue({
          id: data.id,
          expediente: data.expediente,
          documento: data.documento,
          paciente_id: data.paciente_id,
          tipo_consulta: data.tipo_consulta,
          especialidad: data.especialidad,
          servicio: data.servicio,
          fecha_consulta: data.fecha_consulta,
          hora_consulta: data.hora_consulta,
          orden: data.orden,
          indicadores: data.indicadores,

          // ✅ Egreso desde data.egreso (campo raíz de la consulta, no del ciclo)
          egreso: {
            condicion: data.egreso?.condicion ?? '',
            referencia: data.egreso?.referencia ?? '',
            medico: data.egreso?.medico ?? '',
            registro: data.egreso?.registro
              ? new Date(data.egreso.registro).toISOString().slice(0, 16)
              : '',
            codigo: data.egreso?.diagnosticos?.[0]?.codigo ?? '',
            descripcion: data.egreso?.diagnosticos?.[0]?.descripcion ?? '',
          },
        });

        this.historialCiclos = [...(data.ciclo ?? [])];
        if (data.paciente_id) this.cargarPaciente(data.paciente_id);
      });
  }

  cargarPaciente(idP: number): void {
    this.api.getPaciente(idP)
      .pipe(catchError(err => { this.mostrarError('cargar paciente', err); return of(null); }))
      .subscribe(data => {
        if (!data) return;
        this.paciente = data;
        this.form.patchValue({ paciente_id: idP });
      });
  }

  // ══════════════════════════════════════════════════════════
  // GUARDAR
  // ══════════════════════════════════════════════════════════
  guardar(): void {
    if (this.enEdicion) this.actualizarConsulta();
    else this.registrarNuevaAdmision();
    this.router.navigate(['/detalleAdmision', this.consultaId]);
  }

  private registrarNuevaAdmision(): void {
    const v = this.form.getRawValue();
    this.api.registrarAdmision({
      paciente_id: v.paciente_id,
      tipo_consulta: v.tipo_consulta,
      especialidad: v.especialidad,
      servicio: v.servicio,
      indicadores: v.indicadores,
      ciclo: [],
    })
      .pipe(
        tap(() => this.mostrarExito('Admisión registrada')),
        catchError(err => { this.mostrarError('registrar', err); return of(null); })
      )
      .subscribe(r => { if (r) this.volver(); });
  }

  private actualizarConsulta(): void {
    if (!this.consultaId) return;
    const v = this.form.getRawValue();

    // ── Payload base ───────────────────────────────────────
    const payload: ConsultaUpdate = {
      especialidad: v.especialidad || undefined,
      servicio: v.servicio || undefined,
      indicadores: v.indicadores as Indicador,
    };

    // ── Ciclo: solo si se eligió un nuevo estado ───────────
    if (v.nuevo_estado) {
      payload.ciclo = {
        estado: v.nuevo_estado as EstadoCiclo,
        especialidad: v.especialidad || undefined,
        servicio: v.nuevo_servicio || v.servicio || undefined,
        comentario: v.nuevo_comentario || undefined,
      } as CicloClinico;
    }

    // ── Egreso: campo propio de la consulta ────────────────
    // Se envía solo si condicion tiene valor
    if (v.egreso?.condicion) {
      payload.egreso = {
        registro: v.egreso.registro
          ? new Date(v.egreso.registro).toISOString()
          : new Date().toISOString(),
        condicion: v.egreso.condicion,
        referencia: v.egreso.referencia || undefined,
        medico: v.egreso.medico || undefined,
        // Diagnóstico solo si hay descripción
        diagnosticos: v.egreso.descripcion
          ? [{ codigo: v.egreso.codigo || '', descripcion: v.egreso.descripcion, tipo: 'egreso' } as Dx]
          : [],
      } as Egreso;
    }

    // ── Request ────────────────────────────────────────────
    this.api.updateConsulta(this.consultaId, payload)
      .pipe(
        tap(() => this.mostrarExito('Consulta actualizada')),
        catchError(err => { this.mostrarError('actualizar', err); return of(null); })
      )
      .subscribe(r => {
        if (r) {
          this.form.patchValue({ nuevo_estado: '', nuevo_servicio: '', nuevo_comentario: '' });
          this.cargarConsulta(this.consultaId!);
        }
      });
  }

  actualizarIndicadores(): void {
    if (!this.consultaId) return;
    this.api.updateConsulta(this.consultaId, {
      indicadores: this.form.get('indicadores')?.value as Indicador,
    }).pipe(
      tap(() => this.mostrarExito('Indicadores actualizados')),
      catchError(err => { this.mostrarError('actualizar indicadores', err); return of(null); })
    ).subscribe();
  }

  // ══════════════════════════════════════════════════════════
  // GETTERS TEMPLATE
  // ══════════════════════════════════════════════════════════
  get estadoActual(): EstadoCiclo | null {
    if (!this.consultaActual?.ciclo?.length) return null;
    return this.consultaActual.ciclo[this.consultaActual.ciclo.length - 1].estado;
  }

  get ultimoCiclo(): CicloClinico | null {
    if (!this.consultaActual?.ciclo?.length) return null;
    return this.consultaActual.ciclo[this.consultaActual.ciclo.length - 1];
  }

  get egresoForm(): FormGroup {
    return this.form.get('egreso') as FormGroup;
  }

  // Egreso se incluye cuando condicion tiene valor
  get tieneEgreso(): boolean {
    return !!this.egresoForm.get('condicion')?.value;
  }

  volver(): void { this.router.navigate(['/consultas']); }

  private mostrarError(accion: string, error: any): void {
    console.error(`❌ Error al ${accion}:`, error);
    alert(`Error al ${accion}. ${error?.error?.detail || error?.message || 'Consulte la consola'}`);
  }
  private mostrarExito(m: string): void { console.log(`✅ ${m}`); }
}
