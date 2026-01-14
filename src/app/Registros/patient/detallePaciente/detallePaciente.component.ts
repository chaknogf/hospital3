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
  metadatosKeys: string[] = [];

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
    // console.log('🔍 ngOnInit - pacienteId:', this.pacienteId);

    if (this.pacienteId) {
      // console.log('📍 Cargando con @Input pacienteId:', this.pacienteId);
      this.cargarPaciente();
    } else {
      const id = Number(this.ruta.snapshot.paramMap.get('id'));
      // console.log('📍 Cargando con paramMap id:', id);

      if (id) {
        this.cargarPacienteById(id);
      } else {
        // console.error('❌ No se encontró ID en la ruta');
        this.error = 'No se proporcionó un ID de paciente';
        this.cargando = false;
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log('🔄 ngOnChanges:', changes);
    if (changes['pacienteId'] && this.pacienteId) {
      this.cargarPaciente();
    }
  }

  private async cargarPaciente(): Promise<void> {
    if (!this.pacienteId) return;
    this.cargando = true;
    // console.log('⏳ Cargando paciente ID:', this.pacienteId);

    try {
      this.api.getPaciente(this.pacienteId).subscribe({
        next: (data) => {
          this.paciente = data;
          // console.log('✅ Paciente cargado:', this.paciente);
          this.procesarPaciente();
          this.error = null;
          this.cargando = false;
        },
        error: (err: any) => {
          // console.error('❌ Error al cargar paciente:', err);
          this.error = err?.message || 'Error al cargar el expediente del paciente.';
          this.cargando = false;
        }
      });
    } catch (err: any) {
      // console.error('❌ Error al cargar paciente:', err);
      this.error = err?.message || 'Error al cargar el expediente del paciente.';
      this.cargando = false;
    }
  }

  private cargarPacienteById(id: number): void {
    this.cargando = true;
    // console.log('⏳ Cargando paciente por ID:', id);

    try {
      this.api.getPaciente(id).subscribe({
        next: (data) => {
          this.paciente = data;
          // console.log('✅ Paciente cargado:', this.paciente);
          // console.log('📊 Datos extra:', this.paciente?.datos_extra);
          // console.log('👥 Referencias:', this.paciente?.referencias);
          this.procesarPaciente();
          this.error = null;
          this.cargando = false;
        },
        error: (err: any) => {
          // console.error('❌ Error al cargar paciente:', err);
          // console.error('📋 Detalles del error:', err.response?.data);
          this.error = err?.message || 'Error al cargar el expediente del paciente.';
          this.cargando = false;
        }
      });
    } catch (err: any) {
      // console.error('❌ Error al cargar paciente:', err);
      this.error = err?.message || 'Error al cargar el expediente del paciente.';
      this.cargando = false;
    }
  }

  /** Prepara listas filtradas para mostrar en HTML */
  private procesarPaciente(): void {
    // console.log('🔧 Procesando paciente...');

    if (!this.paciente) {
      // console.warn('⚠️ No hay paciente para procesar');
      return;
    }

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

      // console.log('📊 Demográficos filtrados:', this.demograficosFiltrados);
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

      // console.log('💼 Socioeconómicos filtrados:', this.socioeconomicosFiltrados);
    }

    // Procesar metadatos
    if (this.paciente.metadatos) {
      this.metadatosKeys = Object.keys(this.paciente.metadatos)
        .filter(key => {
          const valor = this.paciente.metadatos![key];
          return valor !== null && valor !== undefined && valor !== '';
        });

      // console.log('📌 Metadatos keys:', this.metadatosKeys);
    }

    // console.log('✅ Procesamiento completado');
  }

  /** Mapa de claves para mostrar nombres legibles */
  convertirClave(key: string): string {
    const mapaClaves: { [key: string]: string } = {
      // Demográficos
      idioma_id: 'Idioma',
      pueblo_id: 'Pueblo',
      estado_civil_id: 'Estado civil',
      nacionalidad_id: 'Nacionalidad',
      lugar_nacimiento_id: 'Lugar de nacimiento',
      departamento_nacimiento_id: 'Departamento de nacimiento',

      // Socioeconómicos
      ocupacion: 'Ocupación',
      educacion_id: 'Nivel educativo',

      // Metadatos
      id_origen: 'ID origen',
      creado_por: 'Creado por',
      migrado_en: 'Migrado en',
      sistema_origen: 'Sistema origen',
      version_migracion: 'Versión migración',
      expediente_duplicado: 'Expediente duplicado',

      // Otros en datos_extra
      cuipersona: 'CUI',
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
        day: 'numeric'
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
