import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, AbstractControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../service/api.service';
import { DpiValidadorDirective } from '../../../directives/dpi-validador.directive';
import { UnaPalabraDirective } from '../../../directives/unaPalabra.directive';
import { Paciente, Metadata, DatosExtra } from '../../../interface/interfaces';

@Component({
  selector: 'app-formularioPaciente',
  templateUrl: './formularioPaciente.component.html',
  styleUrls: ['./formularioPaciente.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DpiValidadorDirective,
    UnaPalabraDirective
  ]
})
export class FormularioPacienteComponent implements OnInit {
  public enEdicion = false;
  public usuarioActual = '';
  edadAnios = 0;
  edadMeses = 0;
  edadDias = 0;
  form: FormGroup;
  private actualizandoFecha = false;
  private actualizandoEdad = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly api: ApiService,
    private readonly fb: FormBuilder
  ) {
    this.form = this.fb.group({
      id: [0],
      unidad: [287],
      nombre: this.fb.group({
        primer: [''],
        segundo: [''],
        otro: [''],
        apellido_primero: [''],
        apellido_segundo: [''],
        casada: ['']
      }),
      sexo: ['V'],
      fecha_nacimiento: [''],
      edad: this.fb.group({
        anios: [0],
        meses: [0],
        dias: [0]
      }),
      contacto: this.fb.group({
        telefono: [''],
        telefono2: [''],
        telefono3: [''],
        municipio: [''],
        direccion: ['']
      }),
      referencias: this.fb.group({
        referencia1: this.fb.group({
          nombre: [''],
          telefono: [''],
          parentesco: ['']
        }),
        referencia2: this.fb.group({
          nombre: [''],
          telefono: [''],
          parentesco: ['']
        }),
        referencia3: this.fb.group({
          nombre: [''],
          telefono: [''],
          parentesco: ['']
        })
      }),
      identificadores: this.fb.group({
        cui: [null],
        expediente: [''],
        pasaporte: [''],
        otro: ['']
      }),
      datos_extra: this.fb.group({
        r0: this.fb.group({
          nacionalidad: ['GTM']
        }),
        r1: this.fb.group({
          estado_civil: [''],
        }),
        r2: this.fb.group({
          pueblo: [''],
        }),
        idioma: [''],
      }),
      r3: this.fb.group({
        ocupacion: [''],
      }),
      r4: this.fb.group({
        nivel_educativo: [''],
      }),
      r5: this.fb.group({
        peso_nacimiento: ['', [Validators.min(0)]],
      }),
      r6: this.fb.group({
        edad_gestacional: ['', [Validators.min(20), Validators.max(44)]],
      }),
      r7: this.fb.group({
        parto: [''],
      }),
      estado: [''],
      metadatos: this.fb.group({})
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      if (!isNaN(id)) {
        this.api.getPaciente(id)
          .then(data => {
            if (data.referencias) {
              this.cargarReferencias(data.referencias);
            }

            const { referencias, datos_extra, ...resto } = data;
            this.form.patchValue(resto);

            if (resto.fecha_nacimiento) {
              this.form.get('fecha_nacimiento')?.setValue(resto.fecha_nacimiento);
              this.calcularEdadDesdeFecha();
            }

            this.enEdicion = true;
            console.log('👤 Paciente obtenido correctamente');
          })
          .catch(error => this.mostrarError('obtener paciente', error));
      }
      ['anios', 'meses', 'dias'].forEach(campo => {
        this.form.get(['edad', campo])?.valueChanges.subscribe(() => {
          if (!this.actualizandoEdad) this.calcularFechaDesdeEdad();
        });
      });

      this.form.get('fecha_nacimiento')?.valueChanges.subscribe(() => {
        if (!this.actualizandoFecha) this.calcularEdadDesdeFecha();
      });
    }

    this.usuarioActual = localStorage.getItem('username') || '';

    // Suscripción reactiva para calcular edad automáticamente
    this.form.get('fecha_nacimiento')?.valueChanges.subscribe(() => {
      this.calcularEdadDesdeFecha();
    });
  }

  volver(): void {
    this.router.navigate(['/pacientes']);
  }

  guardar(): void {
    const timestamp = new Date().toISOString();
    const metadata: Metadata = { usuario: this.usuarioActual, registro: timestamp };

    const metadatosGroup = this.form.get('metadatos') as FormGroup;
    metadatosGroup.addControl(timestamp, this.fb.group(metadata));

    this.tieneExpediente()
      ? this.continuarGuardado()
      : this.confirmarGenerarExpediente();
  }

  tieneExpediente(): boolean {
    return !!this.form.get('identificadores.expediente')?.value;
  }

  continuarGuardado(): void {
    const paciente: Paciente = this.form.value;
    this.enEdicion ? this.actualizar(paciente) : this.crear(paciente);
  }

  crear(paciente: Paciente): void {
    this.api.createPaciente(paciente)
      .then(() => {
        console.log('👤 Paciente creado correctamente');
        this.volver();
      })
      .catch(error => this.mostrarError('crear paciente', error));
  }

  async actualizar(paciente: Paciente): Promise<void> {
    try {
      await this.api.updatePaciente(paciente.id, paciente);
      console.log('👤 Paciente actualizado correctamente');
      this.volver();
    } catch (error) {
      this.mostrarError('actualizar paciente', error);
    }
  }

  async generarExpediente(): Promise<string> {
    try {
      const expediente = await this.api.corExpediente();
      console.log('📄 Correlativo obtenido:', expediente);
      return expediente;
    } catch (error) {
      this.mostrarError('generar expediente', error);
      throw error;
    }
  }

  confirmarGenerarExpediente(): void {
    if (confirm('¿Desea generar un nuevo expediente para este paciente?')) {
      this.generarExpediente().then(expediente => {
        this.form.get('identificadores.expediente')?.setValue(expediente);
        this.continuarGuardado();
      });
    } else {
      this.continuarGuardado();
    }
  }

  calcularFechaDesdeEdad(): void {
    this.actualizandoFecha = true;
    const edad = this.form.get('edad')?.value;
    if (edad) {
      const ahora = new Date();
      const fecha = new Date(ahora.getFullYear() - (edad.anios || 0), ahora.getMonth() - (edad.meses || 0), ahora.getDate() - (edad.dias || 0));
      this.form.get('fecha_nacimiento')?.setValue(fecha.toISOString().substring(0, 10)); // formato YYYY-MM-DD
    }
    this.actualizandoFecha = false;
  }
  calcularEdadDesdeFecha(): void {
    const fechaNacimientoStr = this.form.get('fecha_nacimiento')?.value;
    if (!fechaNacimientoStr) return;
    this.actualizandoEdad = true;

    const hoy = new Date();
    const nacimiento = new Date(fechaNacimientoStr);

    let anios = hoy.getFullYear() - nacimiento.getFullYear();
    let meses = hoy.getMonth() - nacimiento.getMonth();
    let dias = hoy.getDate() - nacimiento.getDate();

    if (dias < 0) {
      meses--;
      const diasEnMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
      dias += diasEnMesAnterior;
    }

    if (meses < 0) {
      anios--;
      meses += 12;
    }

    this.form.get(['edad', 'anios'])?.setValue(anios);
    this.form.get(['edad', 'meses'])?.setValue(meses);
    this.form.get(['edad', 'dias'])?.setValue(dias);

    this.actualizandoEdad = false;
  }

  private inicializarDatosExtra(): FormGroup[] {
    const tipos: DatosExtra['tipo'][] = [
      'nacionalidad', 'estado civil', 'pueblo', 'idioma',
      'ocupación', 'nivel educativo', 'peso nacimiento', 'edad gestacional'
    ];
    return tipos.map(tipo => this.fb.group({ tipo: [tipo], valor: [''] }));
  }

  get sortedMetadatos(): Metadata[] {
    const metadatos = this.form.get('metadatos')?.value || {};
    return (Object.values(metadatos) as Metadata[]).sort((a, b) =>
      new Date(b.registro ?? '').getTime() - new Date(a.registro ?? '').getTime()
    );
  }

  private mostrarError(accion: string, error: any): void {
    console.error(`❌ Error al ${accion}:`, error);
    alert(`Error al ${accion}. Consulte la consola para más detalles.`);
  }

  get referenciasControls(): { [key: string]: AbstractControl } {
    return (this.form.get('referencias') as FormGroup).controls;
  }

  referenciasKeys(): string[] {
    return Object.keys(this.referenciasControls);
  }

  private crearReferencia(): FormGroup {
    return this.fb.group({
      nombre: [''],
      telefono: [''],
      parentesco: ['']
    });
  }

  agregarReferencia(): void {
    const referencias = this.form.get('referencias') as FormGroup;
    const indice = Object.keys(referencias.controls).length;
    const clave = `r${indice}`;
    referencias.addControl(clave, this.crearReferencia());
  }

  eliminarReferencia(clave: string): void {
    const referencias = this.form.get('referencias') as FormGroup;
    referencias.removeControl(clave);
  }

  cargarReferencias(referenciasData: { [key: string]: any }): void {
    const referenciasGroup = this.fb.group({});
    Object.entries(referenciasData).forEach(([clave, valor]) => {
      referenciasGroup.addControl(clave, this.fb.group({
        nombre: [valor.nombre || ''],
        telefono: [valor.telefono || ''],
        parentesco: [valor.parentesco || '']
      }));
    });
    this.form.setControl('referencias', referenciasGroup);
  }
}
