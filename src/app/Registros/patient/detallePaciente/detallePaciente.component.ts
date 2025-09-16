import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../service/api.service';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { EdadPipe } from "../../../pipes/edad.pipe";
import { Paciente } from '../../../interface/interfaces';
import { heartIcon, ghostIcon, manIcon, womanIcon, personFicha, regresarIcon } from './../../../shared/icons/svg-icon';
import { DatosExtraPipe } from '../../../pipes/datos-extra.pipe';

@Component({
  selector: 'detallePaciente',
  templateUrl: './detallePaciente.component.html',
  styleUrls: ['./detallePaciente.component.css'],
  standalone: true,
  imports: [CommonModule, EdadPipe, DatosExtraPipe]
})
export class DetallePacienteComponent implements OnInit, OnChanges {
  @Input() pacienteId: number | null = null;
  paciente!: Paciente;

  referenciaKeys: string[] = [];
  datosExtraKeys: string[] = [];   // ✅ ahora son solo strings
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
      this.api.getPaciente(id).then((data) => {
        this.paciente = data;
        this.referenciaKeys = Object.keys(this.paciente.referencias || {});
        this.datosExtraKeys = Object.keys(this.paciente.datos_extra || {});  // ✅ dinámico
        this.metadatosKeys = Object.keys(this.paciente.metadatos || {});
        console.table(this.datosExtraKeys.map(key => ({ key, value: this.paciente.datos_extra?.[key]?.valor })));
      });
    }
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['pacienteId'] && this.pacienteId) {
      await this.cargarPaciente();
    }
  }

  private async cargarPaciente(): Promise<void> {
    this.cargando = true;
    try {
      this.paciente = await this.api.getPaciente(this.pacienteId!);
      this.referenciaKeys = Object.keys(this.paciente.referencias || {});
      this.datosExtraKeys = Object.keys(this.paciente.datos_extra || {});  // ✅ dinámico
      this.metadatosKeys = Object.keys(this.paciente.metadatos || {});
      this.error = null;
    } catch (err) {
      console.error('❌ Error al cargar paciente:', err);
      this.error = 'Error al cargar el expediente del paciente.';
    } finally {
      this.cargando = false;
    }
  }

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
      // También puedes incluir los que tenías en snake_case si llegan así desde la API
      nacionalidad: 'Nacionalidad',
      estado_civil: 'Estado civil',
      pueblo: 'Grupo étnico',
      idioma: 'Idioma',
      ocupacion: 'Ocupación',
      nivel_educativo: 'Nivel educativo',
      peso_nacimiento: 'Peso al nacer',
      edad_gestacional: 'Edad gestacional',
      parto: 'Parto',
      gemelo: '¿Gemelo?',
      expediente_madre: 'Expediente de la madre',
    };

    if (!tipo) return 'Desconocido';
    return mapaTipos[tipo] || tipo;
  }

  regresar(): void {
    this.router.navigate(['/pacientes']);
  }
}
