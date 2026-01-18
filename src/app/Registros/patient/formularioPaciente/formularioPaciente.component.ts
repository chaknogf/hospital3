// ======= IMPORTACIONES =======
import { municipios } from '../../../enum/departamentos';
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import {
  FormBuilder, FormGroup, ReactiveFormsModule, FormsModule,
  AbstractControl, ValidatorFn, ValidationErrors,
  FormArray
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { combineLatest, Subject, of } from 'rxjs';
import { debounceTime, takeUntil, catchError, finalize, tap } from 'rxjs/operators';
import { Paciente, Municipio, PaisesIso } from '../../../interface/interfaces';
import { Enumeradores } from '../../../interface/enumsIterfaces';
import {
  estadoCivil, pueblos, idiomas,
  gradoAcademicos
} from '../../../enum/diccionarios';
import { departamentos } from '../../../enum/departamentos';
import { UnaPalabraDirective } from '../../../directives/unaPalabra.directive';
import { SoloNumeroDirective } from '../../../directives/soloNumero.directive';
import { provideNgxMask, NgxMaskDirective } from 'ngx-mask';
import { ApiService } from '../../../service/api.service';
import { PacienteUtilService } from '../../../service/paciente-util.service';
import {
  addIcon, removeIcon, saveIcon, cancelIcon, findIcon,
  touchicon,
  faceidicon
} from '../../../shared/icons/svg-icon';
import { Parentescos } from '../../../enum/parentescos';

// ======= DECORADOR DEL COMPONENTE =======
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
  providers: [provideNgxMask()]
})
export class FormularioPacienteComponent implements OnInit, OnDestroy {
  // ======= INYECCIONES =======
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);
  private pacienteUtil = inject(PacienteUtilService);

  // ======= SEÑALES =======
  enEdicion = signal(false);
  accionExpediente = signal('mantener');
  crearExpediente = signal(false);
  usuarioActual = signal('');
  esRecienNacido = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);
  deptoDireccion = signal<string | null>(null);
  municipios_direccion = signal<Municipio[]>([]);
  municipios_nacimiento = signal<Municipio[]>([]);
  vecindades = signal<Municipio[]>([]);
  paisesIso = signal<PaisesIso[]>([]);

  // Variables temporales para filtrar municipios
  depto_direccion_temp = signal<string>('');
  depto_nacimiento_temp = signal<string>('');

  // ======= PROPIEDADES =======
  form: FormGroup;
  private actualizandoFecha = false;
  private actualizandoEdad = false;
  private destroy$ = new Subject<void>();

  enums: Enumeradores = {
    estadocivil: estadoCivil,
    gradoacademico: gradoAcademicos,
    idiomas: idiomas,
    parentescos: Parentescos,
    pueblos: pueblos,
    departamentos: departamentos,
    municipios: municipios
  };

  // ======= ICONOS SVG =======
  addIcon!: SafeHtml;
  removeIcon!: SafeHtml;
  saveIcon!: SafeHtml;
  cancelIcon!: SafeHtml;
  findIcon!: SafeHtml;
  faceidicon!: SafeHtml;
  touchicon!: SafeHtml;

  // ======= CONSTRUCTOR =======
  constructor() {
    this.form = this.crearFormulario();
    this.inicializarIconos();
  }

  // ======= CICLO DE VIDA =======
  ngOnInit(): void {
    this.usuarioActual.set(localStorage.getItem('username') || '');

    this.configurarFormulario();
    this.configurarSuscripciones();

    this.form.setValidators(this.validarEdadYFecha());

    this.obtenerDatosIniciales();
    this.manejarDatosRenap();

    // 👇 AQUÍ, antes de intentar cargar edición
    this.cargarMetadatos();

    this.cargarPacienteParaEdicion();
    if (!this.enEdicion()) {
      this.agregarReferencia();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ======= MÉTODOS PRINCIPALES =======

  private crearFormulario(): FormGroup {
    const { username } = this.api.getUsuarioActual();
    return this.fb.group({
      id: [0],
      unidad: [287],
      cui: [''],
      expediente: [''],
      pasaporte: [''],

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
        departamento: [''],
        domicilio: [''],
        municipio: [''],
        telefonos: [''],
        email: ['']
      }),

      referencias: this.fb.array([]),

      datos_extra: this.fb.group({
        defuncion: [''],
        personaid: [''],

        demograficos: this.fb.group({
          idioma: ['24'],
          pueblo: [''],
          nacionalidad: ['GTM'],
          departamento_nacimiento: [''],
          lugar_nacimiento: [''],
          vecindad: ['']
        }),

        socioeconomicos: this.fb.group({
          estado_civil: [''],
          ocupacion: [''],
          educacion: [''],
          estudiante_publico: ['N'],
          empleado_publico: ['N'],
          discapacidad: ['N']
        }),

        neonatales: this.fb.group({
          peso_nacimiento: [''],
          edad_gestacional: [''],
          parto: [''],
          gemelo: [''],
          expediente_madre: [''],
          extrahositalario: [false]
        })
      }),

      estado: ['V'],
      metadatos: this.fb.array([
        this.fb.group({
          usuario: [username],
          registro: [new Date().toISOString()],
          accion: ['']
        })
      ])
    });
  }

  // ======= UTILIDADES =======
  private normalizarParentesco(valor: string | null | undefined): string {
    return valor ? valor.toString().trim().toLowerCase() : '';
  }

  private crearReferencia(ref?: any): FormGroup {
    return this.fb.group({
      nombre: [ref?.nombre || ''],
      telefono: [ref?.telefono || ''], // ⛔ AQUÍ
      parentesco: [this.normalizarParentesco(ref?.parentesco)],
      expediente: [ref?.expediente || null],
      idpersona: [ref?.idpersona || null],
      responsable: [ref?.responsable === true]
    });
  }

  private inicializarIconos(): void {
    this.addIcon = this.sanitizer.bypassSecurityTrustHtml(addIcon);
    this.removeIcon = this.sanitizer.bypassSecurityTrustHtml(removeIcon);
    this.saveIcon = this.sanitizer.bypassSecurityTrustHtml(saveIcon);
    this.cancelIcon = this.sanitizer.bypassSecurityTrustHtml(cancelIcon);
    this.findIcon = this.sanitizer.bypassSecurityTrustHtml(findIcon);
    this.faceidicon = this.sanitizer.bypassSecurityTrustHtml(faceidicon);
    this.touchicon = this.sanitizer.bypassSecurityTrustHtml(touchicon);
  }

  // ======= CONFIGURACIÓN INICIAL =======
  private configurarFormulario(): void {
    this.form.get('expediente')?.disable();
    this.suscribirUltimos4Cui();
  }

  private obtenerDatosIniciales(): void {
    this.obtenerPaisesIso();
  }

  private manejarDatosRenap(): void {
    const pacienteRenap = history.state.paciente;
    if (pacienteRenap) {
      const pacienteSeguro = {
        ...pacienteRenap,
        CUI: pacienteRenap.CUI ? String(pacienteRenap.CUI) : '',
      };
      this.form.patchValue(this.pacienteUtil.normalizarPaciente(pacienteSeguro));

      if (pacienteRenap.fecha_nacimiento) {
        const edad = this.pacienteUtil.calcularEdad(pacienteRenap.fecha_nacimiento);
        const rn = this.pacienteUtil.esRecienNacido(pacienteRenap.fecha_nacimiento);
        this.form.get('edad')?.patchValue(edad);
        this.esRecienNacido.set(rn);
      }
    }

    const modo = this.route.snapshot.paramMap.get('modo');
    this.crearExpediente.set(!!modo);
  }

  // ======= CARGAR PACIENTE PARA EDICIÓN =======
  private cargarPacienteParaEdicion(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) return;

    const id = Number(idParam);
    if (isNaN(id) || id <= 0) {
      this.error.set('ID de paciente inválido');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.api.getPaciente(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
        catchError(error => {
          console.error('❌ Error al cargar paciente:', error);
          this.error.set('Error al obtener el paciente');
          this.mostrarError('obtener paciente', error);
          return of(null);
        })
      )
      .subscribe(data => {
        if (!data) return;

        try {
          this.enEdicion.set(true);

          // Convertir formato backend → form
          const pacienteParaForm = this.pacienteUtil.convertirPacienteDesdeBackend(data);
          const referenciasForm = this.pacienteUtil.convertirReferenciasDesdeBackend(
            data.referencias
          );

          // Cargar metadatos y referencias
          this.cargarMetadatos();
          this.cargarReferencias(data.referencias || []);

          // Patch del formulario
          this.form.patchValue(pacienteParaForm, { emitEvent: false });



          const deptoNac = data?.datos_extra?.demograficos?.departamento_nacimiento;
          const lugarNac = data?.datos_extra?.demograficos?.lugar_nacimiento;

          if (deptoNac) {
            // 1️⃣ Setear departamento
            this.form
              .get('datos_extra.demograficos.departamento_nacimiento')
              ?.setValue(deptoNac, { emitEvent: false });

            // 2️⃣ Cargar municipios
            const municipiosFiltrados = this.enums.municipios.filter(m =>
              m.codigo.startsWith(deptoNac)
            );
            this.municipios_nacimiento.set(municipiosFiltrados);

            // 3️⃣ Setear municipio solo después
            if (lugarNac) {
              this.form
                .get('datos_extra.demograficos.lugar_nacimiento')
                ?.setValue(lugarNac, { emitEvent: false });
            }
          }

          const municipio = this.form.get('contacto.municipio')?.value;
          if (municipio) {
            const depto = municipio.slice(0, 2);
            this.form.get('contacto.departamento')?.setValue(depto, { emitEvent: false });
            this.deptoDireccion.set(depto);
            this.listarMunicipiosDireccion();
          }

          // Calcular edad
          if (data.fecha_nacimiento) {
            const edad = this.pacienteUtil.calcularEdad(data.fecha_nacimiento);
            this.form.get('edad')?.patchValue(edad, { emitEvent: false });

            const rn = this.pacienteUtil.esRecienNacido(data.fecha_nacimiento);
            this.esRecienNacido.set(rn);
          }

          // Llenar combos dependientes
          this.listarMunicipiosNacimiento();
          this.listarMunicipiosDireccion();

          this.error.set(null);
        } catch (error: any) {
          console.error(
            '❌ Error procesando paciente.',
            {
              mensaje: error?.message,
              pista: 'Probablemente se intentó iterar con forEach sobre un valor que NO es un array.',
              posiblesCausas: [
                'referencias no es un array',
                'metadatos viene como objeto y no como arreglo',
                'estructura inesperada desde el backend'
              ],
              pacienteId: id,
              dataRecibida: data
            }
          );

          this.error.set(
            'Error al procesar el paciente: la estructura de datos recibida no coincide con lo esperado (array vs objeto). Revise la consola.'
          );
        }
      });
  }

  // ✅ Inicializa metadatos SOLO en modo creación
  private cargarMetadatos(): void {
    if (!this.enEdicion()) {
      this.inicializarMetadatosVacio();
    }
  }

  private inicializarMetadatosVacio(): void {
    const { username } = this.api.getUsuarioActual();
    const array = this.fb.array<FormGroup>([
      this.fb.group({
        usuario: [username],
        registro: [new Date().toISOString()],
        accion: ['']
      })
    ]);
    this.form.setControl('metadatos', array);
  }

  private cargarReferencias(referencias: any[]): void {
    this.referencias.clear();

    if (!Array.isArray(referencias)) {
      this.agregarReferencia();
      return;
    }

    referencias.forEach(ref => {
      this.referencias.push(this.crearReferencia(ref));
    });

    if (this.referencias.length === 0) {
      this.agregarReferencia();
    }
  }

  // ======= SUSCRIPCIONES =======
  private configurarSuscripciones(): void {
    // Edad → Fecha
    combineLatest([
      this.form.get(['edad', 'anios'])!.valueChanges,
      this.form.get(['edad', 'meses'])!.valueChanges,
      this.form.get(['edad', 'dias'])!.valueChanges
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.actualizandoEdad) {
          this.calcularFecha();
        }
      });

    // Fecha → Edad
    this.form.get('fecha_nacimiento')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(fechaStr => {
        if (!this.actualizandoFecha && fechaStr) {
          this.calcularEdad();
        }
      });

    // CUI → Lugar de nacimiento
    this.form.get('cui')?.valueChanges
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(() => this.lugarNacimiento());

    // Departamento de dirección
    this.form.get('contacto.municipio')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((municipio: string) => {
        if (!municipio) {
          this.form.get('contacto.departamento')?.setValue('', { emitEvent: false });
          this.municipios_direccion.set([]);
          return;
        }

        const departamento = municipio.slice(0, 2);
        this.form.get('contacto.departamento')?.setValue(departamento, { emitEvent: false });
        this.deptoDireccion.set(departamento);
        this.listarMunicipiosDireccion();
      });

    this.form.get('contacto.departamento')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((departamento: string) => {

        if (!departamento) {
          this.municipios_direccion.set([]);
          this.form.get('contacto.municipio')?.setValue('', { emitEvent: false });
          return;
        }

        this.deptoDireccion.set(departamento);
        this.form.get('contacto.municipio')?.setValue('', { emitEvent: false });
        this.listarMunicipiosDireccion();
      });

    // Departamento de nacimiento
    this.form.get('datos_extra.demograficos.departamento_nacimiento')?.valueChanges
      .pipe(
        tap((depto: string) => {
          if (depto) {
            this.depto_nacimiento_temp.set(depto);
            this.form.get('datos_extra.demograficos.lugar_nacimiento')?.setValue('', { emitEvent: false });
          } else {
            this.municipios_nacimiento.set([]);
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.listarMunicipiosNacimiento();
      });

    // Lugar de nacimiento
    this.form.get('datos_extra.demograficos.lugar_nacimiento')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((lugarNac) => {
        if (lugarNac) {
          const depto = lugarNac.substring(0, 2);
          this.depto_nacimiento_temp.set(depto);
          this.listarMunicipiosNacimiento();
        }
      });
  }

  // ======= GETTERS =======
  get referencias(): FormArray {
    return this.form.get('referencias') as FormArray;
  }

  get metadatos(): FormArray {
    return this.form.get('metadatos') as FormArray;
  }

  // ======= GUARDADO =======
  guardar(): void {
    if (!this.form.valid) {
      this.error.set('Por favor complete los campos requeridos');
      return;
    }

    // Registrar evento según contexto
    this.agregarEventoMetadato(this.enEdicion() ? 'ACTUALIZADO' : 'CREADO');

    const pacienteForm = this.form.getRawValue();

    // referencias limpias
    pacienteForm.referencias = this.referencias.value?.filter((r: any) => r.nombre?.trim()) || null;

    const pacienteParaBackend = this.pacienteUtil.convertirPacienteParaBackend(pacienteForm);
    // console.log(pacienteParaBackend);

    this.enEdicion()
      ? this.actualizar(pacienteParaBackend)
      : this.crear(pacienteParaBackend);
  }

  private crear(paciente: any): void {
    this.isLoading.set(true);
    const generarExpediente = this.crearExpediente();

    this.api.crearPaciente(paciente, generarExpediente)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
        catchError(error => {
          // console.log(paciente)
          console.error('❌ Error al crear paciente:', error);
          this.error.set('Error al crear el paciente');
          this.mostrarError('crear paciente', error);
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          this.router.navigate(['/pacientes']);
        }
      });
  }

  private actualizar(paciente: any): void {
    this.isLoading.set(true);

    this.api.updatePaciente(paciente.id, paciente, this.accionExpediente())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
        catchError(error => {
          console.error('❌ Error al actualizar paciente:', error);
          this.error.set('Error al actualizar el paciente');
          this.mostrarError('actualizar paciente', error);
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          this.router.navigate(['/pacientes']);
        }
      });
  }

  // ======= REFERENCIAS =======
  agregarReferencia(): void {
    this.referencias.push(this.crearReferencia());
  }

  eliminarReferencia(i: number): void {
    const ref = this.referencias.at(i);

    if (ref.get('idpersona')?.value) {
      ref.disable();
    } else {
      this.referencias.removeAt(i);
    }
  }

  marcarComoResponsable(index: number): void {
    this.referencias.controls.forEach((control, i) => {
      control.get('responsable')?.setValue(i === index);
    });
  }

  // ======= MUNICIPIOS =======
  onDeptoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const depto = select.value;

    this.form.get('contacto.departamento')?.setValue(depto, { emitEvent: false });
    this.form.get('contacto.municipio')?.setValue('', { emitEvent: false });

    if (depto) {
      this.deptoDireccion.set(depto);
    }

    this.listarMunicipiosDireccion();
  }

  listarMunicipiosDireccion(): void {
    const depto = this.form.get('contacto.departamento')?.value;

    if (!depto || depto.trim() === '') {
      this.municipios_direccion.set([]);
      return;
    }

    const filtrados = municipios.filter(m => m.codigo.startsWith(depto));
    this.municipios_direccion.set(filtrados);
  }

  listarVecindades(): void {
    this.vecindades.set(
      [...municipios].sort((a, b) => a.municipio.localeCompare(b.municipio))
    );
  }

  listarMunicipiosNacimiento(): void {
    let depto =
      this.form.get('datos_extra.demograficos.departamento_nacimiento')?.value;

    // 🧠 Si no hay depto pero sí municipio → inferirlo
    if (!depto) {
      const muni = this.form.get('datos_extra.demograficos.lugar_nacimiento')?.value;
      if (muni?.length >= 2) {
        depto = muni.substring(0, 2);
        this.form
          .get('datos_extra.demograficos.departamento_nacimiento')
          ?.setValue(depto, { emitEvent: false });
      }
    }

    if (!depto) {
      this.municipios_nacimiento.set([]);
      return;
    }

    const filtrados = municipios.filter(m => m.codigo.startsWith(depto));
    this.municipios_nacimiento.set(filtrados);
  }
  obtenerPaisesIso(): void {
    this.api.getPaisesIso()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.mostrarError('obtener paises', error);
          return of([]);
        })
      )
      .subscribe((paises: PaisesIso[]) => {
        const normalizados: PaisesIso[] = paises.map((p: PaisesIso) => ({
          ...p,
          codigo_iso3: p.codigo_iso3?.trim()
        }));

        this.paisesIso.set(normalizados);
      });
  }

  // ======= CUI Y LUGAR DE NACIMIENTO =======
  private suscribirUltimos4Cui(): void {
    this.form.get('cui')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((cui) => {
        const cuiStr = cui ? String(cui).replace(/\s/g, '') : '';
        if (cuiStr.length < 13) return;

        this.form.get('datos_extra.demograficos.nacionalidad')?.setValue('GTM', { emitEvent: false });
      });
  }

  async lugarNacimiento(): Promise<void> {
    const cui = this.form.get('cui')?.value;
    if (!cui) return;

    const cuiStr = String(cui).replace(/\s/g, '');
    if (cuiStr.length < 13) return;

    const codDepto = cuiStr.slice(9, 11);
    const codMuni = cuiStr.slice(-4);

    this.form.get('datos_extra.demograficos.nacionalidad')?.setValue('GTM', { emitEvent: false });

    const depto = this.enums.departamentos.find(d => d.value === codDepto);
    if (!depto) return;

    this.form.get('datos_extra.demograficos.departamento_nacimiento')?.setValue(depto.value, { emitEvent: true });

    const municipiosFiltrados = this.enums.municipios.filter(m => m.codigo.startsWith(depto.value));
    this.municipios_nacimiento.set(municipiosFiltrados);

    const muni = municipiosFiltrados.find(m => m.codigo.endsWith(codMuni));
    if (!muni) return;

    this.form.get('datos_extra.demograficos.lugar_nacimiento')?.setValue(muni.codigo, { emitEvent: false });
  }

  onPasteCUI(event: ClipboardEvent): void {
    event.preventDefault();
    const paste = event.clipboardData?.getData('text') || '';
    const input = event.target as HTMLInputElement;
    const numbers = paste.replace(/\D/g, '').slice(0, 13);

    input.value = numbers.replace(/(\d{4})(\d{0,5})(\d{0,4})/, (_, p1, p2, p3) => {
      return [p1, p2, p3].filter(Boolean).join(' ');
    });

    this.form.get('cui')?.setValue(numbers, { emitEvent: false });
    this.lugarNacimiento();
  }

  // ======= EDAD Y FECHA ==========
  calcularFecha(): void {
    this.actualizandoEdad = true;
    const edad = this.form.get('edad')?.value;
    const fecha = this.pacienteUtil.calcularFechaDesdeEdad(edad);
    this.form.get('fecha_nacimiento')?.setValue(fecha, { emitEvent: false });
    this.actualizandoEdad = false;
  }

  calcularEdad(): void {
    this.actualizandoFecha = true;
    const fechaNacimiento = this.form.get('fecha_nacimiento')?.value;
    const edad = this.pacienteUtil.calcularEdad(fechaNacimiento);
    this.form.get('edad')?.patchValue(edad, { emitEvent: false });

    const rn = this.pacienteUtil.esRecienNacido(fechaNacimiento);
    this.esRecienNacido.set(rn);
    this.actualizandoFecha = false;
  }

  // ======= VALIDADORES =======
  validarEdadYFecha(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const edad = group.get('edad')?.value;
      const fecha = group.get('fecha_nacimiento')?.value;

      if (!fecha && (!edad || (!edad.anios && !edad.meses && !edad.dias))) {
        return { edadOFecha: 'Debe ingresar edad o fecha de nacimiento' };
      }
      return null;
    };
  }

  // ======= MÉTODOS DE NAVEGACIÓN =======
  volver(): void {
    this.router.navigate(['/pacientes']);
  }

  irRenap(): void {
    this.router.navigate(['/renap']);
  }

  // ======= MANEJO DE ERRORES =======
  private mostrarError(accion: string, error: any): void {
    console.error(`Error al ${accion}:`, error);
    alert(`Error al ${accion}. Consulte la consola para más detalles.`);
  }

  // ======= SOCIOECONÓMICO =======
  setSocio(
    campo: 'estudiante_publico' | 'empleado_publico' | 'discapacidad',
    valor: 'SI' | 'NO'
  ): void {
    this.form.get(`datos_extra.socioeconomicos.${campo}`)?.setValue(valor);
  }

  // ======= METADATOS =======
  agregarEventoMetadato(accion: 'CREADO' | 'ACTUALIZADO'): void {

    // 🔒 Blindaje: garantizar que metadatos sea un FormArray
    if (!(this.form.get('metadatos') instanceof FormArray)) {
      this.inicializarMetadatosVacio();
    }

    const metadatos = this.form.get('metadatos') as FormArray;

    metadatos.push(
      this.fb.group({
        usuario: [this.usuarioActual()],
        registro: [new Date().toISOString()],
        accion: [accion]
      })
    );
  }
}
