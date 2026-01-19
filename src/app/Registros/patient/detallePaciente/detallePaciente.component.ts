import { Keys } from './../../../interface/comunidadChimaltenango';
import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../service/api.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EdadPipe } from "../../../pipes/edad.pipe";
import { DatosExtraPipe } from '../../../pipes/datos-extra.pipe';
import { Paciente, Referencia } from '../../../interface/interfaces';
import { heartIcon, ghostIcon, manIcon, womanIcon, personFicha, regresarIcon } from './../../../shared/icons/svg-icon';
import { CuiPipe } from '../../../pipes/cui.pipe';

@Component({
  selector: 'detallePaciente',
  templateUrl: './detallePaciente.component.html',
  styleUrls: ['./detallePaciente.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, EdadPipe, DatosExtraPipe, CuiPipe]
})
export class DetallePacienteComponent implements OnInit, OnChanges {
  @Input() pacienteId: number | null = null;
  paciente!: Paciente;

  // Listas procesadas para la vista
  demograficosFiltrados: { key: string; valor: any }[] = [];
  socioeconomicosFiltrados: { key: string; valor: any }[] = [];
  metadatosArray: { key: string; valor: any }[] = [];
  neonatalesFiltrados: { key: string; valor: any }[] = [];

  cargando: boolean = true;
  error: string | null = null;

  // SVGs
  heartIcon: SafeHtml;
  manIcon: SafeHtml;
  womanIcon: SafeHtml;
  ghostIcon: SafeHtml;
  personFicha: SafeHtml;
  regresarIcon: SafeHtml;

  constructor(
    private ruta: ActivatedRoute,
    private api: ApiService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.heartIcon = this.sanitizer.bypassSecurityTrustHtml(heartIcon);
    this.manIcon = this.sanitizer.bypassSecurityTrustHtml(manIcon);
    this.womanIcon = this.sanitizer.bypassSecurityTrustHtml(womanIcon);
    this.ghostIcon = this.sanitizer.bypassSecurityTrustHtml(ghostIcon);
    this.personFicha = this.sanitizer.bypassSecurityTrustHtml(personFicha);
    this.regresarIcon = this.sanitizer.bypassSecurityTrustHtml(regresarIcon);
  }

  ngOnInit(): void {
    if (this.pacienteId) {
      this.cargarPaciente();
    } else {
      const id = Number(this.ruta.snapshot.paramMap.get('id'));
      if (id) {
        this.cargarPacienteById(id);
      } else {
        this.error = 'No se proporcionó un ID de paciente';
        this.cargando = false;
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pacienteId'] && this.pacienteId) {
      this.cargarPaciente();
    }
  }

  private async cargarPaciente(): Promise<void> {
    if (!this.pacienteId) return;
    this.cargando = true;

    try {
      this.api.getPaciente(this.pacienteId).subscribe({
        next: (data) => {
          this.paciente = data;
          this.procesarPaciente();
          this.error = null;
          this.cargando = false;
        },
        error: (err: any) => {
          this.error = err?.message || 'Error al cargar el expediente del paciente.';
          this.cargando = false;
        }
      });
    } catch (err: any) {
      this.error = err?.message || 'Error al cargar el expediente del paciente.';
      this.cargando = false;
    }
  }

  private cargarPacienteById(id: number): void {
    this.cargando = true;

    try {
      this.api.getPaciente(id).subscribe({
        next: (data) => {
          this.paciente = data;
          this.procesarPaciente();
          this.error = null;
          this.cargando = false;
        },
        error: (err: any) => {
          this.error = err?.message || 'Error al cargar el expediente del paciente.';
          this.cargando = false;
        }
      });
    } catch (err: any) {
      this.error = err?.message || 'Error al cargar el expediente del paciente.';
      this.cargando = false;
    }
  }

  /** Prepara listas filtradas para mostrar en HTML */
  private procesarPaciente(): void {
    if (!this.paciente) return;

    // Procesar datos demográficos
    if (this.paciente.datos_extra?.demograficos) {
      this.demograficosFiltrados = Object.entries(this.paciente.datos_extra.demograficos)
        .filter(([key, valor]) =>
          valor !== null &&
          valor !== undefined &&
          valor !== 0 &&
          valor !== ''
        )
        .map(([key, valor]) => ({ key, valor }));
    }

    // Procesar datos socioeconómicos
    if (this.paciente.datos_extra?.socioeconomicos) {
      this.socioeconomicosFiltrados = Object.entries(this.paciente.datos_extra.socioeconomicos)
        .filter(([key, valor]) =>
          valor !== null &&
          valor !== undefined &&
          valor !== '' &&
          valor !== 0
        )
        .map(([key, valor]) => ({ key, valor }));
    }

    // Procesar datos neonatales
    if (this.paciente.datos_extra?.neonatales) {
      this.neonatalesFiltrados = Object.entries(this.paciente.datos_extra.neonatales)
        .filter(([key, valor]) =>
          valor !== null &&
          valor !== undefined &&
          valor !== '' &&
          valor !== 0
        )
        .map(([key, valor]) => ({ key, valor }));
    }

    // Procesar metadatos
    this.procesarMetadatos();
  }

  /** Procesa metadatos según la interface Metadata (solo lectura) */
  private procesarMetadatos(): void {
    this.metadatosArray = [];

    const metas = this.paciente?.metadatos;
    if (!Array.isArray(metas) || metas.length === 0) return;

    metas.forEach((evento, index) => {
      this.metadatosArray.push({
        key: `Evento ${index + 1}`,
        valor: {
          usuario: evento.usuario,
          registro: this.formatearFecha(evento.registro),
          accion: evento.accion,
          expediente_duplicado: evento.expediente_duplicado ? 'Sí' : 'No'
        }
      });
    });
  }

  /** Mapa de claves para mostrar nombres legibles */
  convertirClave(key: string): string {
    const mapaClaves: { [key: string]: string } = {
      // Metadatos
      usuario: 'Usuario',
      registro: 'Fecha de registro',
      accion: 'Acción',
      expediente_duplicado: 'Expediente duplicado',

      // Demográficos
      idioma: 'Idioma',
      pueblo: 'Pueblo',
      estado_civil: 'Estado civil',
      nacionalidad: 'Nacionalidad',
      lugar_nacimiento: 'Lugar de nacimiento',
      departamento_nacimiento: 'Departamento de nacimiento',
      vecindad: 'Vecindad',

      // Socioeconómicos
      ocupacion: 'Ocupación',
      educacion: 'Nivel educativo',
      estudiante_publico: 'Estudiante público',
      empleado_publico: 'Empleado público',
      discapacidad: 'Discapacidad',

      // Otros
      personaid: 'CUI Persona',
      defuncion: 'Fecha de defunción',
    };

    return mapaClaves[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /** Obtener el icono de sexo */
  get iconoSexo(): SafeHtml {
    if (!this.paciente?.sexo) return this.ghostIcon;
    const sexo = this.paciente.sexo.trim().toUpperCase();
    return sexo === 'M' ? this.manIcon : sexo === 'F' ? this.womanIcon : this.ghostIcon;
  }

  /** Obtener el estado del paciente */
  get estadoPaciente(): string {
    const estado = this.paciente?.estado?.trim().toUpperCase();
    const mapaEstados: { [key: string]: string } = {
      'V': 'Vivo',
      'F': 'Fallecido',
      'I': 'Inactivo',
      'A': 'Activo'
    };
    return estado ? (mapaEstados[estado] || estado) : 'Desconocido';
  }

  /** Formatear fecha */
  formatearFecha(fecha: string | null | undefined): string {
    if (!fecha) return 'No disponible';
    try {
      return new Date(fecha).toLocaleDateString('es-GT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fecha;
    }
  }

  /** Verificar si tiene referencias válidas */
  get tieneReferencias(): boolean {
    return Array.isArray(this.paciente?.referencias) && this.paciente.referencias.length > 0;
  }

  /** Obtener nombre completo de referencia */
  getNombreReferencia(ref: Referencia): string {
    return ref.nombre ?? 'Sin nombre';
  }

  /** Obtener parentesco de referencia */
  getParentesco(ref: any): string {
    return ref?.parentesco || 'Sin parentesco';
  }

  /** Obtener teléfono de referencia */
  getTelefono(ref: any): string {
    return ref?.telefono || 'Sin teléfono';
  }

  getExpediente(ref: any): string {
    return ref?.expediente || 'Sin expediente';
  }

  getIdPersona(ref: any): string {
    return ref?.idpersona || 'Sin ID persona';
  }

  /** Verificar si tiene CUI persona en datos extra */
  get cuiPersona(): string | null {
    return this.paciente?.datos_extra?.personaid || null;
  }

  /** Verificar si tiene fecha de defunción */
  get fechaDefuncion(): string | null {
    return this.paciente?.datos_extra?.defuncion || null;
  }

  regresar(): void {
    this.router.navigate(['/pacientes']);
  }


}
