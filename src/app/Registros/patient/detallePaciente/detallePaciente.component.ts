import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Paciente } from '../../../interface/interfaces'; // Definir según su modelo real
import { ApiService } from '../../../service/api.service';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { hombreIcon, mujerIcon } from '../../../shared/icons/svg-icon';
import { EdadPipe } from "../../../pipes/edad.pipe";
@Component({
  selector: 'detallePaciente',
  templateUrl: './detallePaciente.component.html',
  styleUrls: ['./detallePaciente.component.css'],
  standalone: true,
  imports: [CommonModule, EdadPipe]
})
export class DetallePacienteComponent implements OnInit, OnChanges {
  @Input() pacienteId: number | null = null;
  options: { nombre: string; descripcion: string; ruta: string; icon?: SafeResourceUrl }[] = [];
  paciente!: Paciente;

  referenciaKeys: string[] = [];
  datosExtraKeys: string[] = [];
  metadatosKeys: string[] = [];
  cargando: boolean = true;
  error: string | null = null;

  //svg
  hombreIcon: SafeHtml = hombreIcon;
  mujerIcon: SafeHtml = mujerIcon;


  constructor(
    private ruta: ActivatedRoute,
    private api: ApiService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {

    this.hombreIcon = this.sanitizer.bypassSecurityTrustHtml(hombreIcon);
    this.mujerIcon = this.sanitizer.bypassSecurityTrustHtml(mujerIcon);
  }

  ngOnInit(): void {
    const id = Number(this.ruta.snapshot.paramMap.get('id'));
    this.api.getPaciente(id).then((data) => {
      this.paciente = data;
      console.table(this.paciente);
      this.referenciaKeys = Object.keys(this.paciente.referencias || {});
      this.datosExtraKeys = Object.keys(this.paciente.datos_extra || {});
      console.log(this.datosExtraKeys);
      this.metadatosKeys = Object.keys(this.paciente.metadatos || {});
    });
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


}
