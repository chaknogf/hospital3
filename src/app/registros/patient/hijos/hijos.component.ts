import { PacienteService } from '../paciente.service';
import { ApiService } from '../../../service/api.service';

import { Component, OnInit, OnDestroy, signal, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject, of } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { saveIcon, cancelIcon } from '../../../shared/icons/svg-icon';
import { SoloNumeroDirective } from '../../../directives/soloNumero.directive';
import { Hijode, HijodeItem, HijodeDatosExtra, MadreHijoResponse } from '../../../interface/interfaces';
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

  pacienteId!: number;

  private fb = inject(FormBuilder);
  private api = inject(PacienteService);
  private apis = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);

  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  form!: FormGroup;

  saveIcon!: SafeHtml;
  cancelIcon!: SafeHtml;

  sections = [true, true];

  steps = [
    { label: 'BÁSICO', done: false },
    { label: 'PARTO', done: false },
  ];

  // ======= OPCIONES DE FORMULARIO =======

  // Sexo: Masculino o Femenino
  opcionesSexo = [
    { label: '♂ Masculino', valor: 'M' },
    { label: '♀ Femenino', valor: 'F' },
  ];

  // Estado: Vivo o Fallecido
  opcionesEstado = [
    { label: '● Vivo', valor: 'V' },
    { label: '● Fallecido', valor: 'F' },
  ];

  // ✅ TIPO DE PARTO: Simple, Múltiple
  opcionesTipoParto = [
    { label: 'Simple', valor: 'Simple' },
    { label: 'Múltiple', valor: 'Multiple' },
  ];

  // ✅ CLASE DE PARTO: Eutócico, Distócico
  opcionesClaseParto = [
    { label: 'Eutócico (Vaginal)', valor: 'Pes' },
    { label: 'Distócico (Cesárea)', valor: 'Cstp' },
  ];

  // ======= CONTROL DE MÚLTIPLES NACIMIENTOS =======
  totalNacimientos = signal(1);
  nacimientoActual = signal(1);
  mostrarSelectorNacimientos = signal(false);
  children: HijodeItem[] = [];

  // ======= MÉDICOS =======
  medicos: Medico[] = [];

  private destroy$ = new Subject<void>();

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

  // ======= CICLO DE VIDA =======
  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.pacienteId = params['id'];
        console.log('Paciente ID recibido:', this.pacienteId);
        this.cdr.markForCheck();
      });

    this.form = this.crearFormulario();

    this.saveIcon = this.sanitizer.bypassSecurityTrustHtml(saveIcon);
    this.cancelIcon = this.sanitizer.bypassSecurityTrustHtml(cancelIcon);

    this.cargarMedicos();
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
        error: (err) => {
          console.error('Error al cargar médicos:', err);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ======= FORMULARIO =======
  private crearFormulario(): FormGroup {
    return this.fb.group({
      sexo: [''],
      fecha_nacimiento: [''],
      estado: ['V'],

      datos_extra: this.fb.group({
        peso_nacimiento: ['', this.pesoValidator()],
        edad_gestacional: [''],
        tipo_parto: [''],          // Simple, Múltiple
        clase_parto: [''],         // Eutocico, Distocico
        extrahositalario: ['no'],
        hora_nacimiento: [''],
        id_medico: [null],
      }),
    });
  }

  // ======= HELPERS PARA MÚLTIPLES NACIMIENTOS =======

  /**
   * Se llama cuando el usuario selecciona tipo_parto = Múltiple
   * Muestra un dialogo para preguntar cuántos nacimientos hubo
   */
  manejarTipoPartoMultiple(): void {
    const tipoParto = this.form.get('datos_extra.tipo_parto')?.value;

    if (tipoParto === 'Multiple') {
      this.mostrarSelectorNacimientos.set(true);
      this.nacimientoActual.set(1);
      this.children = [];
    } else {
      this.mostrarSelectorNacimientos.set(false);
      this.totalNacimientos.set(1);
      this.nacimientoActual.set(1);
    }
  }

  /**
   * Confirma cuántos nacimientos hay y comienza el registro
   */
  confirmarTotalNacimientos(): void {
    if (this.totalNacimientos() < 2) {
      this.error.set('❌ Debe seleccionar al menos 2 nacimientos para múltiples');
      return;
    }

    this.mostrarSelectorNacimientos.set(false);
    this.nacimientoActual.set(1);

    this.error.set(null);
    console.log(`Total de nacimientos: ${this.totalNacimientos()}, iniciando registro del primero...`);
  }

  /**
   * Incrementa el selector de total de nacimientos
   */
  incrementarTotalNacimientos(): void {
    if (this.totalNacimientos() < 10) {
      this.totalNacimientos.set(this.totalNacimientos() + 1);
    }
  }

  /**
   * Decrementa el selector de total de nacimientos
   */
  decrementarTotalNacimientos(): void {
    if (this.totalNacimientos() > 1) {
      this.totalNacimientos.set(this.totalNacimientos() - 1);
    }
  }

  // ======= HELPERS CHIPS =======
  onPesoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const limpio = this.limpiarPeso(input.value);
    if (limpio !== input.value) {
      this.form.get('datos_extra.peso_nacimiento')?.setValue(limpio, { emitEvent: false });
    }
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
    this.form.get('datos_extra.extrahositalario')?.setValue(valor);
  }

  // ======= CONSTRUIR ITEM POR HIJO =======
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
        extrahositalario: raw.datos_extra.extrahositalario || 'no',
        hora_nacimiento: hora || undefined,
        id_medico: raw.datos_extra.id_medico ?? undefined,
      }
    };
  }

  // ======= GUARDAR =======
  guardar(): void {
    if (!this.pacienteId) {
      this.error.set('❌ No se ha especificado el ID de la madre.');
      return;
    }

    // ✅ Validar que el formulario tenga al menos los datos básicos
    if (!this.form.get('sexo')?.value || !this.form.get('fecha_nacimiento')?.value) {
      this.error.set('❌ Debes completar al menos el sexo y la fecha de nacimiento.');
      return;
    }

    // ✅ Si es múltiple, validar que tiene tipo_parto y clase_parto
    if (this.form.get('datos_extra.tipo_parto')?.value === 'Multiple') {
      if (!this.form.get('datos_extra.clase_parto')?.value) {
        this.error.set('❌ Debes seleccionar la clase de parto (Eutócico/Distócico)');
        return;
      }
    }

    console.log('Formulario raw value:', this.form.getRawValue());

    // Agregar hijo actual a la colección
    const childItem = this.buildChildItem();
    this.children.push(childItem);

    const esUltimo = this.nacimientoActual() === this.totalNacimientos();

    if (esUltimo) {
      // Último nacimiento — enviar batch al backend
      const raw = this.form.getRawValue();
      const payload: Hijode = {
        fecha_nacimiento: raw.fecha_nacimiento,
        estado: raw.estado,
        hijos: this.children,
      };

      console.log(`Enviando lote de ${this.children.length} hijos:`, payload);
      this.isLoading.set(true);
      this.error.set(null);

      this.api.hijoDe(payload, this.pacienteId)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isLoading.set(false)),
          catchError(err => {
            this.error.set(`❌ Error: ${err?.error?.detail || err?.message || 'Error desconocido'}`);
            console.error('Error guardando hijos:', err);
            return of(null);
          })
        )
        .subscribe(response => {
          if (response) {
            this.success.set(`✅ Se han registrado exitosamente ${response.total} nacimiento(s)`);
            console.log('Respuesta del servidor:', response);

            setTimeout(() => {
              this.router.navigate(['/pacientes']);
            }, 2000);
          }
          this.cdr.markForCheck();
        });
    } else {
      // Hay más nacimientos — solo avanzar al siguiente
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

  /**
   * Limpia el formulario pero mantiene datos que probablemente son iguales
   */
  private limpiarFormularioParaSiguiente(): void {
    const raw = this.form.getRawValue();

    this.form.patchValue({
      sexo: '',
      datos_extra: {
        peso_nacimiento: '',
        edad_gestacional: raw.datos_extra.edad_gestacional,
        tipo_parto: raw.datos_extra.tipo_parto,
        clase_parto: raw.datos_extra.clase_parto,
        extrahositalario: raw.datos_extra.extrahositalario,
        hora_nacimiento: '',
        id_medico: null,
      }
    });
  }

  // ======= NAVEGACIÓN =======
  volver(): void {
    if (this.children.length > 0) {
      const confirm = window.confirm(
        `Ya has registrado ${this.children.length} nacimiento(s). ¿Deseas descartar y volver?`
      );
      if (!confirm) return;
    }
    this.router.navigate(['/pacientes']);
  }

  toggleSection(i: number): void {
    this.sections[i] = !this.sections[i];
  }

  goSection(i: number): void {
    document.getElementById('sec-' + i)?.scrollIntoView({ behavior: 'smooth' });
    this.sections[i] = true;
  }
}
