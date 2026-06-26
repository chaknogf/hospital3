import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '@services/api.service';
import { ConsultaOut } from '@models/consultas';
import { DatosExtraPipe } from 'app/pipes/datos-extra.pipe';

@Component({
  selector: 'app-activos-mayores-7-dias',
  imports: [CommonModule, FormsModule, RouterLink, DatosExtraPipe],
  templateUrl: './activos-mayores-7-dias.component.html',
  styleUrls: ['./activos-mayores-7-dias.component.css']
})
export class ActivosMayores7DiasComponent implements OnInit {
  private api = inject(ApiService);
  datos: ConsultaOut[] = [];
  cargando = false;
  cargandoMas = false;
  error: string | null = null;
  total = 0;
  skip = 0;
  limit = 50;
  todosCargados = false;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = null;
    this.skip = 0;
    this.datos = [];
    this.todosCargados = false;
    this.api.getActivosMayores7Dias(this.skip, this.limit).subscribe({
      next: (res) => {
        this.datos = res.consultas;
        this.total = res.total;
        this.cargando = false;
        this.todosCargados = this.datos.length >= this.total;
      },
      error: () => {
        this.error = 'Error al cargar datos';
        this.cargando = false;
      }
    });
  }

  cargarMas(): void {
    this.cargandoMas = true;
    this.skip += this.limit;
    this.api.getActivosMayores7Dias(this.skip, this.limit).subscribe({
      next: (res) => {
        this.datos = [...this.datos, ...res.consultas];
        this.total = res.total;
        this.cargandoMas = false;
        this.todosCargados = this.datos.length >= this.total;
      },
      error: () => {
        this.error = 'Error al cargar más datos';
        this.cargandoMas = false;
      }
    });
  }
}
