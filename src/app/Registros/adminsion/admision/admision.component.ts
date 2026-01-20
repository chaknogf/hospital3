// formulario-consulta.component.ts
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
import { ConsultaOut, RegistroConsultaCreate, CicloClinico, EstadoCiclo } from './../../../interface/consultas';

import { EdadPipe } from '../../../pipes/edad.pipe';
import { DatosExtraPipe } from '../../../pipes/datos-extra.pipe';
import { CuiPipe } from '../../../pipes/cui.pipe';
import { addIcon, removeIcon, saveIcon, cancelIcon, findIcon, manIcon, womanIcon } from '../../../shared/icons/svg-icon';

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

  // 🔹 Formulario
  form: FormGroup = new FormGroup({});

  // 🔹 Datos de paciente y consulta
  paciente: Paciente = {} as Paciente;
  consultaActual?: ConsultaOut;
  private consultaId?: number;
  historialCiclos: CicloClinico[] = [];

  // 🔹 Configuración
  usuarioActual = '';
  enEdicion = false;
  public esEmergencia = false;
  public esCoesx = false;
  public esIngreso = false;

  // 🔹 Listas y enums
  tipoConsulta: Dict[] = tipoConsulta;
  ciclos: Dict[] = ciclos;
  especialidades: Dict[] = [];
  servicios: Dict[] = [];

  // 🔹 SVG Icons
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
    private api: ApiService,
    private consultaUtil: ConsultaUtilService,
    private sanitizer: DomSanitizer
  ) {
    this.inicializarFormulario();
    this.inicializarSVG();
  }

  // ==========================
  // 🔹 Inicialización
  // ==========================
  ngOnInit(): void {
    this.usuarioActual = this.api.getUsuarioActual().username;

    this.inicializarFlagsYCarga(this.route.snapshot.paramMap);
  }

  // ==========================
  // 🔹 Inicialización del Formulario y SVG
  // ==========================
  private inicializarFormulario() {
    this.form = this.fb.group({
      // Campos básicos (para visualización, no se envían en POST /registro)
      id: [null],
      expediente: [{ value: '', disabled: true }],
      documento: [{ value: '', disabled: true }],
      fecha_consulta: [{ value: '', disabled: true }],
      hora_consulta: [{ value: '', disabled: true }],
      orden: [{ value: null, disabled: true }],

      // Campos que SÍ se envían al backend
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

      // Para actualización de ciclo
      nuevo_estado: [''],
      nuevo_servicio: ['']
    });
  }

  private inicializarSVG() {
    this.addIcon = this.sanitizer.bypassSecurityTrustHtml(addIcon);
    this.removeIcon = this.sanitizer.bypassSecurityTrustHtml(removeIcon);
    this.saveIcon = this.sanitizer.bypassSecurityTrustHtml(saveIcon);
    this.cancelIcon = this.sanitizer.bypassSecurityTrustHtml(cancelIcon);
    this.findIcon = this.sanitizer.bypassSecurityTrustHtml(findIcon);
    this.womanIcon = this.sanitizer.bypassSecurityTrustHtml(womanIcon);
    this.manIcon = this.sanitizer.bypassSecurityTrustHtml(manIcon);
  }

  // ==========================
  // 🔹 Carga de datos y flags
  // ==========================
  private inicializarFlagsYCarga(params: any) {
    const origen = params.get('origen');
    const id = Number(params.get('id'));
    const pacienteId = Number(params.get('pacienteId'));

    // Flags de origen
    this.esEmergencia = origen === 'emergencia';
    this.esCoesx = origen === 'coex';
    this.esIngreso = origen === 'ingreso';
    this.consultaId = id === 0 ? undefined : id;

    // Inicializar valores según tipo
    if (this.esEmergencia) this.valoresEmergencia();
    else if (this.esCoesx) this.valoresCoex();
    else if (this.esIngreso) this.valoresIngreso();

    // Modo edición
    if (this.consultaId !== undefined) {
      this.enEdicion = true;
      this.cargarConsulta(this.consultaId);
    } else if (pacienteId !== undefined && id === 0) {
      this.cargarPaciente(pacienteId);
      this.enEdicion = false;
    }
  }

  // ==========================
  // 🔹 Funciones de carga
  // ==========================
  cargarPaciente(idP: number): void {
    this.api.getPaciente(idP)
      .pipe(
        catchError(err => {
          this.mostrarError('cargar paciente', err);
          return of(null);
        })
      )
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
      .pipe(
        catchError(err => {
          this.mostrarError('cargar consulta', err);
          return of(null);
        })
      )
      .subscribe(data => {
        if (data) {
          this.consultaActual = data;

          // Cargar datos básicos
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

          // Cargar paciente
          if (data.paciente_id) {
            this.cargarPaciente(data.paciente_id);
          }

          // Cargar historial de ciclos
          this.historialCiclos = data.ciclo || [];
        }
      });
  }

  // ==========================
  // 🔹 Crear / Actualizar
  // ==========================
  guardar(): void {
    if (this.enEdicion) {
      this.actualizarCiclo();
    } else {
      this.registrarNuevaAdmision();
    }
  }

  /**
   * Registra una nueva admisión usando el endpoint simplificado
   * POST /consultas/registro
   */
  private registrarNuevaAdmision(): void {
    const formValue = this.form.getRawValue();

    // Construir payload para registro
    const datos: RegistroConsultaCreate = {
      paciente_id: formValue.paciente_id,
      tipo_consulta: formValue.tipo_consulta,
      especialidad: formValue.especialidad,
      servicio: formValue.servicio,
      indicadores: formValue.indicadores,
      ciclo: []
    };

    this.api.registrarAdmision(datos)
      .pipe(
        tap(response => {
          console.log('✅ Admisión registrada:', response);
          console.log('📋 Expediente generado:', response.expediente);
          console.log('📝 Documento:', response.documento);
          console.log('🔢 Orden en cola:', response.orden);
          this.mostrarExito('Admisión registrada exitosamente');
        }),
        catchError(err => {
          this.mostrarError('registrar admisión', err);
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          this.volver();
        }
      });
  }

  /**
   * Actualiza una consulta existente agregando un nuevo ciclo
   * PATCH /consultas/{id}
   */
  private actualizarCiclo(): void {
    if (!this.consultaId) {
      this.mostrarError('actualizar', new Error('ID de consulta no encontrado'));
      return;
    }

    const formValue = this.form.getRawValue();
    const nuevoEstado = formValue.nuevo_estado as EstadoCiclo;
    const nuevoServicio = formValue.nuevo_servicio;

    // Validar que se haya seleccionado un estado
    if (!nuevoEstado) {
      alert('Por favor seleccione un estado para actualizar');
      return;
    }

    // Usar el método helper del API service
    this.api.agregarCiclo(
      this.consultaId,
      nuevoEstado,
      {
        servicio: nuevoServicio || formValue.servicio,
        especialidad: formValue.especialidad
      }
    )
      .pipe(
        tap(response => {
          console.log('✅ Ciclo actualizado:', response);
          this.mostrarExito('Ciclo actualizado exitosamente');
        }),
        catchError(err => {
          this.mostrarError('actualizar ciclo', err);
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          // Recargar la consulta para mostrar el historial actualizado
          this.cargarConsulta(this.consultaId!);
        }
      });
  }

  /**
   * Actualiza solo los indicadores
   */
  actualizarIndicadores(): void {
    if (!this.consultaId) return;

    const indicadores = this.form.get('indicadores')?.value;

    this.api.actualizarIndicadores(this.consultaId, indicadores)
      .pipe(
        tap(() => this.mostrarExito('Indicadores actualizados')),
        catchError(err => {
          this.mostrarError('actualizar indicadores', err);
          return of(null);
        })
      )
      .subscribe();
  }

  volver(): void {
    if (this.esEmergencia) this.router.navigate(['/emergencias']);
    else if (this.esCoesx) this.router.navigate(['/coex']);
    else if (this.esIngreso) this.router.navigate(['/ingresos']);
    else this.router.navigate(['/pacientes']);
  }

  // ==========================
  // 🔹 Valores por tipo de consulta
  // ==========================
  private valoresEmergencia() {
    this.especialidades = especialidades.filter(e => e.ref === 'all');
    this.servicios = servicios.filter(s => s.ref === 'emergencia');
    this.form.patchValue({
      tipo_consulta: 3,
      servicio: 'REME'
    });
  }

  private valoresIngreso() {
    this.especialidades = especialidades.filter(e => e.ref === 'all');
    this.servicios = servicios.filter(s => s.ref === 'ingreso');
    this.form.patchValue({
      tipo_consulta: 2,
      servicio: 'HOSPITALIZACION'
    });
  }

  private valoresCoex() {
    this.especialidades = especialidades.filter(e => e.ref !== 'sop');
    this.servicios = servicios.filter(s => s.ref === 'coex');
    this.form.patchValue({
      tipo_consulta: 1,
      servicio: 'COEX'
    });
  }

  // ==========================
  // 🔹 Helpers de UI
  // ==========================
  private mostrarError(accion: string, error: any): void {
    console.error(`❌ Error al ${accion}:`, error);
    alert(`Error al ${accion}. ${error?.error?.detail || error?.message || 'Consulte la consola'}`);
  }

  private mostrarExito(mensaje: string): void {
    console.log(`✅ ${mensaje}`);
    // Aquí podrías usar un servicio de notificaciones más elegante
    // this.toastr.success(mensaje);
  }

  // ==========================
  // 🔹 Helpers para el template
  // ==========================
  get estadoActual(): EstadoCiclo | null {
    if (!this.consultaActual?.ciclo || this.consultaActual.ciclo.length === 0) {
      return null;
    }
    return this.consultaActual.ciclo[this.consultaActual.ciclo.length - 1].estado;
  }

  get ultimoCiclo(): CicloClinico | null {
    if (!this.consultaActual?.ciclo || this.consultaActual.ciclo.length === 0) {
      return null;
    }
    return this.consultaActual.ciclo[this.consultaActual.ciclo.length - 1];
  }
}
