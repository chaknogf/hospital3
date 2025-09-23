// formulario-consulta.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, AbstractControl, Validators, ValidatorFn, ValidationErrors, FormControl, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { Paciente } from './../../../interface/interfaces';
import { UnaPalabraDirective } from './../../../directives/unaPalabra.directive';
import { SoloNumeroDirective } from './../../../directives/soloNumero.directive';
import { provideNgxMask, NgxMaskDirective } from 'ngx-mask';
import { ApiService } from './../../../service/api.service';
import { ConsultaUtilService } from '../../../service/consulta-util.service';
import { addIcon, removeIcon, saveIcon, cancelIcon, findIcon, manIcon, womanIcon } from './../../../shared/icons/svg-icon';
import { ConsultaService } from '../../../service/consulta.service';
import { ConsultaBase, Sistema } from '../../../interface/consultas';
import { EdadPipe } from '../../../pipes/edad.pipe';
import { DatosExtraPipe } from '../../../pipes/datos-extra.pipe';
import { CuiPipe } from '../../../pipes/cui.pipe';
import { Ciclo, TipoConsulta } from '../../../enum/consultas';

@Component({
  selector: 'app-admision',
  templateUrl: './admision.component.html',
  styleUrls: ['./admision.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    EdadPipe,
    DatosExtraPipe,
    CuiPipe
    //UnaPalabraDirective,
    // SoloNumeroDirective,
    // NgxMaskDirective,

  ],
  providers: [
    provideNgxMask()
  ]
})
export class AdmisionComponent implements OnInit {
  options: { nombre: string; descripcion: string; ruta: string; icon?: SafeResourceUrl }[] = [];
  public enEdicion = false;
  public esEmergencia = false
  public esCoesx = false;
  public esIngreso = false;
  public edadPaciente: boolean = false;
  public usuarioActual = '';

  public paciente: Paciente | null = null;
  form: FormGroup;
  private actualizandoFecha = false;
  private actualizandoEdad = false;

  // svg
  addIcon!: SafeHtml;
  removeIcon!: SafeHtml;
  saveIcon!: SafeHtml;
  cancelIcon!: SafeHtml;
  findIcon!: SafeHtml;
  womanIcon!: SafeHtml;
  manIcon!: SafeHtml;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly apiPaciente: ApiService,
    private readonly apiConsulta: ConsultaService,
    private readonly fb: FormBuilder,
    private readonly sanitizer: DomSanitizer,
    private readonly consultaUtil: ConsultaUtilService

  ) {
    this.form = this.fb.group({
      id: [null],
      paciente_id: [0],
      tipo_consulta: [0],
      especialidad: [0],
      servicio: [0],
      documento: [''],
      fecha_consulta: [''],
      hora_consulta: [''],
      fecha_nacimiento: [''],
      ciclo: this.fb.group({
        r1: this.fb.group({
          clave: [''],
          valor: [''],
          registro: ['']
        })
      }),
      indicadores: this.fb.group({
        estudiante_publico: [false],
        empleado_publico: [false],
        accidente_laboral: [false],
        discapacidad: [false],
        accidente_transito: [false],
        arma_fuego: [false],
        arma_blanca: [false],
        ambulancia: [false],
        embarazo: [false]
      }),
      detalle_clinico: this.fb.group({}),
      sistema: this.fb.group({}),
      signos_vitales: this.fb.group({}),
      antecedentes: this.fb.group({}),
      ordenes: this.fb.group({}),
      estudios: this.fb.group({}),
      comentario: this.fb.group({}),
      impresion_clinica: this.fb.group({}),
      tratamiento: this.fb.group({}),
      examen_fisico: this.fb.group({}),
      nota_enfermeria: this.fb.group({}),
      presa_quirurgica: this.fb.group({}),
      egreso: this.fb.group({})
    });



    // svg icon initialization after sanitizer is available
    this.addIcon = this.sanitizer.bypassSecurityTrustHtml(addIcon);
    this.removeIcon = this.sanitizer.bypassSecurityTrustHtml(removeIcon);
    this.saveIcon = this.sanitizer.bypassSecurityTrustHtml(saveIcon);
    this.cancelIcon = this.sanitizer.bypassSecurityTrustHtml(cancelIcon);
    this.findIcon = this.sanitizer.bypassSecurityTrustHtml(findIcon);
    this.womanIcon = this.sanitizer.bypassSecurityTrustHtml(womanIcon);
    this.manIcon = this.sanitizer.bypassSecurityTrustHtml(manIcon);
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const origen = params.get('origen');
      const pacienteId = params.get('pacienteId');
      const consultaId = params.get('consultaId');

      switch (origen) {
        case 'emergencia':
          this.esEmergencia = true;
          break;
        case 'coex':
          this.esCoesx = true;
          break;
        case 'ingreso':
          this.esIngreso = true;
          break;
      }

      // Si existe consultaId => estamos en edición
      if (consultaId) {
        this.enEdicion = true;
        const numConsultaId = Number(consultaId);
        if (!isNaN(numConsultaId)) {
          this.cargarConsulta(numConsultaId);
          this.cargarPaciente(this.form.get('paciente_id')?.value);
        }

      } else {
        this.enEdicion = false;
        // Cargar solo paciente cuando NO es edición
        if (pacienteId) {
          const numPacienteId = Number(pacienteId);
          if (!isNaN(numPacienteId)) {
            this.cargarPaciente(numPacienteId);


          }
        }
      }
      console.log(this.enEdicion);
    });
    // 🔹 Capturar query params también
    this.route.queryParams.subscribe(q => {
      if (q['esCoex']) this.esCoesx = true;
      if (q['esEmergencia']) this.esEmergencia = true;
      if (q['esIngreso']) this.esIngreso = true;
    });

    this.usuarioActual = localStorage.getItem('username') || '';
  }

  private cargarConsulta(id: number): void {
    this.apiConsulta.getConsulta(id)
      .then(data => {
        this.enEdicion = true;

        // 🔹 Sistema dinámico
        const sistemaGroup = this.fb.group({});
        if (data?.sistema && typeof data.sistema === 'object') {
          Object.entries(data.sistema).forEach(([key, meta]: [string, any]) => {
            sistemaGroup.addControl(key, this.fb.group({
              usuario: [meta?.usuario || ''],
              fecha: [meta?.fecha || meta?.registro || ''],
              accion: [meta?.accion || '']
            }));
          });
        }
        this.form.setControl('sistema', sistemaGroup);

        // 🔹 Cargar paciente si aplica
        if (data?.paciente_id) {
          this.cargarPaciente(data.paciente_id);
        }

        // 🔹 Normalizar y cargar en form
        this.form.patchValue(this.consultaUtil.normalizarConsulta(data), { emitEvent: false });
      })
      .catch(error => this.mostrarError('obtener consulta', error));
  }

  cargarPaciente(id: number): void {
    this.apiPaciente.getPaciente(id)
      .then(data => {
        this.paciente = data;

        // Actualizar campos del formulario
        this.form.patchValue({
          paciente_id: id,
          expediente: this.paciente.expediente,
          fecha_nacimiento: this.paciente.fecha_nacimiento
        }, { emitEvent: false });

        // Calcular edad automáticamente
        const fechaNacimiento = this.paciente.fecha_nacimiento;
        if (fechaNacimiento) {
          const edad = this.consultaUtil.calcularEdad(fechaNacimiento);
          this.form.get('edad')?.patchValue(edad, { emitEvent: false });
        }

      })
      .catch(error => this.mostrarError('cargar paciente', error));
  }

  volver(): void {
    if (this.esEmergencia) this.router.navigate(['/emergencias']);
    else if (this.esCoesx) this.router.navigate(['/coex']);
    else if (this.esIngreso) this.router.navigate(['/ingreso']);
  }


  get sistema(): FormGroup {
    return this.form.get('sistema') as FormGroup;
  }

  agregarSistemas(usuario: string) {
    const timestamp = new Date().toISOString();
    const total = Object.keys(this.sistema.controls).length;
    this.sistema.addControl(
      `r${total}`,
      this.fb.group({
        usuario: [usuario],
        fecha: [timestamp],
        accion: [this.form.get('ciclo')?.value || '']
      })
    );
  }
  guardar(): void {
    const consulta: ConsultaBase = this.form.getRawValue();
    let normalizado = this.consultaUtil.normalizarConsulta(consulta);

    // 🔹 Agregar metadato
    normalizado.sistema = this.consultaUtil.agregarSistema(
      normalizado.sistema,
      this.usuarioActual
    );

    if (this.enEdicion) {
      const id = this.form.get('id')?.value;
      this.actualizar(id, normalizado); // pasar id + consulta
    } else {
      this.crear(normalizado);
    }

    this.volver();
  }
  async crear(consulta: ConsultaBase): Promise<any> {
    try {
      const correlativo = await this.apiConsulta.corEmergencia();
      this.form.get('documento')?.setValue(correlativo);
      const response = await this.apiConsulta.crearConsulta(consulta);
      return response.data;
    } catch (error) {
      this.mostrarError('crear consulta', error);
      throw error;
    }
  }
  async actualizar(id: number, consulta: ConsultaBase): Promise<void> {
    try {
      await this.apiConsulta.updateConsulta(id, consulta); // usar id recibido
      this.volver();
    } catch (error) {
      this.mostrarError('actualizar consulta', error);
    }
  }

  validarEdadYFecha(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const edad = group.get('edad');
      const fecha = group.get('fecha_nacimiento')?.value;
      if (!edad || !fecha) return null;
      return null;
    };
  }

  get sortedSistemas(): Sistema[] {
    const sistema = this.form.get('sistema')?.value || {};
    return (Object.values(sistema) as Sistema[]).sort((a, b) =>
      new Date(b.fecha ?? '').getTime() - new Date(a.fecha ?? '').getTime()
    );
  }

  private mostrarError(accion: string, error: any): void {
    console.error(`Error al ${accion}:`, error);
    alert(`Error al ${accion}. Consulte la consola para más detalles.`);
  }


  tipoConsulta = Object.entries(TipoConsulta)
    .filter(([key, value]) => isNaN(Number(key))) // solo claves de texto
    .map(([key, value]) => ({ label: key, value }));

  ciclos = Object.entries(Ciclo)
    .filter(([key, value]) => isNaN(Number(key))) // solo claves de texto
    .map(([key, value]) => ({ label: key, value }));

}
