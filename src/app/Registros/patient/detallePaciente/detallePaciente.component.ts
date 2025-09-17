import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../service/api.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EdadPipe } from "../../../pipes/edad.pipe";
import { DatosExtraPipe } from '../../../pipes/datos-extra.pipe';
import { Paciente } from '../../../interface/interfaces';
import { heartIcon, ghostIcon, manIcon, womanIcon, personFicha, regresarIcon } from './../../../shared/icons/svg-icon';
import { CuiPipe } from '../../../pipes/cui.pipe';

@Component({
  selector: 'detallePaciente',
  templateUrl: './detallePaciente.component.html',
  styleUrls: ['./detallePaciente.component.css'],
  standalone: true,
  imports: [CommonModule, EdadPipe, DatosExtraPipe, CuiPipe]
})
export class DetallePacienteComponent implements OnInit, OnChanges {
  @Input() pacienteId: number | null = null;
  paciente!: Paciente;

  // Listas filtradas para iteración
  referenciaKeys: string[] = [];
  datosExtraFiltrados: { key: string; valor: any; tipo: string }[] = [];
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
    if (this.pacienteId) {
      this.cargarPaciente();
    } else {
      const id = Number(this.ruta.snapshot.paramMap.get('id'));
      if (id) {
        this.api.getPaciente(id).then((data) => {
          this.paciente = data;
          this.procesarPaciente();
        }).catch(err => {
          console.error('❌ Error al cargar paciente:', err);
          this.error = 'Error al cargar el expediente del paciente.';
        });
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pacienteId'] && this.pacienteId) {
      this.cargarPaciente();
    }
  }

  private async cargarPaciente(): Promise<void> {
    this.cargando = true;
    try {
      if (!this.pacienteId) return;
      this.paciente = await this.api.getPaciente(this.pacienteId);
      this.procesarPaciente();
      this.error = null;
    } catch (err) {
      console.error('❌ Error al cargar paciente:', err);
      this.error = 'Error al cargar el expediente del paciente.';
    } finally {
      this.cargando = false;
    }
  }

  /** Prepara listas filtradas y claves para iterar en HTML */
  private procesarPaciente(): void {
    // Referencias
    this.referenciaKeys = Object.keys(this.paciente?.referencias || {});

    // Metadatos
    this.metadatosKeys = Object.keys(this.paciente?.metadatos || {});

    // Datos Extra filtrados: excluir lo que no queremos mostrar
    this.datosExtraFiltrados = Object.keys(this.paciente?.datos_extra || {})
      .map(key => ({
        key,
        valor: this.paciente?.datos_extra?.[key]?.valor ?? '',
        tipo: this.paciente?.datos_extra?.[key]?.tipo ?? ''
      }))
      .filter(item => item.valor && !['departamento_nacimiento', 'municipio_nacimiento'].includes(item.tipo));
  }

  /** Mapa de tipos para mostrar nombres legibles en HTML */
  convertirTipo(tipo: string | undefined): string {
    const mapaTipos: { [key: string]: string } = {
      EstadoCivil: 'Estado civil',
      Ocupacion: 'Ocupación',
      Nacionalidad: 'Nacionalidad',
      LugarNacimiento: 'Lugar de nacimiento',
      NivelEducativo: 'Nivel educativo',
      Religion: 'Religión',
      GrupoEtnico: 'Grupo étnico',
      Idioma: 'Idioma',
      municipio_nacimiento: 'Municipio de nacimiento',
      departamento_nacimiento: 'Departamento de nacimiento',
      estudiante_publico: 'Estudiante publico',
      empleado_publico: 'Empleado publico',
      // Snake case
      nacionalidad: 'Nacionalidad',
      estado_civil: 'Estado civil',
      pueblo: 'Pueblo',
      idioma: 'Idioma',
      ocupacion: 'Ocupación',
      nivel_educativo: 'Nivel educativo',
      peso_nacimiento: 'Peso al nacer',
      edad_gestacional: 'Edad gestacional',
      parto: 'Parto',
      gemelo: '¿Gemelo?',
      expediente_madre: 'Expediente de la madre',
    };

    return tipo ? (mapaTipos[tipo] || tipo) : 'Desconocido';
  }

  regresar(): void {
    this.router.navigate(['/pacientes']);
  }
}
