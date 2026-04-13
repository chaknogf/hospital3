import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject, of } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { ApiService } from '../../../service/api.service';
import { saveIcon, cancelIcon } from '../../../shared/icons/svg-icon';
import { SoloNumeroDirective } from '../../../directives/soloNumero.directive';

@Component({
  selector: 'app-hijos',
  templateUrl: './hijos.component.html',
  styleUrls: ['./hijos.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SoloNumeroDirective,
  ]
})
export class HijosComponent implements OnInit, OnDestroy {

  pacienteId!: number;

  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);

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

  // ✅ TIPO DE PARTO: Simple, Gemelar, Múltiple
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
  nacimientosRegistrados: any[] = [];

  private destroy$ = new Subject<void>();

  // ======= CICLO DE VIDA =======
  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.pacienteId = params['id'];
        console.log('Paciente ID recibido:', this.pacienteId);
      });

    this.form = this.crearFormulario();

    this.saveIcon = this.sanitizer.bypassSecurityTrustHtml(saveIcon);
    this.cancelIcon = this.sanitizer.bypassSecurityTrustHtml(cancelIcon);
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
        peso_nacimiento: [''],
        edad_gestacional: [''],
        tipo_parto: [''],          // Simple, Gemelar, Múltiple
        clase_parto: [''],         // Eutocico, Distocico
        gemelo: [''],
        extrahositalario: [false],
        hora_nacimiento: [''],
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

    if (tipoParto === 'Múltiple') {
      this.mostrarSelectorNacimientos.set(true);
      this.nacimientoActual.set(1);
      this.nacimientosRegistrados = [];
    } else {
      this.mostrarSelectorNacimientos.set(false);
      this.totalNacimientos.set(1);
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

    // Auto-llenar el campo gemelo con el número de nacimiento
    this.form.get('datos_extra.gemelo')?.setValue(this.nacimientoActual().toString());

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

  setExtrahospitalario(valor: boolean): void {
    this.form.get('datos_extra.extrahositalario')?.setValue(valor);
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
    if (this.form.get('datos_extra.tipo_parto')?.value === 'Múltiple') {
      if (!this.form.get('datos_extra.clase_parto')?.value) {
        this.error.set('❌ Debes seleccionar la clase de parto (Eutócico/Distócico)');
        return;
      }
    }

    console.log('Formulario raw value:', this.form.getRawValue());

    const raw = this.form.getRawValue();

    // Convertir hora: "18:46" → "18:46:00.000Z"
    let hora = raw.datos_extra.hora_nacimiento;
    if (hora && hora.length === 5) {
      hora = hora + ':00.000Z';
    }

    const payload = {
      sexo: raw.sexo,
      fecha_nacimiento: raw.fecha_nacimiento,
      estado: raw.estado,
      datos_extra: {
        peso_nacimiento: raw.datos_extra.peso_nacimiento || undefined,
        edad_gestacional: raw.datos_extra.edad_gestacional || undefined,
        tipo_parto: raw.datos_extra.tipo_parto || undefined,
        clase_parto: raw.datos_extra.clase_parto || undefined,
        gemelo: raw.datos_extra.gemelo || undefined,
        extrahositalario: raw.datos_extra.extrahositalario || false,
        hora_nacimiento: hora || undefined,
      }
    };

    console.log(`Guardando nacimiento ${this.nacimientoActual()}/${this.totalNacimientos()}:`, payload);
    this.isLoading.set(true);
    this.error.set(null);

    this.api.hijode(payload, this.pacienteId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          this.error.set(`❌ Error: ${err?.error?.detail || err?.message || 'Error desconocido'}`);
          console.error('Error guardando hijo:', err);
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          // Guardar en el registro temporal
          this.nacimientosRegistrados.push({
            numero: this.nacimientoActual(),
            datos: payload
          });

          const esUltimo = this.nacimientoActual() === this.totalNacimientos();

          if (esUltimo) {
            // Último nacimiento - volver a pacientes
            this.success.set(`✅ Se han registrado exitosamente ${this.totalNacimientos()} nacimientos`);
            console.log('Todos los nacimientos registrados:', this.nacimientosRegistrados);

            setTimeout(() => {
              this.router.navigate(['/pacientes']);
            }, 2000);
          } else {
            // Hay más nacimientos - limpiar form y pasar al siguiente
            this.success.set(`✅ Nacimiento ${this.nacimientoActual()} registrado correctamente`);

            // Incrementar contador
            this.nacimientoActual.set(this.nacimientoActual() + 1);

            // Limpiar formulario pero mantener algunos datos
            this.limpiarFormularioParaSiguiente();

            setTimeout(() => {
              this.success.set(null);
              // Scroll al inicio del form
              document.getElementById('sec-0')?.scrollIntoView({ behavior: 'smooth' });
            }, 1500);
          }
        }
      });
  }

  /**
   * Limpia el formulario pero mantiene datos que probablemente son iguales
   */
  private limpiarFormularioParaSiguiente(): void {
    const raw = this.form.getRawValue();

    // Resetear solo los campos específicos del niño
    this.form.patchValue({
      sexo: '', // El siguiente puede tener sexo diferente
      fecha_nacimiento: raw.fecha_nacimiento, // Mantener la fecha (probablemente la misma)
      estado: 'V',
      datos_extra: {
        peso_nacimiento: '',
        edad_gestacional: raw.datos_extra.edad_gestacional, // Mantener
        tipo_parto: raw.datos_extra.tipo_parto, // Mantener
        clase_parto: raw.datos_extra.clase_parto, // Mantener
        gemelo: this.nacimientoActual().toString(), // Auto-llenar con el siguiente número
        extrahositalario: raw.datos_extra.extrahositalario, // Mantener
        hora_nacimiento: '', // Puede variar
      }
    });
  }

  // ======= NAVEGACIÓN =======
  volver(): void {
    if (this.nacimientosRegistrados.length > 0) {
      const confirm = window.confirm(
        `Ya has registrado ${this.nacimientosRegistrados.length} nacimiento(s). ¿Deseas descartar y volver?`
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
