import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { DefuncionesService } from '../defunciones.service';
import { ApiService } from '../../../service/api.service';
import { DefuncionOut } from '../../../interface/consDef';
import { Medico } from '../../../interface/medicos.interface';

@Component({
  selector: 'app-constanciaDefuncion',
  templateUrl: './constanciaDefuncion.component.html',
  styleUrls: ['./constanciaDefuncion.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormsModule]
})
export class ConstanciaDefuncionComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(DefuncionesService);
  private apis = inject(ApiService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  form: FormGroup;
  private destroy$ = new Subject<void>();
  defuncion: DefuncionOut | null = null;
  medicos: Medico[] = [];

  enEdicion = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);
  guardadoOk = signal(false);

  tabActivo = signal<'causas' | 'fetal' | 'madre'>('causas');

  constructor() {
    this.form = this.crearFormulario();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.enEdicion.set(true);
      this.cargarDatos(Number(id));
    }
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
      id: [0],
      paciente_id: [{ value: null, disabled: true }],
      madre_id: [null],
      medico_id: [null],
      fecha_defuncion: [''],
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

  cargarDatos(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.api.getDefuncion(id).pipe(
      catchError(err => { this.mostrarError('cargar datos', err); return of(null); }),
      finalize(() => this.isLoading.set(false)),
      takeUntil(this.destroy$)
    ).subscribe(data => {
      if (!data) return;
      this.defuncion = data;
      this.poblarFormulario(data);
      this.cdr.markForCheck();
    });
  }

  private poblarFormulario(d: DefuncionOut): void {
    this.form.patchValue({
      id: d.id,
      paciente_id: d.paciente_id,
      madre_id: d.madre_id ?? null,
      medico_id: d.medico_id ?? null,
      fecha_defuncion: d.fecha_defuncion?.slice(0, 16) ?? '',
      es_fetal: d.es_fetal ?? false,
      muerte_gestacion: d.muerte_gestacion ?? '',
      causa_a: d.causa_a ?? '',
      causa_b: d.causa_b ?? '',
      causa_c: d.causa_c ?? '',
      causa_d: d.causa_d ?? '',
      causa_intervalo: d.causa_intervalo ?? '',
      causa_otros: d.causa_otros ?? '',
      fue_presunto: d.fue_presunto ?? '',
      lugar_lesion: d.lugar_lesion ?? '',
      ocurrio_trabajo: d.ocurrio_trabajo ?? false,
      accidente_transito: d.accidente_transito ?? false,
      arma: d.arma ?? '',
      embarazos_previvos_vivos: d.embarazos_previvos_vivos ?? null,
      embarazos_previvos_muertos: d.embarazos_previvos_muertos ?? null,
      fetal_sexo: d.fetal_sexo ?? '',
      fetal_murio_antes_parto: d.fetal_murio_antes_parto ?? false,
      fetal_parto_tipo: d.fetal_parto_tipo ?? '',
      fetal_clase_parto: d.fetal_clase_parto ?? '',
      fetal_via_parto: d.fetal_via_parto ?? '',
      fetal_semanas_gestacion: d.fetal_semanas_gestacion ?? null,
      fetal_causas_fetales: d.fetal_causas_fetales ?? '',
      fetal_causas_maternas: d.fetal_causas_maternas ?? '',
      observaciones: d.observaciones ?? ''
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Complete los campos requeridos (causa A es obligatoria).');
      return;
    }
    const id = this.form.value.id;
    if (!id) { this.error.set('ID de defunción no encontrado.'); return; }

    const payload = this.construirPayload();
    this.isLoading.set(true);
    this.error.set(null);
    this.guardadoOk.set(false);

    this.api.updateDefuncion(id, payload).pipe(
      catchError(err => { this.mostrarError('guardar', err); return of(null); }),
      finalize(() => this.isLoading.set(false)),
      takeUntil(this.destroy$)
    ).subscribe(res => {
      if (!res) return;
      this.defuncion = res;
      this.guardadoOk.set(true);
      setTimeout(() => this.guardadoOk.set(false), 3000);
      this.router.navigate(['/defunciones']);
      this.cdr.markForCheck();
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
      next: data => {
        this.medicos = data;
        const ctrl = this.form.get('medico_id');
        const val = ctrl?.value;
        if (val != null && data.some(m => m.id === val)) {
          ctrl?.setValue(val, { emitEvent: false });
        } else if (data.length === 1) {
          ctrl?.setValue(data[0].id ?? null, { emitEvent: false });
        }
        this.cdr.markForCheck();
      },
      error: err => console.error('Error al cargar médicos:', err)
    });
  }

  setTab(tab: 'causas' | 'fetal' | 'madre'): void { this.tabActivo.set(tab); }
  volver(): void { this.router.navigate(['/defunciones']); }

  private mostrarError(accion: string, error: any): void {
    const msg = error?.error?.detail || error?.message || 'Consulte la consola';
    console.error(`Error al ${accion}:`, error);
    this.error.set(`Error al ${accion}: ${msg}`);
  }
}
