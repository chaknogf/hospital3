import { TimePipe } from './../../../pipes/time.pipe';
import { ConstanciasService } from './../constancias.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { PacienteService } from '../../patient/paciente.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, catchError, finalize, map, distinctUntilChanged } from 'rxjs/operators';
import { of } from 'rxjs';
import { VecindadPipe } from '../../../pipes/lugar.pipe';
import { ApiService } from '../../../service/api.service';
import { Medico } from '../../../interface/medicos.interface';

@Component({
  selector: 'app-nuevaConstanciaNacimiento',
  templateUrl: './nuevaConstanciaNacimiento.component.html',
  styleUrls: ['./nuevaConstanciaNacimiento.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, VecindadPipe],
  standalone: true
})
export class NuevaConstanciaNacimientoComponent implements OnInit, OnDestroy {

  // ======= INYECCIONES =======
  private router = inject(Router);
  private apis = inject(ApiService);
  private api = inject(ConstanciasService);
  private pservice = inject(PacienteService);
  private fb = inject(FormBuilder);

  // ======= PROPIEDADES =======
  form: FormGroup;
  private destroy$ = new Subject<void>();
  medicos: Medico[] = [];

  // ── Preview visual (no van al payload, solo muestran info al usuario) ──
  pacientePreview: any = null;
  madrePreview: any = null;

  // ── Inputs de búsqueda por expediente ──
  expedientePaciente = '';
  expedienteMadre = '';

  // ======= SEÑALES =======
  isLoading = signal(false);
  buscandoPac = signal(false);
  buscandoMadre = signal(false);
  error = signal<string | null>(null);
  errorPac = signal<string | null>(null);
  errorMadre = signal<string | null>(null);
  guardadoOk = signal(false);

  // ======= TABS =======
  tabActivo = signal<'datos' | 'madre' | 'medico'>('datos');

  constructor() {
    this.form = this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarMedicos();


    // hijos = vivos + muertos (auto-calculado) — igual que en edición
    combineLatest([
      this.form.get('vivos')!.valueChanges,
      this.form.get('muertos')!.valueChanges
    ]).pipe(
      map(([v, m]) => (Number(v) || 0) + (Number(m) || 0)),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(total => {
      this.form.get('hijos')!.setValue(total, { emitEvent: false });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ======= FORMULARIO =======
  // Misma estructura de IDs que el componente de edición
  private crearFormulario(): FormGroup {
    return this.fb.group({
      paciente_id: [null, [Validators.required]],   // número puro — se llena via búsqueda por expediente
      madre_id: [null, [Validators.required]],   // número puro — se llena via búsqueda por expediente
      medico_id: [null],   // número puro — se llena via <select>
      registrador_id: [null],   // número puro — opcional, puede venir de sesión
      documento: ['', [Validators.required]],
      nombre_madre: [''],
      vecindad_madre: [''],
      fecha_registro: [new Date().toISOString().split('T')[0]],
      menor_edad: this.fb.group({
        libro: [''],
        folio: [''],
        partida: [''],
        cui: [''],
        municipalidad: ['']
      }),
      hijos: [{ value: null, disabled: true }], // calculado automáticamente
      vivos: [null],
      muertos: [null],
      observaciones: [''],
    });
  }

  // ======= BÚSQUEDA POR EXPEDIENTE =======
  // El expediente es solo un helper visual para obtener el id numérico.
  // Una vez encontrado el paciente, solo paciente_id (número) se asigna al form.
  // El preview se guarda aparte para mostrar info en pantalla, no va al payload.

  buscarPaciente(): void {
    const exp = this.expedientePaciente.trim();
    if (!exp) { this.errorPac.set('Ingrese un número de expediente.'); return; }

    this.errorPac.set(null);
    this.pacientePreview = null;
    this.buscandoPac.set(true);

    this.pservice.pacienteExpediente(exp)
      .pipe(
        catchError(() => {
          this.errorPac.set('Paciente no encontrado con ese expediente.');
          return of(null);
        }),
        finalize(() => this.buscandoPac.set(false)),
        takeUntil(this.destroy$)
      )
      .subscribe(p => {
        if (!p) return;
        this.pacientePreview = p;
        this.form.patchValue({ paciente_id: p.id });
      });
  }

  limpiarPaciente(): void {
    this.pacientePreview = null;
    this.expedientePaciente = '';
    this.errorPac.set(null);
    this.form.patchValue({ paciente_id: null });
  }

  buscarMadre(): void {
    const exp = this.expedienteMadre.trim();
    if (!exp) { this.errorMadre.set('Ingrese un número de expediente.'); return; }

    this.errorMadre.set(null);
    this.madrePreview = null;
    this.buscandoMadre.set(true);

    this.pservice.pacienteExpediente(exp)
      .pipe(
        catchError(() => {
          this.errorMadre.set('Paciente no encontrado con ese expediente.');
          return of(null);
        }),
        finalize(() => this.buscandoMadre.set(false)),
        takeUntil(this.destroy$)
      )
      .subscribe(p => {
        if (!p) return;
        this.madrePreview = p;

        const nombre = [
          p.nombre?.primer_nombre,
          p.nombre?.segundo_nombre,
          p.nombre?.otro_nombre,
          p.nombre?.primer_apellido,
          p.nombre?.segundo_apellido,
          p.nombre?.apellido_casada
        ].filter(Boolean).join(' ');

        this.form.patchValue({
          madre_id: p.id,
          nombre_madre: nombre   // siempre string
        });
      });
  }

  limpiarMadre(): void {
    this.madrePreview = null;
    this.expedienteMadre = '';
    this.errorMadre.set(null);
    this.form.patchValue({ madre_id: null, nombre_madre: '' });
  }

  // ======= CREAR =======
  guardar(): void {
    this.error.set(null);

    if (!this.form.value.paciente_id) {
      this.error.set('Debe buscar y seleccionar el paciente (neonato) antes de crear.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Complete los campos requeridos antes de guardar.');
      return;
    }

    const payload = this.construirPayload();
    this.isLoading.set(true);
    this.guardadoOk.set(false);

    this.api.createConstancia(payload)
      .pipe(
        catchError(err => {
          this.mostrarError('crear constancia', err);
          return of(null);
        }),
        finalize(() => this.isLoading.set(false)),
        takeUntil(this.destroy$)
      )
      .subscribe(res => {
        if (!res) return;
        this.guardadoOk.set(true);
        this.router.navigate(['/nacimientos']);
      });
  }

  // Mismo patrón que construirPayload() en edición —
  // solo IDs numéricos, sin datos de preview
  private construirPayload(): any {
    const v = this.form.getRawValue(); // getRawValue incluye hijos (disabled)
    return {
      paciente_id: v.paciente_id || undefined,
      madre_id: v.madre_id || undefined,
      medico_id: v.medico_id || undefined,
      registrador_id: v.registrador_id || undefined,
      documento: v.documento || undefined,
      fecha_registro: v.fecha_registro || undefined,
      nombre_madre: v.nombre_madre || undefined,
      vecindad_madre: v.vecindad_madre || undefined,
      menor_edad: this.limpiarObj(v.menor_edad),
      hijos: v.hijos ?? undefined,
      vivos: v.vivos ?? undefined,
      muertos: v.muertos ?? undefined,
      observaciones: v.observaciones || undefined,
    };
  }

  // ======= MÉDICOS =======
  cargarMedicos(): void {
    this.apis.getMedicos({})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => this.medicos = data,
        error: err => console.error('Error al cargar médicos:', err)
      });
  }

  // ======= UTILIDADES =======
  /** Elimina claves con valores vacíos — igual que en edición */
  private limpiarObj(obj: Record<string, any>): Record<string, any> | undefined {
    const limpio = Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== null && v !== '' && v !== undefined)
    );
    return Object.keys(limpio).length ? limpio : undefined;
  }

  setTab(tab: 'datos' | 'madre' | 'medico'): void {
    this.tabActivo.set(tab);
  }

  volver(): void {
    this.router.navigate(['/nacimientos']);
  }

  private mostrarError(accion: string, error: any): void {
    const msg = error?.error?.detail || error?.message || 'Consulte la consola';
    console.error(`❌ Error al ${accion}:`, error);
    this.error.set(`Error al ${accion}: ${msg}`);
  }
}
