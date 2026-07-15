import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { DefuncionesService } from '../defunciones.service';
import { ApiService } from '../../../service/api.service';
import { PacienteService } from '../../patient/paciente.service';
import { Medico } from '../../../interface/medicos.interface';

@Component({
  selector: 'app-nuevaConstanciaDefuncion',
  templateUrl: './nuevaConstanciaDefuncion.component.html',
  styleUrls: ['./nuevaConstanciaDefuncion.component.css'],
  imports: [ReactiveFormsModule, FormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class NuevaConstanciaDefuncionComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private apis = inject(ApiService);
  private api = inject(DefuncionesService);
  private pservice = inject(PacienteService);
  private fb = inject(FormBuilder);

  form: FormGroup;
  private destroy$ = new Subject<void>();
  medicos: Medico[] = [];

  pacientePreview: any = null;
  madrePreview: any = null;
  expedientePaciente = '';
  expedienteMadre = '';
  documentoCorrelativo = '';

  isLoading = signal(false);
  buscandoPac = signal(false);
  buscandoMadre = signal(false);
  buscandoFallecidos = signal(false);
  error = signal<string | null>(null);
  errorPac = signal<string | null>(null);
  errorMadre = signal<string | null>(null);
  guardadoOk = signal(false);

  tabActivo = signal<'paciente' | 'causas' | 'fetal' | 'madre'>('paciente');

  // Búsqueda de fallecidos existentes
  fallecidos: any[] = [];
  qFallecido = '';

  constructor() {
    this.form = this.crearFormulario();
    this.obtenerCorrelativo();
  }

  ngOnInit(): void {
    this.cargarMedicos();
    this.form.get('es_fetal')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(v => {
      if (v) this.tabActivo.set('fetal');
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private crearFormulario(): FormGroup {
    return this.fb.group({
      paciente_id: [null],
      madre_id: [null],
      medico_id: [null],
      fecha_defuncion: [new Date().toISOString().slice(0, 16)],
      es_fetal: [false],
      muerte_gestacion: [''],
      causa_a: ['', Validators.required],
      causa_b: [''],
      causa_c: [''],
      causa_d: [''],
      causa_intervalo: [''],
      causa_otros: [''],
      fue_presunto: [''],
      lugar_lesion: [''],
      ocurrio_trabajo: [false],
      accidente_transito: [false],
      arma: [''],
      embarazos_previvos_vivos: [null],
      embarazos_previvos_muertos: [null],
      fetal_sexo: [''],
      fetal_murio_antes_parto: [false],
      fetal_parto_tipo: [''],
      fetal_clase_parto: [''],
      fetal_via_parto: [''],
      fetal_semanas_gestacion: [null],
      fetal_causas_fetales: [''],
      fetal_causas_maternas: [''],
      observaciones: ['']
    });
  }

  private obtenerCorrelativo(): void {
    this.apis.corDefuncion().pipe(takeUntil(this.destroy$)).subscribe({
      next: r => this.documentoCorrelativo = r.constancia_defuncion || '',
      error: () => this.documentoCorrelativo = 'DF-?'
    });
  }

  buscarFallecidos(): void {
    const q = this.qFallecido.trim();
    if (!q) return;
    this.buscandoFallecidos.set(true);
    this.api.buscarPacientesFallecidos({ q, limit: 20 })
      .pipe(finalize(() => this.buscandoFallecidos.set(false)), takeUntil(this.destroy$))
      .subscribe({
        next: r => this.fallecidos = r.pacientes,
        error: () => this.fallecidos = []
      });
  }

  seleccionarPaciente(p: any): void {
    this.pacientePreview = p;
    this.fallecidos = [];
    this.qFallecido = '';
    this.form.patchValue({ paciente_id: p.id });
  }

  limpiarPaciente(): void {
    this.pacientePreview = null;
    this.fallecidos = [];
    this.qFallecido = '';
    this.errorPac.set(null);
    this.form.patchValue({ paciente_id: null });
  }

  buscarMadre(): void {
    const exp = this.expedienteMadre.trim();
    if (!exp) { this.errorMadre.set('Ingrese un número de expediente.'); return; }
    this.errorMadre.set(null);
    this.madrePreview = null;
    this.buscandoMadre.set(true);
    this.pservice.pacienteExpediente(exp).pipe(
      catchError(() => { this.errorMadre.set('Paciente no encontrado con ese expediente.'); return of(null); }),
      finalize(() => this.buscandoMadre.set(false)),
      takeUntil(this.destroy$)
    ).subscribe((p: any) => {
      if (!p) return;
      this.madrePreview = p;
      this.form.patchValue({ madre_id: p.id });
    });
  }

  guardar(): void {
    this.error.set(null);
    if (!this.form.value.paciente_id && !this.form.value.es_fetal) {
      this.error.set('Debe seleccionar un paciente fallecido.');
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Complete los campos requeridos (causa A es obligatoria).');
      return;
    }
    const payload = this.construirPayload();
    this.isLoading.set(true);
    this.guardadoOk.set(false);

    const obs$ = this.form.value.paciente_id
      ? this.api.registrarDefuncion(this.form.value.paciente_id, payload)
      : this.api.createDefuncion({ ...payload, es_fetal: true });

    obs$.pipe(
      catchError(err => { this.mostrarError('crear defunción', err); return of(null); }),
      finalize(() => this.isLoading.set(false)),
      takeUntil(this.destroy$)
    ).subscribe(res => {
      if (!res) return;
      this.guardadoOk.set(true);
      this.router.navigate(['/defunciones']);
    });
  }

  private construirPayload(): any {
    const v = this.form.getRawValue();
    return {
      medico_id: v.medico_id || undefined,
      fecha_defuncion: v.fecha_defuncion || undefined,
      muerte_gestacion: v.muerte_gestacion || undefined,
      causa_a: v.causa_a || undefined,
      causa_b: v.causa_b || undefined,
      causa_c: v.causa_c || undefined,
      causa_d: v.causa_d || undefined,
      causa_intervalo: v.causa_intervalo || undefined,
      causa_otros: v.causa_otros || undefined,
      fue_presunto: v.fue_presunto || undefined,
      lugar_lesion: v.lugar_lesion || undefined,
      ocurrio_trabajo: v.ocurrio_trabajo || undefined,
      accidente_transito: v.accidente_transito || undefined,
      arma: v.arma || undefined,
      es_fetal: v.es_fetal || false,
      ...(v.madre_id ? { madre_id: v.madre_id } : {}),
      embarazos_previvos_vivos: v.embarazos_previvos_vivos ?? undefined,
      embarazos_previvos_muertos: v.embarazos_previvos_muertos ?? undefined,
      fetal_sexo: v.fetal_sexo || undefined,
      fetal_murio_antes_parto: v.fetal_murio_antes_parto || undefined,
      fetal_parto_tipo: v.fetal_parto_tipo || undefined,
      fetal_clase_parto: v.fetal_clase_parto || undefined,
      fetal_via_parto: v.fetal_via_parto || undefined,
      fetal_semanas_gestacion: v.fetal_semanas_gestacion ?? undefined,
      fetal_causas_fetales: v.fetal_causas_fetales || undefined,
      fetal_causas_maternas: v.fetal_causas_maternas || undefined,
      observaciones: v.observaciones || undefined,
    };
  }

  cargarMedicos(): void {
    const filtros = { activo: true, especialidad: 'GINECOLOGÍA', limit: 200 };
    this.apis.getMedicos(filtros).pipe(takeUntil(this.destroy$)).subscribe({
      next: data => this.medicos = data,
      error: err => console.error('Error al cargar médicos:', err)
    });
  }

  setTab(tab: 'paciente' | 'causas' | 'fetal' | 'madre'): void { this.tabActivo.set(tab); }

  volver(): void { this.router.navigate(['/defunciones']); }

  private mostrarError(accion: string, error: any): void {
    const msg = error?.error?.detail || error?.message || 'Consulte la consola';
    console.error(`Error al ${accion}:`, error);
    this.error.set(`Error al ${accion}: ${msg}`);
  }
}
