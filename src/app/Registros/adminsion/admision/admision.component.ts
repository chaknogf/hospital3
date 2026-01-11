// formulario-consulta.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { ApiService } from '../../../service/api.service';
import { ConsultaService } from '../../../service/consulta.service';
import { ConsultaUtilService } from '../../../service/consulta-util.service';

import { Dict, ciclos, tipoConsulta, especialidades, servicios } from '../../../enum/diccionarios';
import { Paciente } from '../../../interface/interfaces';
import { ConsultaUpdate } from './../../../interface/consultas';

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
  private consultaId?: number;
  historialCiclos: any[] = [];

  // 🔹 Configuración
  usuarioActual = '';
  enEdicion = false;
  public esEmergencia = false;
  public esCoesx = false;
  public esIngreso = false;

  // 🔹 Fechas y registro
  private registroactual: string = '';
  private fechaActual: string = '';
  private horaActual: string = '';

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
    // private apiConsulta: ConsultaService,
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
    this.usuarioActual = localStorage.getItem('username') || '';
    this.registroactual = new Date().toISOString();
    const ahora = new Date();
    this.fechaActual = ahora.toLocaleDateString('en-CA');
    this.horaActual = ahora.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', hour12: false });

    this.form.patchValue({
      fecha_consulta: this.fechaActual,
      hora_consulta: this.horaActual
    });

    this.inicializarFlagsYCarga(this.route.snapshot.paramMap);
  }

  // ==========================
  // 🔹 Inicialización del Formulario y SVG
  // ==========================
  private inicializarFormulario() {
    this.form = this.fb.group({
      id: [null],
      expediente: [''],
      paciente_id: [0],
      tipo_consulta: [0],
      especialidad: [''],
      servicio: [''],
      documento: [''],
      fecha_consulta: [''],
      hora_consulta: [''],
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
      ciclo: this.fb.group({}),

    });

    // Ciclos dinámicos
    // ['ciclo1', 'ciclo2', 'ciclo3'].forEach(key => {
    //   (this.form.get('ciclo') as FormGroup).addControl(key, this.crearCiclo());
    // });
    // 🔹 Si NO estamos editando, agregamos solo un ciclo inicial
    if (!this.enEdicion) {
      const ciclosForm = this.form.get('ciclo') as FormGroup;
      ciclosForm.addControl('ciclo1', this.crearCiclo());
    }
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

    // console.log('consulta: ', id, 'paciente: ', pacienteId, 'consultaId: ', this.consultaId);

    // Modo edición
    if (this.consultaId !== undefined) {
      this.enEdicion = true;
      this.cargarConsulta(this.consultaId);
    } else if (pacienteId !== undefined && id === 0) {
      this.cargarPaciente(pacienteId);
      this.enEdicion = false;
    }

    // console.log(this.enEdicion);
  }

  private inicializarQueryParams(q: any) {
    this.esCoesx ||= q['esCoex'];
    this.esEmergencia ||= q['esEmergencia'];
    this.esIngreso ||= q['esIngreso'];
  }

  // ==========================
  // 🔹 Funciones de carga
  // ==========================
  cargarPaciente(idP: number): void {
    this.api.getPaciente(idP)
      .pipe(
        catchError(err => {
          console.error('Error cargar paciente', err);
          return of(null);
        })
      )
      .subscribe(data => {
        if (data) {
          this.paciente = data;
          // console.log(idP, data, this.paciente);
          this.form.patchValue({
            paciente_id: idP,
            expediente: data.expediente,
            fecha_nacimiento: data.fecha_nacimiento
          });
        }
      });
  }

  cargarConsulta(id: number): void {
    this.api.getConsultaId(id)
      .pipe(
        catchError(err => {
          console.error('Error cargar consulta', err);
          return of(null);
        })
      )
      .subscribe(data => {
        if (data) {
          const consulta = Array.isArray(data) ? data[0] : data;
          this.form.patchValue(consulta);
          if (consulta.paciente_id) this.cargarPaciente(consulta.paciente_id);

          // 🔹 Reconstruir FormGroup ciclo con los ciclos existentes
          const ciclosForm = this.form.get('ciclo') as FormGroup;
          ciclosForm.reset(); // limpia cualquier ciclo temporal
          if (consulta.ciclo) {
            Object.entries(consulta.ciclo).forEach(([key, ciclo]: [string, any]) => {
              ciclosForm.addControl(key, this.fb.group({
                estado: [ciclo.estado],
                registro: [ciclo.registro],
                usuario: [ciclo.usuario],
                servicio: [ciclo.servicio || 'REME'],
              }));
            });
          }

          // 🔹 Historial de ciclos
          this.historialCiclos = this.cargarCiclos(consulta.ciclo);
        }
      });
  }

  private agregarNuevoCiclo(): void {
    const ciclosForm = this.form.get('ciclo') as FormGroup;
    const keys = Object.keys(ciclosForm.controls);

    // 🔹 Calcular el siguiente índice según los ciclos existentes
    const numeros = keys.map(k => Number(k.replace('ciclo', ''))).filter(n => !isNaN(n));
    const nextIndex = numeros.length > 0 ? Math.max(...numeros) + 1 : 1;

    const nuevoKey = `ciclo${nextIndex}`;
    ciclosForm.addControl(nuevoKey, this.crearCiclo());
  }

  cargarCiclos(ciclos: any): any[] {
    if (!ciclos) return [];

    return Object.entries(ciclos)
      .map(([key, ciclo]: [string, any]) => ({
        id: key,
        ...ciclo
      }))
      .sort((b, a) => a.registro.localeCompare(b.registro)); // Ordenar por fecha
  }
  // ==========================
  // 🔹 Crear / Actualizar
  // ==========================
  guardar(): void {
    // 🔹 Agregar un nuevo ciclo antes de guardar
    this.agregarNuevoCiclo();

    const consulta = this.form.getRawValue();
    consulta.ciclo = this.filtrarCiclos(consulta.ciclo);
    // console.log(consulta);
    if (this.enEdicion) this.actualizar(consulta);
    else this.crear(consulta);

    this.volver();
  }

  async crear(consulta: any) {
    try {

      this.api.crearConsulta(consulta).pipe(
        catchError(err => {
          this.mostrarError('crear consulta', err);
          return of(null);
        })
      ).subscribe(resp => {
        if (resp) {
          // console.log('Consulta creada', resp);
        }
      });
    } catch (error) {
      console.error('Error al crear consulta', error);
      throw error;
    }
  }

  async actualizar(consulta: ConsultaUpdate) {
    try {
      if (!consulta.id || consulta.id === 0) {
        throw new Error("❌ Falta el ID de la consulta para actualizar");
      }
      this.api.updateConsulta(this.consultaId as number, consulta).pipe(
        catchError(err => {
          this.mostrarError('actualizar consulta', err);
          return of(null);
        })
      ).subscribe(data => {
        if (data) {
          // console.log('Consulta actualizada', data);
        }
      });
      console.log('Consulta actualizada');
    } catch (error) {
      this.mostrarError('actualizar consulta', error);
    }
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

    });
  }

  private valoresIngreso() {
    this.especialidades = especialidades.filter(e => e.ref === 'all');
    this.servicios = servicios.filter(s => s.ref === 'ingreso');
    this.form.patchValue({
      tipo_consulta: 2,

    });
  }

  private valoresCoex() {
    this.especialidades = especialidades.filter(e => e.ref !== 'sop');
    this.servicios = servicios.filter(s => s.ref === 'coex');
    this.form.patchValue({
      tipo_consulta: 1,
      servicio: 'COEX',

    });
  }



  private crearCiclo(): FormGroup {
    return this.fb.group({
      estado: [this.enEdicion ? 'ACTU' : 'ADMI'],
      registro: [new Date().toISOString()],
      usuario: [this.usuarioActual],
      servicio: ['REME'],
      // especialidad: [''],
      // detalle_clinico: this.fb.group({}),
      // sistema: this.fb.group({}),
      // signos_vitales: this.fb.group({}),
      // antecedentes: this.fb.group({}),
      // ordenes: this.fb.group({}),
      // estudios: this.fb.group({}),
      // comentario: this.fb.group({}),
      // impresion_clinica: this.fb.group({}),
      // tratamiento: this.fb.group({}),
      // examen_fisico: this.fb.group({}),
      // nota_enfermeria: this.fb.group({}),
      // contraindicado: [''],
      // presa_quirurgica: this.fb.group({}),
      // egreso: this.fb.group({})
    });
  }

  filtrarCiclos(ciclos: any): any {
    const filtrados: any = {};
    Object.entries(ciclos).forEach(([key, ciclo]: [string, any]) => {
      if (ciclo && ciclo.estado && ciclo.registro) {
        filtrados[key] = {
          ...ciclo,
          usuario: ciclo.usuario || this.usuarioActual,
          registro: ciclo.registro || new Date().toISOString(),
          servicio: ciclo.servicio || 'REME',
          estado: ciclo.estado || (this.enEdicion ? 'ACTU' : 'ADMI'),
          // especialidad: ciclo.especialidad || null,
          // detalle_clinico: ciclo.detalle_clinico || {},
          // signos_vitales: ciclo.signos_vitales || {},
          // antecedentes: ciclo.antecedentes || {},
          // ordenes: ciclo.ordenes || {},
          // estudios: ciclo.estudios || {},
          // comentario: ciclo.comentario || {},
          // impresion_clinica: ciclo.impresion_clinica || {},
          // tratamiento: ciclo.tratamiento || {},
          // examen_fisico: ciclo.examen_fisico || {},
          // nota_enfermeria: ciclo.nota_enfermeria || {},
          // contraindicado: ciclo.contraindicado || '',
          // presa_quirurgica: ciclo.presa_quirurgica || {},
          // egreso: ciclo.egreso || {},
        };
      }
    });
    return filtrados;
  }

  private mostrarError(accion: string, error: any): void {
    console.error(`Error al ${accion}:`, error);
    alert(`Error al ${accion}. Consulte la consola para más detalles.`);
  }

}
