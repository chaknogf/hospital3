import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '@services/api.service';
import { PacienteResumen } from '@models/interfaces';

@Component({
  selector: 'app-personal-hospital-list',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './personal-hospital-list.component.html',
  styleUrls: ['./personal-hospital-list.component.css']
})
export class PersonalHospitalListComponent implements OnInit {
  private api = inject(ApiService);

  pacientes: PacienteResumen[] = [];
  total = 0;
  cargando = false;
  error: string | null = null;
  skip = 0;
  limit = 100;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = null;
    this.api.getPersonalHospitalPacientes(this.skip, this.limit).subscribe({
      next: (res) => {
        this.pacientes = res.pacientes;
        this.total = res.total;
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar personal del hospital';
        this.cargando = false;
      }
    });
  }
}
