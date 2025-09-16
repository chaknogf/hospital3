import { municipios } from './../../../enum/departamentos';
// formulario-paciente.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, AbstractControl, Validators, ValidatorFn, ValidationErrors, FormControl, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { combineLatest } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { Paciente, Metadata, Municipio, PaisesIso } from '../../../interface/interfaces';
import { comunidadChimaltenango, Keys } from '../../../interface/comunidadChimaltenango';
import { Enumeradores } from '../../../interface/enumsIterfaces';
import { estadoCivil } from './../../../enum/estados_civil';
import { gradoAcademicos } from '../../../enum/gradoAcademico';
import { idiomas } from '../../../enum/idiomas';
import { pueblos } from '../../../enum/pueblos';
import { parentescos } from '../../../enum/parentescos';
import { departamentos } from './../../../enum/departamentos';
import { dpiValidator } from '../../../validators/dpi.validator';
import { UnaPalabraDirective } from '../../../directives/unaPalabra.directive';
import { SoloNumeroDirective } from '../../../directives/soloNumero.directive';
import { provideNgxMask, NgxMaskDirective } from 'ngx-mask';
import { ApiService } from '../../../service/api.service';
import { PacienteUtilService } from '../../../service/paciente-util.service';

import { addIcon, removeIcon, saveIcon, cancelIcon, findIcon } from './../../../shared/icons/svg-icon';

@Component({
  selector: 'app-formularioPaciente',
  templateUrl: './formularioPaciente.component.html',
  styleUrls: ['./formularioPaciente.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    UnaPalabraDirective,
    SoloNumeroDirective,
    NgxMaskDirective,

  ],
  providers: [
    provideNgxMask()
  ]
})
export class FormularioPacienteComponent implements OnInit {
  options: { nombre: string; descripcion: string; ruta: string; icon?: SafeResourceUrl }[] = [];
  public enEdicion = false;
  public edadPaciente: boolean = false;
  public usuarioActual = '';
  edadAnios = 0;
  edadMeses = 0;
  edadDias = 0;
  esGemelo = false;
  mosatrarInputNacimiento = false;
  public esRecienNacido: boolean = false;
  form: FormGroup;
  private actualizandoFecha = false;
  private actualizandoEdad = false;
  public municipios_direccion: Municipio[] = [];
  public municipios_nacimiento: Municipio[] = [];
  public comunidades: Keys[] = [];
  public paisesIso: PaisesIso[] = [];
  public todasLasComunidades = comunidadChimaltenango;
  direccionInput: string = '';
  estudianteControl!: FormControl;
  empleadoControl!: FormControl;



  enums: Enumeradores = {
    estadocivil: estadoCivil,
    gradoacademico: gradoAcademicos,
    idiomas: idiomas,
    parentescos: parentescos,
    pueblos: pueblos,
    departamentos: departamentos,
    municipios: municipios
  };

  // svg
  addIcon!: SafeHtml;
  removeIcon!: SafeHtml;
  saveIcon!: SafeHtml;
  cancelIcon!: SafeHtml;
  findIcon!: SafeHtml;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly api: ApiService,
    private readonly fb: FormBuilder,
    private readonly sanitizer: DomSanitizer,
    private readonly pacienteUtil: PacienteUtilService

  ) {
    this.form = this.fb.group({
      id: [0],
      unidad: [287],
      cui: ['', [dpiValidator()]],
      expediente: [''],
      pasaporte: [''],
      otro: [''],
      nombre: this.fb.group({
        primer_nombre: [''],
        segundo_nombre: [''],
        otro_nombre: [''],
        primer_apellido: [''],
        segundo_apellido: [''],
        apellido_casada: ['']
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
        localidad: ['']
      }),
      referencias: this.fb.array([
        this.fb.group({
          nombre: [''],
          telefono: [''],
          parentesco: ['']
        })
      ]),
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
          valor: ['24']
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
        }),
        r11: this.fb.group({
          tipo: ['municipio_nacimiento'],
          valor: ['']
        }),
        r12: this.fb.group({
          tipo: ['departamento_nacimiento'],
          valor: ['']
        }),
        r13: this.fb.group({
          tipo: ['lugar_nacimiento'],
          valor: ['']
        }),
        r14: this.fb.group({
          tipo: ['estudiante_publico'],
          valor: ['N']
        }),
        r15: this.fb.group({
          tipo: ['empleado_publico'],
          valor: ['N']
        }),
        r16: this.fb.group({
          tipo: ['discapacidad'],
          valor: ['N']
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

    // svg icon initialization after sanitizer is available
    this.addIcon = this.sanitizer.bypassSecurityTrustHtml(addIcon);
    this.removeIcon = this.sanitizer.bypassSecurityTrustHtml(removeIcon);
    this.saveIcon = this.sanitizer.bypassSecurityTrustHtml(saveIcon);
    this.cancelIcon = this.sanitizer.bypassSecurityTrustHtml(cancelIcon);
    this.findIcon = this.sanitizer.bypassSecurityTrustHtml(findIcon);
  }

  ngOnInit(): void {
    this.usuarioActual = localStorage.getItem('username') || '';
    this.form.setValidators(this.validarEdadYFecha());
    this.suscribirUltimos4Cui();
    this.form.get('contacto.direccion')?.disable();
    this.form.get('expediente')?.disable();
    this.lugarNacimiento();
    this.obtenerMunicipios('');
    this.obtenerPaisesIso();
    this.listarMunicipiosDireccion();
    // this.estudianteControl = this.form.get('datos_extra.14.valor') as FormControl;
    // this.empleadoControl = this.form.get('datos_extra.15.valor') as FormControl;

    // Si vienen datos desde RENAP
    const pacienteRenap = history.state.paciente;
    if (pacienteRenap) {
      const pacienteSeguro = {
        ...pacienteRenap,
        CUI: pacienteRenap.CUI ? String(pacienteRenap.CUI) : '',

      };
      this.form.patchValue(this.pacienteUtil.normalizarPaciente(pacienteSeguro));

      if (pacienteRenap.fecha_nacimiento) {
        const edad = this.pacienteUtil.calcularEdad(pacienteRenap.fecha_nacimiento);
        const rn = this.pacienteUtil.validarRecienNacido(pacienteRenap.fecha_nacimiento)
        this.form.get('edad')?.patchValue(edad);
        this.esRecienNacido = rn.recienNacido;
      }
    }

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      if (!isNaN(id)) {
        this.api.getPaciente(id)
          .then(data => {
            // console.log('✅ Paciente obtenido:', data);
            this.enEdicion = true;

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

            // Patch sin disparar valueChanges de inmediato
            this.form.patchValue(this.pacienteUtil.normalizarPaciente(data), { emitEvent: false });

            // Llenar combos dependientes
            setTimeout(() => {
              this.listarMunicipiosNacimiento();
              this.listarMunicipiosDireccion();
            }, 0);
          })
          .catch(error => this.mostrarError('obtener paciente', error));

        // Escuchar cambios en CUI → calcular nacimiento
        this.form.get('cui')?.valueChanges
          .pipe(debounceTime(500))
          .subscribe(() => this.lugarNacimiento());

        // Escuchar cambios en contacto.departamento → actualizar municipios dirección
        this.form.get('contacto.departamento')?.valueChanges.subscribe(() => {
          this.listarMunicipiosDireccion();
        });
      }
    }

    // Suscripciones reactivas edad/fecha
    combineLatest([
      this.form.get(['edad', 'anios'])!.valueChanges,
      this.form.get(['edad', 'meses'])!.valueChanges,
      this.form.get(['edad', 'dias'])!.valueChanges
    ]).subscribe(() => {
      if (!this.actualizandoEdad) {
        const edad = this.form.get('edad')?.value;
        const fecha = this.pacienteUtil.calcularFechaDesdeEdad(edad);
        this.form.get('fecha_nacimiento')?.setValue(fecha, { emitEvent: false });
      }
    });

    this.form.get('fecha_nacimiento')?.valueChanges.subscribe(fechaStr => {
      if (!this.actualizandoFecha && fechaStr) {
        this.calcularEdad(); // 👈 ahora sí pasa por validarRecienNacido()
      }
    });
  }

  volver(): void {
    this.router.navigate(['/pacientes']);
  }

  get referencias(): FormArray {
    return this.form.get('referencias') as FormArray;
  }

  agregarReferencia(): void {
    this.referencias.push(this.fb.group({
      nombre: [''],
      telefono: [''],
      parentesco: ['']
    }));
  }

  eliminarReferencia(i: number): void {
    this.referencias.removeAt(i);
  }

  get metadatos(): FormArray {
    return this.form.get('metadatos') as FormArray;
  }

  agregarMetadato(usuario: string) {
    const timestamp = new Date().toISOString();
    this.metadatos.push(this.fb.group({ usuario: [usuario], registro: [timestamp] }));
  }
  guardar(): void {
    const paciente: Paciente = this.form.getRawValue();
    let normalizado = this.pacienteUtil.normalizarPaciente(paciente);

    // 🔹 Convertir FormArray en objeto { r0, r1, r2... }
    const referenciasArray = this.referencias.value;
    const referenciasObj = referenciasArray.reduce((acc: any, ref: any, i: number) => {
      acc[`r${i}`] = ref;
      return acc;
    }, {});

    // Sobrescribir en el normalizado
    normalizado.referencias = referenciasObj;

    // 🔹 Agregar metadato
    normalizado.metadatos = this.pacienteUtil.agregarMetadato(
      normalizado.metadatos,
      this.usuarioActual
    );

    // 🔹 Guardar (crear o actualizar)
    this.enEdicion ? this.actualizar(normalizado) : this.crear(normalizado);

    this.router.navigate(['/pacientes']);
  }
  async crear(paciente: Paciente): Promise<any> {
    try {
      const correlativo = await this.api.corExpediente();
      paciente.expediente = correlativo;
      const response = await this.api.createPaciente(paciente);
      // console.log('✅ Paciente creado correctamente:', response.data);
      return response.data;
    } catch (error) {
      this.mostrarError('crear paciente', error);
      throw error;
    }
  }

  async actualizar(paciente: Paciente): Promise<void> {
    try {
      await this.api.updatePaciente(paciente.id, paciente);
      // console.log('👤 Paciente actualizado correctamente');
      this.volver();
    } catch (error) {
      this.mostrarError('actualizar paciente', error);
    }
  }

  obtenerPaisesIso(): void {
    this.api.getPaisesIso()
      .then((paises) => this.paisesIso = paises)
      .catch(error => this.mostrarError('obtener paises', error));
  }


  listarMunicipiosNacimiento(): void {
    try {
      const depto = this.form.get('datos_extra.r12.valor')?.value;
      // console.log('depto', depto);
      if (!depto) {
        this.municipios_nacimiento = [];
        return;
      }

      this.municipios_nacimiento = this.enums.municipios.filter(
        m => m.codigo.slice(0, 2) === depto
      );
      // console.log('municipios_nacimiento', this.municipios_nacimiento);
    } catch (error) {
      this.mostrarError('obtener municipios', error);
      this.municipios_nacimiento = [];
    }
  }

  listarMunicipiosDireccion(): void {
    try {
      const depto = this.form.get('contacto.departamento')?.value;
      if (!depto) {
        this.municipios_direccion = [];
        return;
      }

      // Comparar solo los primeros 2 dígitos del código de municipio
      this.municipios_direccion = this.enums.municipios.filter(
        m => m.codigo.slice(0, 2) === depto
      );
    } catch (error) {
      this.mostrarError('obtener municipios', error);
      this.municipios_direccion = [];
    }
  }



  async obtenerMunicipios(codigo?: any, depto?: any, muni?: any): Promise<any[]> {
    try {
      return await this.api.getMunicipios({ limit: 25, departamento: depto, municipio: muni, codigo });
    } catch (error) {
      this.mostrarError('obtener municipios', error);
      return [];
    }
  }

  private suscribirUltimos4Cui(): void {
    this.form.get('cui')?.valueChanges.subscribe((cui) => {
      // Convertir a string seguro
      const cuiStr = cui ? String(cui) : '';
      const ultimos4 = cuiStr.slice(-4);

      const datosExtra = this.form.get('datos_extra') as FormGroup;
      if (datosExtra.get('r11')) {
        datosExtra.get('r11.valor')?.setValue(ultimos4, { emitEvent: false });
      }
    });
  }


  onPasteCUI(event: ClipboardEvent) {
    event.preventDefault();
    const paste = event.clipboardData?.getData('text') || '';
    const input = event.target as HTMLInputElement;

    // filtrar solo números y limitar a 13
    const numbers = paste.replace(/\D/g, '').slice(0, 13);

    // actualizar el input y el formControl
    input.value = numbers.replace(/(\d{4})(\d{0,5})(\d{0,4})/, (_, p1, p2, p3) => {
      return [p1, p2, p3].filter(Boolean).join(' ');
    });
    this.form.get('cui')?.setValue(numbers, { emitEvent: false });
    this.lugarNacimiento();
    // console.log("copiado correctamente");
  }

  validarEdadYFecha(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const edad = group.get('edad');
      const fecha = group.get('fecha_nacimiento')?.value;
      if (!edad || !fecha) return null;
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
    console.error(`Error al ${accion}:`, error);
    alert(`Error al ${accion}. Consulte la consola para más detalles.`);
  }

  irRenap() {
    this.router.navigate(['/renap']);
  }

  calcularFecha(): void {
    const edad = this.form.get('edad')?.value;
    const fecha = this.pacienteUtil.calcularFechaDesdeEdad(edad);
    this.form.get('fecha_nacimiento')?.setValue(fecha);

  }

  calcularEdad(): void {
    const fechaNacimiento = this.form.get('fecha_nacimiento')?.value;
    const edad = this.pacienteUtil.calcularEdad(fechaNacimiento);
    this.form.get('edad')?.patchValue(edad, { emitEvent: false });
    const rn = this.pacienteUtil.validarRecienNacido(fechaNacimiento)

    this.esRecienNacido = rn.recienNacido;
    // console.log('esRecienNacido', this.esRecienNacido);
  }

  async lugarNacimiento(): Promise<void> {
    try {
      if (this.form.get('cui')?.value) {
        const cui = String(this.form.get('cui')?.value);
        this.form.get('datos_extra.r0.valor')?.setValue('GTM');

        const codDepto = cui.slice(9, 11); // antepenultimos 2 dígitos (departamento)
        const codMuni = cui.slice(-4);  // últimos 4 dígitos (municipio completo)
        // console.log('depto:', codDepto, 'muni:', codMuni);

        // Buscar departamento
        const depto = this.enums.departamentos.find(d => d.value === codDepto);
        // console.log('depto label:', depto?.label);

        // Cargar municipios del departamento
        this.municipios_nacimiento = this.enums.municipios.filter(m => m.departamento === depto?.label);

        // Buscar municipio en la lista real
        const muni = this.municipios_nacimiento.find(m => m.codigo.endsWith(codMuni));

        this.form.get('datos_extra.r12.valor')?.setValue(depto?.value || '');
        this.form.get('datos_extra.r11.valor')?.setValue(muni?.codigo || '');

        // Actualizar el departamento
        this.form.get('datos_extra.r12.valor')?.setValue(codDepto);

        // console.log('formMuni:', this.form.get('datos_extra.r11.valor')?.value);
        // console.log('formDepto:', this.form.get('datos_extra.r12.valor')?.value);
      }
    }
    catch (error) {
      this.mostrarError('procesar lugar de nacimiento', error);
    }


  }



  verificarEdad(): void {
    const edad = this.form.get('edad')?.value || {};
    const anios = Number(edad.anios) || 0;
    const meses = Number(edad.meses) || 0;
    const dias = Number(edad.dias) || 0;

    this.esRecienNacido = anios === 0 && meses === 0 && dias >= 0 && dias <= 28;
    // console.log('esRecienNacido:', this.esRecienNacido);
  }

}
