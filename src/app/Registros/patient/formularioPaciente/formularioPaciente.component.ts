import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { addIcon, removeIcon, saveIcon, cancelIcon } from './../../../shared/icons/svg-icon';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, AbstractControl, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../service/api.service';
import { DpiValidadorDirective } from '../../../directives/dpi-validador.directive';
import { UnaPalabraDirective } from '../../../directives/unaPalabra.directive';
import { Paciente, Metadata, Municipio } from '../../../interface/interfaces';
import { comunidadChimaltenango, Keys } from '../../../interface/comunidadChimaltenango';
import { validarCui } from '../../../validators/dpi.validator';
import { SoloNumeroDirective } from '../../../directives/soloNumero.directive';
import { combineLatest } from 'rxjs';

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
    UnaPalabraDirective,
    SoloNumeroDirective
  ]
})
export class FormularioPacienteComponent implements OnInit {
  options: { nombre: string; descripcion: string; ruta: string; icon?: SafeResourceUrl }[] = [];
  public enEdicion = false;
  public usuarioActual = '';
  edadAnios = 0;
  edadMeses = 0;
  edadDias = 0;
  esGemelo = false;
  mosatrarInputNacimiento = false;
  form: FormGroup;
  private actualizandoFecha = false;
  private actualizandoEdad = false;
  public municipios: Municipio[] = [];
  public comunidades: Keys[] = [];
  public todasLasComunidades = comunidadChimaltenango;
  direccionInput: string = '';

  private sanitizarSvg(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  // svg
  addIcon: SafeHtml = addIcon;
  removeIcon: SafeHtml = removeIcon;
  saveIcon: SafeHtml = saveIcon;
  cancelIcon: SafeHtml = saveIcon;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly api: ApiService,
    private readonly fb: FormBuilder,
    private sanitizer: DomSanitizer,

  ) {
    this.addIcon = this.sanitizarSvg(addIcon);
    this.removeIcon = this.sanitizarSvg(removeIcon);
    this.saveIcon = this.sanitizarSvg(saveIcon);
    this.cancelIcon = this.sanitizarSvg(cancelIcon);

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
      sexo: [''],
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
        departamento: [''],
        municipio: [''],
        direccion: [''],
        direccionInput: ['']
      }),
      referencias: this.fb.group({
        referencia1: this.fb.group({
          nombre: [''],
          telefono: [''],
          parentesco: ['']
        })
      }),
      identificadores: this.fb.group({
        cui: ['', [validarCui()]],
        expediente: [''],
        pasaporte: [''],
        otro: ['']
      }),
      datos_extra: this.fb.group({
        r0: this.fb.group({
          tipo: ['nacionalidad'],
          valor: ['GTM']
        }),
        r1: this.fb.group({
          tipo: ['estado_civil'],
          valor: ['']
        }),
        r2: this.fb.group({
          tipo: ['pueblo'],
          valor: ['']
        }),
        r3: this.fb.group({
          tipo: ['idioma'],
          valor: ['español']
        }),
        r4: this.fb.group({
          tipo: ['ocupacion'],
          valor: ['']
        }),
        r5: this.fb.group({
          tipo: ['nivel_educativo'],
          valor: ['']
        }),
        r6: this.fb.group({
          tipo: ['peso_nacimiento'],
          valor: ['', [Validators.required, Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$/)]]
        }),
        r7: this.fb.group({
          tipo: ['edad_gestacional'],
          valor: ['', [Validators.required, Validators.min(20), Validators.max(44), Validators.pattern(/^\d+(\.\d{1,2})?$/)]]
        }),
        r8: this.fb.group({
          tipo: ['parto'],
          valor: ['']
        }),
        r9: this.fb.group({
          tipo: ['gemelo'],
          valor: ['', [Validators.required, Validators.min(1), Validators.max(5), Validators.pattern(/^\d+(\.\d{1,2})?$/)]]
        }),
        r10: this.fb.group({
          tipo: ['expediente_madre'],
          valor: ['']
        })
      }),
      estado: ['V'],
      metadatos: this.fb.group({
        r0: this.fb.group({
          usuario: [''],
          registro: [''],
        })
      })
    });
  }

  ngOnInit(): void {
    this.usuarioActual = localStorage.getItem('username') || '';
    this.form.setValidators(this.validarEdadYFecha());
    this.obtenerMunicipios('');
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      if (!isNaN(id)) {
        this.api.getPaciente(id)
          .then(data => {
            this.enEdicion = true;
            console.log('👤 Paciente obtenido correctamente');

            // Cargar referencias (pueden tener claves dinámicas)
            if (data.referencias) {
              const referenciasGroup = this.fb.group({});
              Object.entries(data.referencias).forEach(([key, ref]: [string, any]) => {
                referenciasGroup.addControl(key, this.fb.group({
                  nombre: [ref.nombre || ''],
                  telefono: [ref.telefono || ''],
                  parentesco: [ref.parentesco || '']
                }));
              });
              this.form.setControl('referencias', referenciasGroup);
            }

            // Cargar datos_extra
            if (data.datos_extra) {
              const datosExtraGroup = this.fb.group({});
              Object.entries(data.datos_extra).forEach(([key, dato]: [string, any]) => {
                datosExtraGroup.addControl(key, this.fb.group({
                  tipo: [dato.tipo || ''],
                  valor: [dato.valor || '']
                }));
              });
              this.form.setControl('datos_extra', datosExtraGroup);
            }

            // Cargar metadatos
            if (data.metadatos) {
              const metadatosGroup = this.fb.group({});
              Object.entries(data.metadatos).forEach(([key, meta]: [string, any]) => {
                metadatosGroup.addControl(key, this.fb.group({
                  usuario: [meta.usuario || ''],
                  registro: [meta.registro || '']
                }));
              });
              this.form.setControl('metadatos', metadatosGroup);
            }

            // Cargar el resto del formulario
            const { referencias, datos_extra, metadatos, ...resto } = data;
            this.form.patchValue(resto);

            // Calcular edad si hay fecha
            if (data.fecha_nacimiento) {
              this.form.get('fecha_nacimiento')?.setValue(data.fecha_nacimiento);
              this.calcularEdadDesdeFecha();
            }
          })
          .catch(error => this.mostrarError('obtener paciente', error));
      }



      this.form.valueChanges.subscribe(values => {
        const depto = values.contacto?.departamento;
        this.obtenerMunicipios(depto);
        const municipioCodigo = values.contacto?.municipio;
        const municipio = this.municipios.find(m => m.codigo === municipioCodigo);
        const direccionInput = values.contacto?.direccionInput || '';
        const direccionFinal = `${direccionInput}${municipio?.vecindad ? ', ' + municipio.vecindad : ''}`;
        this.form.get('contacto.direccion')?.setValue(direccionFinal, { emitEvent: false });
      });



    }

    // Suscripciones reactivas para sincronizar edad y fecha
    combineLatest([
      this.form.get(['edad', 'anios'])!.valueChanges,
      this.form.get(['edad', 'meses'])!.valueChanges,
      this.form.get(['edad', 'dias'])!.valueChanges
    ]).subscribe(() => {
      if (!this.actualizandoEdad) this.calcularFechaDesdeEdad();
    });

    this.form.get('fecha_nacimiento')?.valueChanges.subscribe(() => {
      if (!this.actualizandoFecha) this.calcularEdadDesdeFecha();
    });
  }

  volver(): void {
    this.router.navigate(['/pacientes']);
  }

  guardar(): void {
    const timestamp = new Date().toISOString();
    const metadata: Metadata = { usuario: this.usuarioActual, registro: timestamp };

    const metadatosGroup = this.form.get('metadatos') as FormGroup;

    // Obtener la cantidad actual de registros (r0, r1, etc.)
    const total = Object.keys(metadatosGroup.controls).length;
    const nuevaClave = `r${total}`;
    // Agregar el nuevo grupo
    metadatosGroup.addControl(nuevaClave, this.fb.group(metadata));
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

  async crear(paciente: Paciente): Promise<void> {
    try {
      const datos = this.getDatosParaGuardar();
      console.table(datos);
      await this.api.createPaciente(datos); // Usamos await, ya que el método es async
      console.log('👤 Paciente creado correctamente');
      this.volver();
    } catch (error) {
      this.mostrarError('generar expediente', error);
      throw error;
    }
  }
  async actualizar(paciente: Paciente): Promise<void> {
    try {
      const datos = this.getDatosParaGuardar();
      await this.api.updatePaciente(paciente.id, datos);
      console.log('👤 Paciente actualizado correctamente');
      this.volver();
    } catch (error) {
      this.mostrarError('actualizar paciente', error);
      console.table(paciente);
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

    if (this.form.get('edad')?.value.anios === 0 && this.form.get('edad')?.value.meses === 0 && this.form.get('edad')?.value.dias < 28) {
      this.mosatrarInputNacimiento = true;
    }

    this.actualizandoEdad = false;
  }

  validarEdadYFecha(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const edad = group.get('edad');
      const fecha = group.get('fecha_nacimiento')?.value;
      if (!edad || !fecha) return null;

      // Validar que los valores coincidan (puedes usar tu lógica existente aquí)
      // Retorna null si es válido, o un objeto de error si no lo es
      return null;
    };
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


  getDatosParaGuardar(): any {
    const formularioCompleto = this.form.getRawValue();

    // Excluir múltiples campos
    const { edad, direccionInput, departamento, ...datosLimpios } = formularioCompleto;

    return datosLimpios;
  }

  get mostrarDatosNacimiento(): boolean {
    const edad = this.form.get('edad');

    if (
      edad?.get('anios')?.value === 0 &&
      edad?.get('meses')?.value === 0 &&
      edad?.get('dias')?.value < 28
    ) {
      this.mosatrarInputNacimiento = true;
      return true;
    }

    this.mosatrarInputNacimiento = false;
    return false;
  }

  // municipios
  obtenerMunicipios(valor: any): void {
    this.municipios = [];
    this.api.getMunicipios({
      limit: 25,
      departamento: valor
    })

      .then((municipios) => {
        this.municipios = municipios;
        // console.log(valor);
        // console.log('👤 Municipios obtenidos correctamente');
      })
      .catch((error) => {
        console.error('❌ Error al obtener municipios:', error);
        this.mostrarError('obtener municipios', error);
      });
  }

  public departamentos = [
    'Guatemala',
    'El Progreso',
    'Sacatepéquez',
    'Chimaltenango',
    'Escuintla',
    'Santa Rosa',
    'Sololá',
    'Totonicapán',
    'Quetzaltenango',
    'Suchitepéquez',
    'Retalhuleu',
    'San Marcos',
    'Huehuetenango',
    'Baja Verapaz',
    'Alta Verapaz',
    'Petén',
    'Izabal',
    'Zacapa',
    'Chiquimula',
    'Jalapa',
    'Jutiapa'
  ];



}
