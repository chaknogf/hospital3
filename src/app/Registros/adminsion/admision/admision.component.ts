import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { ApiService } from '../../../service/api.service';
import { ConsultaService } from '../../consultas/consultas.service';
import { ConsultaUtilService } from '../../../service/consulta-util.service';
import { Location } from '@angular/common';
import { Dict, ciclos, tipoConsulta, especialidades, servicios } from '../../../enum/diccionarios';
import { Paciente } from '../../../interface/interfaces';
import {
  ConsultaOut,
  ConsultaUpdate,
  RegistroConsultaCreate,
  CicloClinico,
  EstadoCiclo,
  Indicador
} from './../../../interface/consultas';

import { EdadPipe } from '../../../pipes/edad.pipe';
import { DatosExtraPipe } from '../../../pipes/datos-extra.pipe';
import { CuiPipe } from '../../../pipes/cui.pipe';
import { addIcon, removeIcon, saveIcon, cancelIcon, findIcon, manIcon, womanIcon } from '../../../shared/icons/svg-icon';
import { PacienteService } from '../../patient/paciente.service';
import { IconService } from '../../../service/icon.service';

@Component({
  selector: 'app-admision',
  templateUrl: './admision.component.html',
  styleUrls: ['./admision.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    EdadPipe,
    DatosExtraPipe,
    CuiPipe
  ]
})
export class AdmisionComponent implements OnInit {

  // ── Formulario ─────────────────────────────────────────────
  form: FormGroup = new FormGroup({});

  // ======= INYECCIONES =======
  private api = inject(ConsultaService);
  private apis = inject(ApiService);
  //private apip = inject(PacienteService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private iconService = inject(IconService);
  private location = inject(Location);
  private fb = inject(FormBuilder);
  private consultaUtil = inject(ConsultaUtilService);


  // ── Datos ──────────────────────────────────────────────────
  paciente: Paciente = {} as Paciente;
  consultaActual?: ConsultaOut;
  private consultaId?: number;
  historialCiclos: CicloClinico[] = [];

  // ── Configuración ──────────────────────────────────────────
  usuarioActual = '';
  enEdicion = false;
  public esEmergencia = false;
  public esCoesx = false;
  public esIngreso = false;
  public esConsulta = false;

  // ── Listas ─────────────────────────────────────────────────
  tipoConsulta: Dict[] = tipoConsulta;
  ciclos: Dict[] = ciclos;
  especialidades: Dict[] = [];
  servicios: Dict[] = [];
  especialidadesFiltradas: Dict[] = [];

  // ── SVG Icons ──────────────────────────────────────────────
  addIcon!: SafeHtml;
  removeIcon!: SafeHtml;
  saveIcon!: SafeHtml;
  cancelIcon!: SafeHtml;
  findIcon!: SafeHtml;
  womanIcon!: SafeHtml;
  manIcon!: SafeHtml;

  constructor(



  ) {
    this.inicializarFormulario();

  }

  // ══════════════════════════════════════════════════════════
  // INICIALIZACIÓN
  // ══════════════════════════════════════════════════════════
  ngOnInit(): void {
    this.usuarioActual = this.apis.getUsuarioActual().username;
    this.inicializarFlagsYCarga(this.route.snapshot.paramMap);
  }

  private inicializarFormulario(): void {
    this.form = this.fb.group({
      id: [{ value: null, disabled: true }],
      expediente: [{ value: '', disabled: true }],
      documento: [{ value: '', disabled: true }],
      fecha_consulta: [{ value: '', disabled: false }],
      hora_consulta: [{ value: '', disabled: false }],
      orden: [{ value: null, disabled: true }],
      paciente_id: [0],
      tipo_consulta: [{ value: null, disabled: true }],
      especialidad: [''],
      servicio: [''],
      indicadores: this.fb.group({
        estudiante_publico: [false],
        empleado_publico: [false],
        accidente_laboral: [false],
        discapacidad: [false],
        accidente_transito: [false],
        arma_fuego: [false],
        arma_blanca: [false],
        ambulancia: [false],
        embarazo: [false]
      }),
      nuevo_estado: ['actualizado'],
      nuevo_servicio: [''],
      nuevo_comentario: [''],

      // ── Egreso ──────────────────────────────────────────────
      egreso_condicion: [''],
      egreso_referencia: [''],
      lactancia_materna: [''],
      egreso_medico: [''],
      egreso_diagnostico: [''],   // descripción libre del dx
      egreso_comentario: [''],
    });

    // Listener: filtrar especialidades según tipo de consulta
    this.form.get('tipo_consulta')?.valueChanges.subscribe(tipo => {
      this.filtrarEspecialidadesPorTipo(Number(tipo));
    });
  }

  private filtrarEspecialidadesPorTipo(tipo: number): void {
    switch (tipo) {
      case 1: // COEX
        this.especialidadesFiltradas = especialidades.filter(e => e.ref !== 'sop');
        this.servicios = servicios.filter(s => s.ref === 'coex');
        break;
      case 2: // Hospitalización/Ingreso
        this.especialidadesFiltradas = especialidades.filter(e => e.ref === 'all');
        this.servicios = servicios.filter(s => s.ref === 'ingreso');
        break;
      case 3: // Emergencia
        this.especialidadesFiltradas = especialidades.filter(e => e.ref === 'all');
        this.servicios = servicios.filter(s => s.ref === 'emergencia');
        break;
      default:
        this.especialidadesFiltradas = especialidades;
        this.servicios = servicios;
    }
  }


  // ══════════════════════════════════════════════════════════
  // FLAGS Y CARGA
  // ══════════════════════════════════════════════════════════
  private inicializarFlagsYCarga(params: any): void {
    const origen = params.get('origen');
    const id = Number(params.get('id'));


    this.esEmergencia = origen === 'emergencia';
    this.esCoesx = origen === 'coex';
    this.esIngreso = origen === 'ingreso';
    this.esConsulta = origen === 'consulta';
    this.consultaId = id === 0 ? undefined : id;

    if (this.esEmergencia) this.valoresEmergencia();
    else if (this.esCoesx) this.valoresCoex();
    else if (this.esIngreso) this.valoresIngreso();

    if (this.consultaId !== undefined) {
      this.enEdicion = true;
      this.cargarConsulta(this.consultaId);
    } else {
      this.enEdicion = false;
    }
  }

  // ══════════════════════════════════════════════════════════
  // CARGA DE DATOS
  // ══════════════════════════════════════════════════════════


  cargarConsulta(id: number): void {
    this.api.getConsultaId(id)
      .pipe(catchError(err => { this.mostrarError('cargar consulta', err); return of(null); }))
      .subscribe(data => {
        if (data) {
          this.consultaActual = data;

          // ← Extraer paciente directo de la respuesta, sin llamada extra
          if (data.paciente) {
            this.paciente = data.paciente as any;
          }

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
            nuevo_servicio: data.servicio
          });

          // Filtrar especialidades según tipo cargado
          this.filtrarEspecialidadesPorTipo(Number(data.tipo_consulta));

          this.historialCiclos = data.ciclo || [];
        }
      });
  }

  // ══════════════════════════════════════════════════════════
  // GUARDAR — despacha según modo
  // ══════════════════════════════════════════════════════════
  guardar(): void {
    if (this.enEdicion) this.actualizarConsulta();
    else this.registrarNuevaAdmision();
    this.router.navigate(['/consultas']);
  }

  // ── Registro nuevo ─────────────────────────────────────────
  private registrarNuevaAdmision(): void {
    const v = this.form.getRawValue();

    const datos: RegistroConsultaCreate = {
      paciente_id: v.paciente_id,
      tipo_consulta: v.tipo_consulta,
      especialidad: v.especialidad,
      servicio: v.servicio,
      indicadores: v.indicadores,
      ciclo: []
    };

    this.api.registrarAdmision(datos)
      .pipe(
        tap(r => {
          console.log('✅ Admisión registrada:', r);
          this.mostrarExito('Admisión registrada exitosamente');
        }),
        catchError(err => { this.mostrarError('registrar admisión', err); return of(null); })
      )
      .subscribe(r => { if (r) this.volver(); });
  }

  // ── Actualización completa ──────────────────────────────────
  /**
   * Actualiza en una sola llamada PATCH:
   *   - especialidad y servicio (si cambiaron)
   *   - indicadores
   *   - agrega un nuevo registro al ciclo (si se seleccionó estado)
   */
  private actualizarConsulta(): void {
    if (!this.consultaId) return;
    const v = this.form.getRawValue();

    const payload: ConsultaUpdate = {
      especialidad: v.especialidad || undefined,
      servicio: v.servicio || undefined,
      indicadores: v.indicadores as Indicador,
    };

    // Egreso — solo si viene condición
    if (v.egreso_condicion) {
      payload.egreso = {
        condicion: v.egreso_condicion,
        referencia: v.egreso_referencia || undefined,
        medico: v.egreso_medico || undefined,
        diagnosticos: v.egreso_diagnostico
          ? [{ codigo: '', descripcion: v.egreso_diagnostico }]
          : [],
      };
    }

    if (v.nuevo_estado) {
      payload.ciclo = {
        estado: v.nuevo_estado as EstadoCiclo,
        especialidad: v.especialidad || undefined,
        servicio: v.nuevo_servicio || v.servicio || undefined,
        comentario: v.nuevo_comentario || undefined,
      };
    }

    this.api.updateConsulta(this.consultaId, payload)
      .pipe(
        tap(r => this.mostrarExito('Consulta actualizada exitosamente')),
        catchError(err => { this.mostrarError('actualizar consulta', err); return of(null); })
      )
      .subscribe(r => {
        if (r) {
          this.form.patchValue({
            nuevo_estado: '', nuevo_servicio: '', nuevo_comentario: '',
            egreso_condicion: '', egreso_referencia: '', egreso_medico: '',
            egreso_diagnostico: '', egreso_comentario: ''
          });
          this.cargarConsulta(this.consultaId!);
        }
      });
  }

  // ── Solo indicadores (acción rápida desde el template) ──────
  actualizarIndicadores(): void {
    if (!this.consultaId) return;

    const indicadores = this.form.get('indicadores')?.value as Indicador;

    this.api.updateConsulta(this.consultaId, { indicadores })
      .pipe(
        tap(() => this.mostrarExito('Indicadores actualizados')),
        catchError(err => { this.mostrarError('actualizar indicadores', err); return of(null); })
      )
      .subscribe();
  }

  editarPaciente(id: number): void { this.router.navigate(['/pacienteEdit', id]); }
  // ══════════════════════════════════════════════════════════
  // VALORES POR TIPO
  // ══════════════════════════════════════════════════════════
  // Reemplazar valoresEmergencia, valoresCoex, valoresIngreso
  private valoresEmergencia(): void {
    this.form.patchValue({ tipo_consulta: 3, servicio: 'REME' });
    this.filtrarEspecialidadesPorTipo(3);
  }

  private valoresIngreso(): void {
    this.form.patchValue({ tipo_consulta: 2, servicio: 'HOSPITALIZACION' });
    this.filtrarEspecialidadesPorTipo(2);
  }

  private valoresCoex(): void {
    this.form.patchValue({ tipo_consulta: 1, servicio: 'COEX' });
    this.filtrarEspecialidadesPorTipo(1);
  }
  // ══════════════════════════════════════════════════════════
  // NAVEGACIÓN
  // ══════════════════════════════════════════════════════════
  volver(): void { this.location.back(); }

  // ══════════════════════════════════════════════════════════
  // HELPERS TEMPLATE
  // ══════════════════════════════════════════════════════════
  get estadoActual(): string | null {
    return this.consultaActual?.ultimo_estado ?? null;
  }

  get ultimoCiclo(): CicloClinico | null {
    if (!this.consultaActual?.ciclo?.length) return null;
    return this.consultaActual.ciclo[this.consultaActual.ciclo.length - 1];
  }

  // ══════════════════════════════════════════════════════════
  // HELPERS PRIVADOS
  // ══════════════════════════════════════════════════════════
  private mostrarError(accion: string, error: any): void {
    console.error(`❌ Error al ${accion}:`, error);
    alert(`Error al ${accion}. ${error?.error?.detail || error?.message || 'Consulte la consola'}`);
  }

  private mostrarExito(mensaje: string): void {
    console.log(`✅ ${mensaje}`);
  }
}
