// formulario-paciente.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, AbstractControl, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
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

import { validarCui } from '../../../validators/dpi.validator';
import { DpiValidadorDirective } from '../../../directives/dpi-validador.directive';
import { UnaPalabraDirective } from '../../../directives/unaPalabra.directive';
import { SoloNumeroDirective } from '../../../directives/soloNumero.directive';

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
    // DpiValidadorDirective,
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
  public municipios_direccion: Municipio[] = [];
  public municipios_nacimiento: Municipio[] = [];
  public comunidades: Keys[] = [];
  public paisesIso: PaisesIso[] = [];
  public todasLasComunidades = comunidadChimaltenango;
  direccionInput: string = '';

  enums: Enumeradores = {
    estadocivil: estadoCivil,
    gradoacademico: gradoAcademicos,
    idiomas: idiomas,
    parentescos: parentescos,
    pueblos: pueblos,
    departamentos: departamentos
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
      cui: ['',],
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
      referencias: this.fb.group({
        r0: this.fb.group({
          nombre: [''],
          telefono: [''],
          parentesco: ['']
        })
      }),
      datos_extra: this.fb.group({}),
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
    this.obtenerMunicipios('');
    this.obtenerPaisesIso();

    // Si vienen datos desde RENAP
    const pacienteRenap = history.state.paciente;
    if (pacienteRenap) {
      this.form.patchValue(this.pacienteUtil.normalizarPaciente(pacienteRenap));

      if (pacienteRenap.fecha_nacimiento) {
        const edad = this.pacienteUtil.calcularEdad(pacienteRenap.fecha_nacimiento);
        this.form.get('edad')?.patchValue(edad);
      }
    }

    // Si viene ID desde la ruta → modo edición
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      if (!isNaN(id)) {
        this.api.getPaciente(id)
          .then(data => {
            this.enEdicion = true;
            this.form.patchValue(this.pacienteUtil.normalizarPaciente(data));
          })
          .catch(error => this.mostrarError('obtener paciente', error));

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
        const edad = this.pacienteUtil.calcularEdad(fechaStr);
        this.form.get('edad')?.patchValue(edad, { emitEvent: false });
      }
    });
  }

  volver(): void {
    this.router.navigate(['/pacientes']);
  }

  guardar(): void {
    const paciente: Paciente = this.form.getRawValue();
    const normalizado = this.pacienteUtil.normalizarPaciente(paciente);
    normalizado.metadatos = this.pacienteUtil.agregarMetadato(normalizado.metadatos, this.usuarioActual);

    this.enEdicion
      ? this.actualizar(normalizado)
      : this.crear(normalizado);
  }

  async crear(paciente: Paciente): Promise<any> {
    try {
      const correlativo = await this.api.corExpediente();
      paciente.expediente = correlativo;
      const response = await this.api.createPaciente(paciente);
      console.log('✅ Paciente creado correctamente:', response.data);
      return response.data;
    } catch (error) {
      this.mostrarError('crear paciente', error);
      throw error;
    }
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

  obtenerPaisesIso(): void {
    this.api.getPaisesIso()
      .then((paises) => this.paisesIso = paises)
      .catch(error => this.mostrarError('obtener paises', error));
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
    this.form.get('cui')?.valueChanges.subscribe((cui: string) => {
      const ultimos4 = cui?.slice(-4) || '';
      const datosExtra = this.form.get('datos_extra') as FormGroup;
      if (datosExtra.get('r11')) {
        datosExtra.get('r11.valor')?.setValue(ultimos4, { emitEvent: false });
      }
    });
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
  }
}
