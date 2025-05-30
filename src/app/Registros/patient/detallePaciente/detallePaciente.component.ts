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

  patient!: Paciente;
  cargando: boolean = true;
  error: string | null = null;
  constructor(
    private ruta: ActivatedRoute,
    private api: ApiService,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {
    // Optionally, you can load data here if pacienteId is available at init
    if (this.pacienteId !== null) {
      await this.cargarPaciente();
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
      this.patient = await this.api.getPaciente(this.pacienteId!);
      this.error = null;
    } catch (err) {
      console.error('❌ Error al cargar paciente:', err);
      this.error = 'Error al cargar el expediente del paciente.';
    } finally {
      this.cargando = false;
    }
  }
}
