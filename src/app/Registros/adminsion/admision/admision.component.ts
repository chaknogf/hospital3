import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { ApiService } from '../../../service/api.service';
import { ConsultaService } from '../../consultas/consultas.service';
import { ConsultaUtilService } from '../../../service/consulta-util.service';

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

  // ── SVG Icons ──────────────────────────────────────────────
  addIcon!: SafeHtml;
  removeIcon!: SafeHtml;
  saveIcon!: SafeHtml;
  cancelIcon!: SafeHtml;
  findIcon!: SafeHtml;
  womanIcon!: SafeHtml;
  manIcon!: SafeHtml;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private api: ConsultaService,
    private apis: ApiService,
    private apip: PacienteService,
    private consultaUtil: ConsultaUtilService,
    private sanitizer: DomSanitizer
  ) {
    this.inicializarFormulario();
    this.inicializarSVG();
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
      // Solo lectura (visualización)
      id: [{ value: null, disabled: true }],
      expediente: [{ value: '', disabled: true }],
      documento: [{ value: '', disabled: true }],
      fecha_consulta: [{ value: '', disabled: true }],
      hora_consulta: [{ value: '', disabled: true }],
      orden: [{ value: null, disabled: true }],

      // Campos enviables al backend
      paciente_id: [0],
      tipo_consulta: [0],
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

      // Solo para modo edición — agrega un nuevo ciclo
      nuevo_estado: [''],
      nuevo_servicio: [''],
      nuevo_comentario: ['']
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
  // FLAGS Y CARGA
  // ══════════════════════════════════════════════════════════
  private inicializarFlagsYCarga(params: any): void {
    const origen = params.get('origen');
    const id = Number(params.get('id'));
    const pacienteId = Number(params.get('pacienteId'));

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
    } else if (pacienteId && id === 0) {
      this.cargarPaciente(pacienteId);
      this.enEdicion = false;
    }
  }

  // ══════════════════════════════════════════════════════════
  // CARGA DE DATOS
  // ══════════════════════════════════════════════════════════
  cargarPaciente(idP: number): void {
    this.apip.getPaciente(idP)
      .pipe(catchError(err => { this.mostrarError('cargar paciente', err); return of(null); }))
      .subscribe(data => {
        if (data) {
          this.paciente = data;
          this.form.patchValue({
            paciente_id: idP,
            expediente: data.expediente || 'Se generará automáticamente'
          });
        }
      });
  }

  cargarConsulta(id: number): void {
    this.api.getConsultaId(id)
      .pipe(catchError(err => { this.mostrarError('cargar consulta', err); return of(null); }))
      .subscribe(data => {
        if (data) {
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
            indicadores: data.indicadores
          });

          if (data.paciente_id) this.cargarPaciente(data.paciente_id);
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
    if (!this.consultaId) {
      this.mostrarError('actualizar', new Error('ID de consulta no encontrado'));
      return;
    }

    const v = this.form.getRawValue();

    // Construir payload — solo incluye lo que cambió
    const payload: ConsultaUpdate = {
      especialidad: v.especialidad || undefined,
      servicio: v.servicio || undefined,
      indicadores: v.indicadores as Indicador,
    };

    // Si se seleccionó un nuevo estado, agrega el ciclo en el mismo PATCH
    if (v.nuevo_estado) {
      const nuevoCiclo: CicloClinico = {
        estado: v.nuevo_estado as EstadoCiclo,
        especialidad: v.especialidad || undefined,
        servicio: v.nuevo_servicio || v.servicio || undefined,
        comentario: v.nuevo_comentario || undefined,
      };
      payload.ciclo = nuevoCiclo;
    }

    this.api.updateConsulta(this.consultaId, payload)
      .pipe(
        tap(r => {
          console.log('✅ Consulta actualizada:', r);
          this.mostrarExito('Consulta actualizada exitosamente');
        }),
        catchError(err => { this.mostrarError('actualizar consulta', err); return of(null); })
      )
      .subscribe(r => {
        if (r) {
          // Limpiar campos de nuevo ciclo y recargar
          this.form.patchValue({ nuevo_estado: '', nuevo_servicio: '', nuevo_comentario: '' });
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
  private valoresEmergencia(): void {
    this.especialidades = especialidades.filter(e => e.ref === 'all');
    this.servicios = servicios.filter(s => s.ref === 'emergencia');
    this.form.patchValue({ tipo_consulta: 3, servicio: 'REME' });
  }

  private valoresIngreso(): void {
    this.especialidades = especialidades.filter(e => e.ref === 'all');
    this.servicios = servicios.filter(s => s.ref === 'ingreso');
    this.form.patchValue({ tipo_consulta: 2, servicio: 'HOSPITALIZACION' });
  }

  private valoresCoex(): void {
    this.especialidades = especialidades.filter(e => e.ref !== 'sop');
    this.servicios = servicios.filter(s => s.ref === 'coex');
    this.form.patchValue({ tipo_consulta: 1, servicio: 'COEX' });
  }

  // ══════════════════════════════════════════════════════════
  // NAVEGACIÓN
  // ══════════════════════════════════════════════════════════
  volver(): void {
    if (this.esEmergencia) this.router.navigate(['/emergencias']);
    else if (this.esCoesx) this.router.navigate(['/coex']);
    else if (this.esIngreso) this.router.navigate(['/ingresos']);
    else this.router.navigate(['/pacientes']);
  }

  // ══════════════════════════════════════════════════════════
  // HELPERS TEMPLATE
  // ══════════════════════════════════════════════════════════
  get estadoActual(): EstadoCiclo | null {
    if (!this.consultaActual?.ciclo?.length) return null;
    return this.consultaActual.ciclo[this.consultaActual.ciclo.length - 1].estado;
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
