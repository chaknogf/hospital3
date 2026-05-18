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
import { Location } from '@angular/common';
import { Dict, ciclos, tipoConsulta, especialidades, servicios } from '../../../enum/diccionarios';
import { Paciente } from '../../../interface/interfaces';
import {
  ConsultaOut, ConsultaUpdate, RegistroConsultaCreate,
  CicloClinico, EstadoCiclo, Indicador
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
  imports: [CommonModule, ReactiveFormsModule, FormsModule, EdadPipe, DatosExtraPipe, CuiPipe]
})
export class AdmisionComponent implements OnInit {

  // ── Formulario ─────────────────────────────────────────────
  form: FormGroup = new FormGroup({});

  // ── Inyecciones ────────────────────────────────────────────
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private api: ConsultaService,
    private apis: ApiService,
    private apip: PacienteService,
    private sanitizer: DomSanitizer
  ) {
    this.inicializarFormulario();
    this.inicializarSVG();
  }

  // ── Datos ──────────────────────────────────────────────────
  paciente: Paciente = {} as Paciente;
  consultaActual?: ConsultaOut;
  private consultaId?: number;
  historialCiclos: CicloClinico[] = [];

  // ── Listas ─────────────────────────────────────────────────
  tipoConsulta: Dict[] = tipoConsulta;
  ciclos: Dict[] = ciclos;
  especialidadesFiltradas: Dict[] = [];
  servicios: Dict[] = [];

  // ── Configuración ──────────────────────────────────────────
  usuarioActual = '';
  enEdicion = false;
  esEmergencia = false;
  esCoesx = false;
  esIngreso = false;
  esConsulta = false;

  // ── SVG Icons ──────────────────────────────────────────────
  addIcon!: SafeHtml;
  removeIcon!: SafeHtml;
  saveIcon!: SafeHtml;
  cancelIcon!: SafeHtml;
  findIcon!: SafeHtml;
  womanIcon!: SafeHtml;
  manIcon!: SafeHtml;

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
      nuevo_estado: [''],
      nuevo_servicio: [''],
      nuevo_comentario: [''],
      // ── Egreso ──────────────────────────────────────────────
      condicion: [''],
      referencia: [''],
      lactancia_materna: [''],
      medico: [''],
      diagnosticos: [''],
      registro: ['']

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
      this.enEdicion = false;
      this.cargarPaciente(pacienteId);
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
          if (data.paciente) this.paciente = data.paciente as any;

          // Datos principales
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

          // Cargar egreso
          if (data.egreso) {
            // Convertir de ISO string (2024-01-15T14:30:00) a datetime-local (2024-01-15T14:30)
            let registroValue = '';
            if (data.egreso.registro) {
              registroValue = data.egreso.registro.substring(0, 16); // Toma YYYY-MM-DDThh:mm
            }

            this.form.patchValue({
              condicion: data.egreso.condicion || '',
              referencia: data.egreso.referencia || '',
              lactancia_materna: data.egreso.lactancia_materna || false,
              medico: data.egreso.medico || '',
              diagnosticos: data.egreso.diagnosticos || '',
              registro: registroValue  // ← Usar 'registro'
            });
          }

          this.filtrarPorTipo(Number(data.tipo_consulta));
          this.historialCiclos = data.ciclo || [];
        }
      });
  }
  // ══════════════════════════════════════════════════════════
  // GUARDAR
  // ══════════════════════════════════════════════════════════
  guardar(): void {
    const tipo = Number(this.form.getRawValue().tipo_consulta);

    if (this.enEdicion) {
      this.actualizarConsulta().subscribe(r => {
        if (r) this.cargarConsulta(this.consultaId!);
        if (r) this.navegarSegunTipo(tipo);
      });
    } else {
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
          tap(() => this.mostrarExito('Admisión registrada exitosamente')),
          catchError(err => { this.mostrarError('registrar admisión', err); return of(null); })
        )
        .subscribe(r => {
          if (r) this.navegarSegunTipo(tipo);
        });
    }
  }

  // ── Actualización ──────────────────────────────────────────


  private actualizarConsulta() {
    if (!this.consultaId) return of(null);
    const v = this.form.getRawValue();
    const estadoActual = this.consultaActual?.ultimo_estado as EstadoCiclo;

    // Estados terminales que no deben cambiar su estado principal
    const estadosTerminales: EstadoCiclo[] = ['archivo', 'egreso', 'referido'];
    const esEstadoTerminal = estadosTerminales.includes(estadoActual);

    // Estados que permiten transición normal
    const estadosActivos: EstadoCiclo[] = ['iniciado', 'pendiente', 'admision', 'signos',
      'consulta', 'estudios', 'tratamiento', 'observacion', 'evolucion',
      'procedimiento', 'recuperacion', 'triage'];

    const payload: ConsultaUpdate = {
      especialidad: v.especialidad || undefined,
      servicio: v.servicio || undefined,
      indicadores: v.indicadores as Indicador,
    };

    // 1. Manejo de Egreso
    const tieneDatosEgreso = v.condicion || v.referencia || v.medico ||
      v.diagnosticos || v.registro;

    if (tieneDatosEgreso) {
      let registroTimestamp = undefined;
      if (v.registro) {
        registroTimestamp = `${v.registro}:00`;
      }

      payload.egreso = {
        condicion: v.condicion || '',
        referencia: v.referencia || undefined,
        medico: v.medico || undefined,
        lactancia_materna: v.lactancia_materna || false,
        diagnosticos: v.diagnosticos || '',
        registro: registroTimestamp
      };

      console.log('📤 Actualizando egreso:', payload.egreso);
    }

    // 2. Manejo de Ciclo/Estado
    if (v.nuevo_estado) {
      // Validar transición de estado
      const nuevoEstado = v.nuevo_estado as EstadoCiclo;
      const transicionValida = this.validarTransicionEstado(estadoActual, nuevoEstado, estadosTerminales);

      if (!transicionValida) {
        console.warn(`⚠️ Transición inválida: ${estadoActual} -> ${nuevoEstado}`);
        this.mostrarError('transición de estado',
          new Error(`No se puede cambiar de ${estadoActual} a ${nuevoEstado}`));
        return of(null);
      }

      // Caso 1: Estado terminal - Solo permitir 'actualizado'
      if (esEstadoTerminal) {
        if (nuevoEstado !== 'actualizado' && nuevoEstado !== estadoActual) {
          console.warn(`⚠️ Intento de cambiar estado terminal '${estadoActual}' a '${nuevoEstado}'. Se usará 'actualizado'`);
        }

        payload.ciclo = {
          estado: 'actualizado',
          especialidad: v.especialidad || undefined,
          servicio: v.nuevo_servicio || v.servicio || undefined,
          comentario: this.construirComentarioActualizacion(estadoActual, v.nuevo_comentario, tieneDatosEgreso)
        };
      }
      // Caso 2: Estado activo - Permitir cambio normal
      else if (estadosActivos.includes(estadoActual)) {
        payload.ciclo = {
          estado: nuevoEstado,
          especialidad: v.especialidad || undefined,
          servicio: v.nuevo_servicio || v.servicio || undefined,
          comentario: v.nuevo_comentario || `Transición de ${estadoActual} a ${nuevoEstado}`
        };
      }
      // Caso 3: Estado no reconocido
      else {
        console.warn(`⚠️ Estado no reconocido: ${estadoActual}`);
        payload.ciclo = {
          estado: nuevoEstado,
          especialidad: v.especialidad || undefined,
          servicio: v.nuevo_servicio || v.servicio || undefined,
          comentario: v.nuevo_comentario || `Cambio desde estado desconocido: ${estadoActual}`
        };
      }
    }
    // 3. Si no hay cambio de estado pero hay actualización de egreso en estado terminal
    else if (tieneDatosEgreso && esEstadoTerminal) {
      payload.ciclo = {
        estado: 'actualizado',
        especialidad: v.especialidad || undefined,
        servicio: v.servicio || undefined,
        comentario: `Actualización de datos de egreso en consulta ${estadoActual}`
      };
      console.log('📤 Registrando actualización de egreso post-terminal:', payload.ciclo);
    }

    console.log('📤 Payload final:', {
      tieneEgreso: !!payload.egreso,
      tieneCiclo: !!payload.ciclo,
      estadoActual,
      esEstadoTerminal
    });

    return this.api.updateConsulta(this.consultaId, payload).pipe(
      tap((response) => {
        this.mostrarExito('Consulta actualizada exitosamente');
        console.log('✅ Respuesta del servidor:', response);

        // Recargar la consulta para ver los datos actualizados
        this.cargarConsulta(this.consultaId!);

        // Limpiar campos temporales
        this.form.patchValue({
          nuevo_estado: '',
          nuevo_servicio: '',
          nuevo_comentario: ''
        });
      }),
      catchError(err => {
        this.mostrarError('actualizar consulta', err);
        return of(null);
      })
    );
  }

  // Método auxiliar para validar transiciones
  private validarTransicionEstado(
    estadoActual: EstadoCiclo | undefined,
    nuevoEstado: EstadoCiclo,
    estadosTerminales: EstadoCiclo[]
  ): boolean {
    if (!estadoActual) return true;

    // No permitir cambiar desde estado terminal a otro que no sea 'actualizado'
    if (estadosTerminales.includes(estadoActual)) {
      return nuevoEstado === 'actualizado' || nuevoEstado === estadoActual;
    }

    // No permitir volver a 'iniciado' o 'pendiente' desde estados avanzados
    if ((nuevoEstado === 'iniciado' || nuevoEstado === 'pendiente') &&
      !['iniciado', 'pendiente', 'admision'].includes(estadoActual)) {
      return false;
    }

    return true;
  }

  // Método auxiliar para construir comentarios de actualización
  private construirComentarioActualizacion(
    estadoTerminal: EstadoCiclo,
    comentarioUsuario?: string,
    tieneActualizacionEgreso?: boolean
  ): string {
    const partes: string[] = [`[Actualización post-${estadoTerminal}]`];

    if (comentarioUsuario && comentarioUsuario.trim()) {
      partes.push(comentarioUsuario.trim());
    }

    if (tieneActualizacionEgreso) {
      partes.push('(Incluye actualización de datos de egreso)');
    }

    if (partes.length === 1) {
      partes.push('Sin comentario adicional');
    }

    return partes.join(' ');
  }

  // ── Indicadores rápido ─────────────────────────────────────
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
  private filtrarPorTipo(tipo: number): void {
    switch (tipo) {
      case 1:
        this.especialidadesFiltradas = especialidades.filter(e => e.ref !== 'sop');
        this.servicios = servicios.filter(s => s.ref === 'coex');
        break;
      case 2:
        this.especialidadesFiltradas = especialidades.filter(e => e.ref === 'all');
        this.servicios = servicios.filter(s => s.ref === 'ingreso');
        break;
      case 3:
        this.especialidadesFiltradas = especialidades.filter(e => e.ref === 'all');
        this.servicios = servicios.filter(s => s.ref === 'emergencia');
        break;
      default:
        this.especialidadesFiltradas = especialidades;
        this.servicios = servicios;
    }
  }



  private valoresEmergencia(): void {
    this.filtrarPorTipo(3);
    this.form.patchValue({ tipo_consulta: 3, servicio: 'REME' });
  }

  private valoresIngreso(): void {
    this.filtrarPorTipo(2);
    this.form.patchValue({ tipo_consulta: 2, servicio: 'HOSPITALIZACION' });
  }

  private valoresCoex(): void {
    this.filtrarPorTipo(1);
    this.form.patchValue({ tipo_consulta: 1, servicio: 'COEX' });
  }

  // ══════════════════════════════════════════════════════════
  // NAVEGACIÓN
  // ══════════════════════════════════════════════════════════
  private navegarSegunTipo(tipo: number): void {
    switch (tipo) {
      case 1: this.router.navigate(['/coex']); break;
      case 2: this.router.navigate(['/ingresos']); break;
      case 3: this.router.navigate(['/emergencias']); break;
      default: this.router.navigate(['/consultas']);
    }
  }

  volver(): void {
    if (this.esEmergencia) this.router.navigate(['/emergencias']);
    else if (this.esCoesx) this.router.navigate(['/coex']);
    else if (this.esIngreso) this.router.navigate(['/ingresos']);
    else this.router.navigate(['/pacientes']);
  }

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
