import { ConstanciasService } from './../constancias.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PacienteService } from '../../patient/paciente.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, catchError, finalize, map, distinctUntilChanged } from 'rxjs/operators';
import { of } from 'rxjs';
import { ConstanciaNacimiento } from '../constancias.inteface';
import { VecindadPipe } from '../../../pipes/lugar.pipe';
import { ApiService } from '../../../service/api.service';

@Component({
  selector: 'app-constanciasNacimiento',
  templateUrl: './constanciasNacimiento.component.html',
  styleUrls: ['./constanciasNacimiento.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, VecindadPipe]
})
export class ConstanciasNacimientoComponent implements OnInit, OnDestroy {

  // ======= INYECCIONES =======
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apis = inject(ApiService);
  private api = inject(ConstanciasService);
  private pservice = inject(PacienteService);
  private fb = inject(FormBuilder);

  // ======= PROPIEDADES =======
  form: FormGroup;
  private destroy$ = new Subject<void>();
  constancia: ConstanciaNacimiento | null = null;

  // ======= SEÑALES =======
  enEdicion = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);
  guardadoOk = signal(false);

  // ======= TABS =======
  tabActivo = signal<'datos' | 'madre' | 'medico' | 'historial'>('datos');

  constructor() {
    this.form = this.crearFormulario();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.enEdicion.set(true);
      this.cargarDatos(Number(id));
    }

    // hijos = vivos + muertos  (auto-calculado)
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
  private crearFormulario(): FormGroup {
    return this.fb.group({
      id: [0],
      documento: [''],
      paciente_id: [0],
      madre_id: [0],
      medico_id: [0],
      registrador_id: [0],
      nombre_madre: [''],
      vecindad_madre: [''],
      fecha_registro: [''],
      menor_edad: this.fb.group({
        libro: [''],
        folio: [''],
        partida: [''],
        cui: [''],
        municipalidad: ['']
      }),
      hijos: [{ value: null, disabled: true }],   // calculado automáticamente
      vivos: [null],
      muertos: [null],
      observaciones: [''],
      // Campo obligatorio para historial
      //motivo: ['', Validators.required]
    });
  }

  // ======= CARGA =======
  cargarDatos(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.api.getCostancia(id)
      .pipe(
        catchError(err => {
          this.mostrarError('cargar datos', err);
          return of(null);
        }),
        finalize(() => this.isLoading.set(false)),
        takeUntil(this.destroy$)
      )
      .subscribe(data => {
        if (!data) return;
        this.constancia = data;
        this.poblarFormulario(data);
      });
  }

  private poblarFormulario(c: ConstanciaNacimiento): void {
    this.form.patchValue({
      id: c.id,
      documento: c.documento ?? '',
      paciente_id: c.paciente_id,
      madre_id: c.madre_id ?? null,
      medico_id: c.medico_id ?? null,
      registrador_id: c.registrador_id ?? null,
      nombre_madre: c.nombre_madre ?? '',
      vecindad_madre: c.vecindad_madre ?? '',
      fecha_registro: c.fecha_registro ?? '',
      hijos: c.hijos ?? null,
      vivos: c.vivos ?? null,
      muertos: c.muertos ?? null,
      observaciones: c.observaciones ?? '',
      menor_edad: {
        libro: c.menor_edad?.['libro'] ?? '',
        folio: c.menor_edad?.['folio'] ?? '',
        partida: c.menor_edad?.['partida'] ?? '',
        cui: c.menor_edad?.['cui'] ?? '',
        municipalidad: c.menor_edad?.['municipalidad'] ?? ''
      }
    });
  }

  // ======= GUARDAR =======
  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Complete los campos requeridos antes de guardar.');
      return;
    }

    const id = this.form.value.id;
    if (!id) { this.error.set('ID de constancia no encontrado.'); return; }

    const payload = this.construirPayload();
    this.isLoading.set(true);
    this.error.set(null);
    this.guardadoOk.set(false);

    this.api.updateConstancia(id, payload)
      .pipe(
        catchError(err => {
          this.mostrarError('guardar', err);
          return of(null);
        }),
        finalize(() => this.isLoading.set(false)),
        takeUntil(this.destroy$)
      )
      .subscribe(res => {
        if (!res) return;
        this.constancia = res;
        this.guardadoOk.set(true);
        setTimeout(() => this.guardadoOk.set(false), 3000);
        this.router.navigate(['/nacimientos'])
      });
  }

  private construirPayload(): any {
    const v = this.form.getRawValue(); // getRawValue incluye campos disabled (hijos)
    return {
      documento: v.documento || undefined,
      nombre_madre: v.nombre_madre || undefined,
      vecindad_madre: v.vecindad_madre || undefined,
      fecha_registro: v.fecha_registro || undefined,
      medico_id: v.medico_id || undefined,
      menor_edad: this.limpiarObj(v.menor_edad),
      hijos: v.hijos ?? undefined,
      vivos: v.vivos ?? undefined,
      muertos: v.muertos ?? undefined,
      //observaciones: v.observaciones || undefined,
      //motivo: v.motivo
    };
  }

  /** Elimina claves con valores vacíos para no mandar nulls innecesarios */
  private limpiarObj(obj: Record<string, any>): Record<string, any> | undefined {
    const limpio = Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== null && v !== '' && v !== undefined)
    );
    return Object.keys(limpio).length ? limpio : undefined;
  }

  // ======= NAVEGACIÓN TABS =======
  setTab(tab: 'datos' | 'madre' | 'medico' | 'historial'): void {
    this.tabActivo.set(tab);
  }

  // ======= UTILIDADES =======
  volver(): void {
    this.router.navigate(['/nacimientos'])
  }

  editarHijo(id: any): void {
    this.router.navigate(['/pacienteEdit', id])
  }

  editarMadre(id: number): void {
    this.router.navigate(['/pacienteEdit', id])
  }


  get motivoInvalido(): boolean {
    const c = this.form.get('motivo');
    return !!(c?.invalid && c?.touched);
  }

  private mostrarError(accion: string, error: any): void {
    const msg = error?.error?.detail || error?.message || 'Consulte la consola';
    console.error(`❌ Error al ${accion}:`, error);
    this.error.set(`Error al ${accion}: ${msg}`);
  }
}
