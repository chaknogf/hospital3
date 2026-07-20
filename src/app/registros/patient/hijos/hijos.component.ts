import { PacienteService } from '../paciente.service';
import { ApiService } from '../../../service/api.service';

import { Component, OnInit, OnDestroy, signal, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, of } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { SoloNumeroDirective } from '../../../directives/soloNumero.directive';
import { Hijode, HijodeItem, HijodeDatosExtra, MadreHijoResponse, Paciente } from '../../../interface/interfaces';
import { Medico } from '../../../interface/medicos.interface';

@Component({
  selector: 'app-hijos',
  templateUrl: './hijos.component.html',
  styleUrls: ['./hijos.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    SoloNumeroDirective
  ]
})
export class HijosComponent implements OnInit, OnDestroy {
  readonly Math = Math;

  pacienteId!: number;

  private fb = inject(FormBuilder);
  private api = inject(PacienteService);
  private apis = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  madreInfo = signal<string | null>(null);

  form!: FormGroup;

  sectionActiva = signal(0);
  pasosCompletados = [false, false];

  steps = [
    { label: 'BÁSICO' },
    { label: 'PARTO' },
  ];

  opcionesSexo = [
    { label: '♂ Masculino', valor: 'M' },
    { label: '♀ Femenino', valor: 'F' },
  ];

  opcionesEstado = [
    { label: '● Vivo', valor: 'V' },
    { label: '● Fallecido', valor: 'F' },
  ];

  opcionesTipoParto = [
    { label: 'Simple', valor: 'Simple' },
    { label: 'Múltiple', valor: 'Multiple' },
  ];

  opcionesClaseParto = [
    { label: 'Eutócico (Vaginal)', valor: 'Pes' },
    { label: 'Distócico (Cesárea)', valor: 'Cstp' },
  ];

  opcionesExtra = [
    { label: 'No', valor: 'no' },
    { label: 'Sí', valor: 'si' },
  ];

  totalNacimientos = signal(1);
  nacimientoActual = signal(1);
  mostrarSelectorNacimientos = signal(false);
  children: HijodeItem[] = [];

  medicos: Medico[] = [];

  private destroy$ = new Subject<void>();

  get esMultiple(): boolean {
    return this.form.get('datos_extra.tipo_parto')?.value === 'Multiple';
  }

  private pesoValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      if (!/^\d+(\.\d{1,2})?$/.test(value)) {
        return { peso: 'Formato inválido. Ej: 6.08 (libras.onzas)' };
      }

      const [librasStr, onzasStr] = String(value).split('.');
      const libras = parseInt(librasStr, 10);
      if (libras < 0 || libras > 20) {
        return { peso: 'Las libras deben estar entre 0 y 20' };
      }

      if (onzasStr) {
        const onzas = parseInt(onzasStr, 10);
        if (onzas < 0 || onzas > 15) {
          return { peso: 'Las onzas deben estar entre 0 y 15' };
        }
      }
      return null;
    };
  }

  private limpiarPeso(value: string): string {
    let limpio = value.replace(/[^\d.]/g, '');
    const partes = limpio.split('.');
    if (partes.length > 2) limpio = partes[0] + '.' + partes.slice(1).join('');
    if (partes[0]?.length > 2) limpio = partes[0].slice(0, 2) + (partes[1] !== undefined ? '.' + partes[1] : '');
    if (partes[1]?.length > 2) limpio = partes[0] + '.' + partes[1].slice(0, 2);
    return limpio;
  }

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.pacienteId = params['id'];
        this.cargarMadre();
        this.cdr.markForCheck();
      });

    this.form = this.crearFormulario();
    this.cargarMedicos();
  }

  private cargarMadre(): void {
    this.api.getPaciente(this.pacienteId)
      .pipe(
        catchError(() => of(null)),
        takeUntil(this.destroy$)
      )
      .subscribe(p => {
        if (!p?.nombre) return;
        const nombre = [
          p.nombre.primer_nombre,
          p.nombre.segundo_nombre,
          p.nombre.primer_apellido,
          p.nombre.segundo_apellido,
        ].filter(Boolean).join(' ');
        this.madreInfo.set(nombre);
        this.cdr.markForCheck();
      });
  }

  private cargarMedicos(): void {
    const filtros = { activo: true, especialidad: 'GINECOLOGÍA', limit: 200 };
    this.apis.getMedicos(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.medicos = data;
          if (this.medicos.length === 1) {
            this.form.get('datos_extra.id_medico')?.setValue(this.medicos[0].id ?? null);
          }
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Error al cargar médicos:', err)
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private crearFormulario(): FormGroup {
    return this.fb.group({
      sexo: ['', Validators.required],
      fecha_nacimiento: ['', Validators.required],
      estado: ['V'],

      datos_extra: this.fb.group({
        peso_nacimiento: ['', this.pesoValidator()],
        edad_gestacional: [''],
        tipo_parto: [''],
        clase_parto: [''],
        extrahospitalario: ['no'],
        hora_nacimiento: [''],
        id_medico: [null],
      }),
    });
  }

  cerrarSelectorNacimientos(): void {
    this.mostrarSelectorNacimientos.set(false);
    this.form.get('datos_extra.tipo_parto')?.setValue('Simple');
  }

  manejarTipoPartoMultiple(): void {
    const tipoParto = this.form.get('datos_extra.tipo_parto')?.value;
    this.children = [];

    if (tipoParto === 'Multiple') {
      this.mostrarSelectorNacimientos.set(true);
      this.nacimientoActual.set(1);
    } else {
      this.mostrarSelectorNacimientos.set(false);
      this.totalNacimientos.set(1);
      this.nacimientoActual.set(1);
    }
  }

  confirmarTotalNacimientos(): void {
    if (this.totalNacimientos() < 2) {
      this.error.set('❌ Debe seleccionar al menos 2 nacimientos para múltiples');
      return;
    }
    this.mostrarSelectorNacimientos.set(false);
    this.nacimientoActual.set(1);
    this.error.set(null);
  }

  incrementarTotalNacimientos(): void {
    if (this.totalNacimientos() < 10) {
      this.totalNacimientos.set(this.totalNacimientos() + 1);
    }
  }

  decrementarTotalNacimientos(): void {
    if (this.totalNacimientos() > 1) {
      this.totalNacimientos.set(this.totalNacimientos() - 1);
    }
  }

  onPesoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const limpio = this.limpiarPeso(input.value);
    if (limpio !== input.value) {
      this.form.get('datos_extra.peso_nacimiento')?.setValue(limpio, { emitEvent: false });
    }
  }

  toggleSection(i: number): void {
    this.sectionActiva.set(this.sectionActiva() === i ? -1 : i);
  }

  goSection(i: number): void {
    document.getElementById('sec-' + i)?.scrollIntoView({ behavior: 'smooth' });
    this.sectionActiva.set(i);
  }

  verMadre(): void {
    this.router.navigate(['/detallePaciente', this.pacienteId]);
  }

  setSexo(valor: string): void {
    this.form.get('sexo')?.setValue(valor);
  }

  setEstado(valor: string): void {
    this.form.get('estado')?.setValue(valor);
  }

  setTipoParto(valor: string): void {
    this.form.get('datos_extra.tipo_parto')?.setValue(valor);
    this.manejarTipoPartoMultiple();
  }

  setClaseParto(valor: string): void {
    this.form.get('datos_extra.clase_parto')?.setValue(valor);
  }

  setExtrahospitalario(valor: string): void {
    this.form.get('datos_extra.extrahospitalario')?.setValue(valor);
  }

  private buildChildItem(): HijodeItem {
    const raw = this.form.getRawValue();

    let hora = raw.datos_extra.hora_nacimiento;
    if (hora && hora.length === 5) {
      hora = hora + ':00.000Z';
    }

    return {
      sexo: raw.sexo,
      datos_extra: {
        peso_nacimiento: raw.datos_extra.peso_nacimiento || undefined,
        edad_gestacional: raw.datos_extra.edad_gestacional || undefined,
        tipo_parto: raw.datos_extra.tipo_parto || undefined,
        clase_parto: raw.datos_extra.clase_parto || undefined,
        extrahositalario: raw.datos_extra.extrahospitalario === 'si',
        hora_nacimiento: hora || undefined,
        id_medico: raw.datos_extra.id_medico ?? undefined,
      }
    };
  }

  guardar(): void {
    if (!this.pacienteId) {
      this.error.set('❌ No se ha especificado el ID de la madre.');
      return;
    }

    if (!this.form.get('sexo')?.value || !this.form.get('fecha_nacimiento')?.value) {
      this.error.set('❌ Debes completar al menos el sexo y la fecha de nacimiento.');
      return;
    }

    if (this.form.get('datos_extra.tipo_parto')?.value === 'Multiple') {
      if (!this.form.get('datos_extra.clase_parto')?.value) {
        this.error.set('❌ Debes seleccionar la clase de parto (Eutócico/Distócico)');
        return;
      }
    }

    this.pasosCompletados[0] = true;
    this.pasosCompletados[1] = true;

    const childItem = this.buildChildItem();
    this.children.push(childItem);

    const esUltimo = this.nacimientoActual() === this.totalNacimientos();

    if (esUltimo) {
      const raw = this.form.getRawValue();
      const hijos = this.form.get('datos_extra.tipo_parto')?.value !== 'Multiple'
        ? this.children.slice(-1)
        : this.children;
      const payload: Hijode = {
        fecha_nacimiento: raw.fecha_nacimiento,
        estado: raw.estado,
        hijos,
      };

      this.isLoading.set(true);
      this.error.set(null);

      this.api.hijoDe(payload, this.pacienteId)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isLoading.set(false)),
          catchError(err => {
            this.error.set(`❌ Error: ${err?.error?.detail || err?.message || 'Error desconocido'}`);
            return of(null);
          })
        )
        .subscribe(response => {
          if (response) {
            this.success.set(`✅ Se han registrado exitosamente ${response.total} nacimiento(s)`);
            setTimeout(() => this.router.navigate(['/pacientes']), 2000);
          }
          this.cdr.markForCheck();
        });
    } else {
      this.success.set(`✅ Nacimiento ${this.nacimientoActual()} registrado correctamente`);
      this.nacimientoActual.set(this.nacimientoActual() + 1);
      this.limpiarFormularioParaSiguiente();

      setTimeout(() => {
        this.success.set(null);
        document.getElementById('sec-0')?.scrollIntoView({ behavior: 'smooth' });
      }, 1500);
      this.cdr.markForCheck();
    }
  }

  private limpiarFormularioParaSiguiente(): void {
    const raw = this.form.getRawValue();
    this.form.patchValue({
      sexo: '',
      datos_extra: {
        peso_nacimiento: '',
        edad_gestacional: raw.datos_extra.edad_gestacional,
        tipo_parto: raw.datos_extra.tipo_parto,
        clase_parto: raw.datos_extra.clase_parto,
        extrahospitalario: raw.datos_extra.extrahospitalario,
        hora_nacimiento: '',
        id_medico: null,
      }
    });
  }

  volver(): void {
    if (this.children.length > 0) {
      const confirm = window.confirm(
        `Ya has registrado ${this.children.length} nacimiento(s). ¿Deseas descartar y volver?`
      );
      if (!confirm) return;
    }
    this.router.navigate(['/pacientes']);
  }
}
