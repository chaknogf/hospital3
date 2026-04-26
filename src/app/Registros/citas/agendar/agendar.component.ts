import { ConteoCitas } from './../../../interface/citas';
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, signal, OnChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CitaService } from '../cita.service';
import { PacienteService } from '../../patient/paciente.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder, FormGroup, ReactiveFormsModule, FormsModule
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { CitaCreate, Citas, CitaUpdate } from '../../../interface/citas';
import { Paciente, PacienteJoin } from '../../../interface/interfaces';
import { distinctUntilChanged } from 'rxjs/operators';
import { debounceTime } from 'rxjs/operators';
import { Dict, especialidades } from '../../../enum/diccionarios';
import { EdadPipe, GrupoEdadPipe } from '../../../pipes/edad.pipe';
import { DatosExtraPipe } from '../../../pipes/datos-extra.pipe';
import { CitaConteoComponent } from '../citaConteo/citaConteo.component';


@Component({
  selector: 'app-agendar',
  templateUrl: './agendar.component.html',
  styleUrls: ['./agendar.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, EdadPipe, DatosExtraPipe, CitaConteoComponent, GrupoEdadPipe]
})


export class AgendarComponent implements OnInit, OnDestroy {

  // ======= INYECCIONES =======
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(CitaService);
  private pservice = inject(PacienteService);
  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);

  // ======= PROPIEDADES =======
  form: FormGroup;
  private destroy$ = new Subject<void>();
  especialidadSeleccionada: string | null = null;

  // ======= BÚSQUEDA DE PACIENTE =======
  busquedaExpediente = '';
  pacienteEncontrado: PacienteJoin | null = null;
  buscandoPaciente = false;
  citas: Citas | null = null
  especialidades: Dict[] = [];

  // ======= ICONOS SVG =======
  addIcon!: SafeHtml;
  removeIcon!: SafeHtml;
  saveIcon!: SafeHtml;
  cancelIcon!: SafeHtml;
  findIcon!: SafeHtml;
  faceidicon!: SafeHtml;
  touchicon!: SafeHtml;

  // ======= SEÑALES =======
  enEdicion = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // ======= CONSTRUCTOR =======
  constructor() {
    this.form = this.crearFormulario();

  }

  razonConsulta = [
    { ref: 'control', label: 'Control - Reconsulta' },
    { ref: 'preoperatorio', label: 'Preoperatorio' },
    { ref: 'ingreso', label: 'Ingreso SOP' },
    { ref: 'procedimiento', label: 'Procedimiento Menor' }
  ];

  ngOnInit(): void {
    this.valores();

    const pacienteId = this.route.snapshot.paramMap.get('pacienteId');
    const citaId = this.route.snapshot.paramMap.get('citaId');

    if (pacienteId) {
      this.buscarPacientePorId(Number(pacienteId));
    } else if (citaId) {
      this.cargarCitaParaEdicion(Number(citaId));
    }

    this.form.get('especialidad')?.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(200), distinctUntilChanged())
      .subscribe((esp: string) => { this.especialidadSeleccionada = esp; });

    this.form.get('fecha_cita')?.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(100), distinctUntilChanged())
      .subscribe((fecha: string) => {
        if (!fecha) return;
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        this.form.get('dia_semana')?.setValue(dias[new Date(fecha).getDay()], { emitEvent: false });
      });
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private valores(): void {
    this.especialidades = especialidades.filter(e => e.ref !== 'sop');

  }
  get tipoConsultaValue(): string {
    return this.form.get('datos_extra.razon_consulta')?.value;
  }

  // ======= FORMULARIO =======
  private crearFormulario(): FormGroup {

    return this.fb.group({
      id: [0],
      fecha_cita: [''],
      expediente: [''],
      paciente_id: [0],
      especialidad: [''],
      dia_semana: [{ value: '', disabled: true }],
      datos_extra: this.fb.group({
        notas: [''],
        razon_consulta: ['control'],

      })
    });
  }

  seleccionarRazonConsulta(valor: string): void {
    const actual = this.form.get('datos_extra.razon_consulta')?.value;

    // Toggle (opcional)
    const nuevo = actual === valor ? '' : valor;

    this.form.get('datos_extra.razon_consulta')?.setValue(nuevo);
  }



  actualizarDiaSemana(fecha: string) {
    if (!fecha) return;

    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const d = new Date(fecha);
    const dia = dias[d.getDay()];

    this.form.patchValue({ dia_semana: dia });
  }


  // ✅ Recibe el id como parámetro, no lo lee del snapshot
  private cargarCitaParaEdicion(id: number): void {
    this.isLoading.set(true);

    this.api.getCita(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
        catchError(() => {
          this.buscarPacientePorId(id);
          return of(null);
        })
      )
      .subscribe((data: Citas | null) => {
        if (!data) return;
        this.enEdicion.set(true);
        this.pacienteEncontrado = data.paciente;
        this.form.patchValue(data, { emitEvent: false });
        this.especialidadSeleccionada = data.especialidad;
        if (data.fecha_cita) this.actualizarDiaSemana(data.fecha_cita);
        this.error.set(null);
      });
  }

  buscarPacientePorId(id: number): void {
    this.pservice.getPaciente(id)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.error.set('Paciente no encontrado');
          return of(null);
        })
      )
      .subscribe(data => {
        if (!data) return;
        this.pacienteEncontrado = data;
        this.form.patchValue({ paciente_id: data.id }, { emitEvent: false });
      });
  }

  // buscarPacientePorExpediente(): void {
  //   const expediente = (this.busquedaExpediente || this.form.get('expediente')?.value || '').trim();
  //   if (!expediente) return;

  //   this.buscandoPaciente = true;
  //   this.error.set(null);
  //   this.pacienteEncontrado = null;

  //   this.pservice.pacienteExpediente(expediente)
  //     .pipe(
  //       takeUntil(this.destroy$),
  //       finalize(() => this.buscandoPaciente = false),
  //       catchError(() => {
  //         this.error.set('Paciente no encontrado: ' + expediente);
  //         return of(null);
  //       })
  //     )
  //     .subscribe((data: PacienteJoin | null) => {
  //       if (!data) return;
  //       this.pacienteEncontrado = data;
  //       this.busquedaExpediente = data.expediente ?? expediente;
  //       this.form.patchValue({
  //         paciente_id: data.id,
  //         expediente: data.expediente ?? expediente,
  //       }, { emitEvent: false });
  //     });
  // }

  quediaes(fecha: string): void {

  }



  // ======= UTILIDADES =======
  getNombrePaciente(): string {
    if (!this.pacienteEncontrado) return '';
    const n = this.pacienteEncontrado.nombre;
    return [
      n.primer_nombre,
      n.segundo_nombre,
      n.otro_nombre,
      n.primer_apellido,
      n.segundo_apellido,
      n.apellido_casada,
    ].filter(Boolean).join(' ').toUpperCase();
  }

  getTelefonoPaciente(): string {
    return this.pacienteEncontrado?.contacto?.telefonos ?? 'Sin teléfono registrado';
  }

  limpiarPaciente(): void {
    this.pacienteEncontrado = null;
    this.busquedaExpediente = '';
    this.form.patchValue({ paciente_id: 0, expediente: '' }, { emitEvent: false });
  }

  // ======= GUARDADO =======
  guardar(): void {
    const valor = this.form.getRawValue();

    if (!valor.fecha_cita) {
      this.error.set('Debe seleccionar una fecha');
      return;
    }

    if (!valor.paciente_id) {
      this.error.set('Debe seleccionar un paciente');
      return;
    }

    if (!valor.especialidad) {
      this.error.set('Debe seleccionar una especialidad');
      return;
    }

    const cita: CitaCreate = {
      fecha_cita: valor.fecha_cita,
      expediente: valor.expediente,
      paciente_id: valor.paciente_id,
      especialidad: valor.especialidad,
      datos_extra: valor.datos_extra,
    };

    this.enEdicion()
      ? this.actualizar(valor.id, cita)
      : this.crear(cita);


  }

  private crear(cita: CitaCreate): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.api.crearCita(cita)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          console.error('Error al crear cita:', err);
          this.error.set('No se pudo crear la cita.');
          return of(null);
        })
      )
      .subscribe(response => {
        if (!response) return;

        console.log('✅ Cita creada:', response);
        this.volver();
      });
  }


  private actualizar(id: number, cita: CitaUpdate): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.api.updateCita(id, cita)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          console.error('Error al actualizar cita:', err);
          this.error.set('No se pudo actualizar la cita.');
          return of(null);
        })
      )
      .subscribe(response => {
        if (!response) return;

        console.log('✅ Cita actulizada:', response);
        this.volver();
      });
  }

  // ======= NAVEGACIÓN =======
  volver(): void {
    this.router.navigate(['/pacientes']);
  }



}

