import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Paciente } from '../../../interface/interfaces'; // Definir según su modelo real
import { ApiService } from '../../../service/api.service';

@Component({
  selector: 'detallePaciente',
  templateUrl: './detallePaciente.component.html',
  styleUrls: ['./detallePaciente.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class DetallePacienteComponent implements OnInit, OnChanges {
  @Input() pacienteId: number | null = null;

  paciente!: Paciente;

  referenciaKeys: string[] = [];
  datosExtraKeys: string[] = [];
  metadatosKeys: string[] = [];
  cargando: boolean = true;
  error: string | null = null;
  constructor(
    private ruta: ActivatedRoute,
    private api: ApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = Number(this.ruta.snapshot.paramMap.get('id'));
    this.api.getPaciente(id).then((data) => {
      this.paciente = data;
      this.referenciaKeys = Object.keys(this.paciente.referencias || {});
      this.datosExtraKeys = Object.keys(this.paciente.datos_extra || {});
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
}
