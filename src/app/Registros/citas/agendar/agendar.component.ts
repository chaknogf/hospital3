import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, signal, OnChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService } from '../../../service/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder, FormGroup, ReactiveFormsModule, FormsModule
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  addIcon, removeIcon, saveIcon, cancelIcon, findIcon,
  touchicon, faceidicon
} from '../../../shared/icons/svg-icon';
import { CitaCreate, CitaResponse, Citas } from '../../../interface/citas';
import { Paciente, PacienteJoin } from '../../../interface/interfaces';
import { distinctUntilChanged } from 'rxjs/operators';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-agendar',
  templateUrl: './agendar.component.html',
  styleUrls: ['./agendar.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class AgendarComponent implements OnInit, OnDestroy {

  // ======= INYECCIONES =======
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);

  // ======= PROPIEDADES =======
  form: FormGroup;
  private destroy$ = new Subject<void>();

  // ======= BÚSQUEDA DE PACIENTE =======
  busquedaExpediente = '';
  pacienteEncontrado: PacienteJoin | null = null;
  buscandoPaciente = false;
  citas: Citas | null = null

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
    this.inicializarIconos();
  }

  // ======= CICLO DE VIDA =======
  ngOnInit(): void {
    this.form.get('expediente')?.valueChanges
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(exp => {
        if (exp?.trim()) {
          this.busquedaExpediente = exp;
          this.buscarPaciente();
        }
      });

    this.cargarCitaParaEdicion();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }



  // ======= FORMULARIO =======
  private crearFormulario(): FormGroup {
    const { username } = this.api.getUsuarioActual();
    return this.fb.group({
      id: [0],
      fecha: [''],
      expediente: [''],
      paciente_id: [0],
      especialidad: [''],
      agenda: [''],
      created_by: [username],
      datos_extra: this.fb.group({
        notas: [''],
        tipo_consulta: [''],
        orden: [''],
      })
    });
  }

  private inicializarIconos(): void {
    this.addIcon = this.sanitizer.bypassSecurityTrustHtml(addIcon);
    this.removeIcon = this.sanitizer.bypassSecurityTrustHtml(removeIcon);
    this.saveIcon = this.sanitizer.bypassSecurityTrustHtml(saveIcon);
    this.cancelIcon = this.sanitizer.bypassSecurityTrustHtml(cancelIcon);
    this.findIcon = this.sanitizer.bypassSecurityTrustHtml(findIcon);
    this.faceidicon = this.sanitizer.bypassSecurityTrustHtml(faceidicon);
    this.touchicon = this.sanitizer.bypassSecurityTrustHtml(touchicon);
  }

  // ======= CARGAR PARA EDICIÓN =======
  private cargarCitaParaEdicion(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) return;

    const id = Number(idParam);
    if (isNaN(id) || id <= 0) {
      this.error.set('ID de cita inválido');
      return;
    }

    this.isLoading.set(true);

    this.api.getCita(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          console.error('Error al cargar cita:', err);
          this.error.set('Error al obtener la cita');
          return of(null);
        })
      )
      .subscribe((data: Citas | null) => {
        if (!data) return;

        this.enEdicion.set(true);
        this.pacienteEncontrado = data.paciente;
        this.form.patchValue(data, { emitEvent: false });
        this.error.set(null);
      });
  }

  /// ======= BÚSQUEDA DE PACIENTE =======
  buscarPaciente(): void {
    // Toma el valor del ngModel O del form como fallback
    const expediente = (this.busquedaExpediente || this.form.get('expediente')?.value || '').trim();
    if (!expediente) return;

    this.buscandoPaciente = true;
    this.error.set(null);
    this.pacienteEncontrado = null;

    this.api.pacienteExpediente(expediente)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.buscandoPaciente = false),
        catchError(err => {
          console.error('Error al buscar paciente:', err);
          this.error.set('Paciente no encontrado con expediente: ' + expediente);
          return of(null);
        })
      )
      .subscribe((data: PacienteJoin | null) => {
        if (!data) return;

        this.pacienteEncontrado = data;
        this.busquedaExpediente = data.expediente ?? expediente;

        this.form.patchValue({
          paciente_id: data.id,
          expediente: data.expediente ?? expediente,
        }, { emitEvent: false });
      });
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
    if (!this.form.valid) {
      this.error.set('Por favor complete los campos requeridos');
      return;
    }

    const valor = this.form.getRawValue();

    // Limpiar id=0 si es creación
    const cita: CitaCreate = {
      fecha_registro: valor.fecha,
      expediente: valor.expediente,
      paciente_id: valor.paciente_id,
      especialidad: valor.especialidad,
      fecha_cita: valor.agenda,
      datos_extra: valor.datos_extra,
      
    };

    this.enEdicion() ? this.actualizar(valor.id, cita) : this.crear(cita);
  }

  private crear(cita: CitaCreate): void {
    this.isLoading.set(true);

    this.api.crearCita(cita)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          console.error('Error al crear cita:', err);
          this.error.set('Error al crear la cita');
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) this.volver();
      });
  }

  private actualizar(id: number, cita: CitaCreate): void {
    this.isLoading.set(true);

    this.api.updateCita(id, cita)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          console.error('Error al actualizar cita:', err);
          this.error.set('Error al actualizar la cita');
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) this.volver();
      });
  }

  // ======= NAVEGACIÓN =======
  volver(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }



}

