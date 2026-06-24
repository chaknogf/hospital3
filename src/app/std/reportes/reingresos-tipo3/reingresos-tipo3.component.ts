import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '@services/api.service';

@Component({
  selector: 'app-reingresos-tipo3',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reingresos-tipo3.component.html',
  styleUrls: ['./reingresos-tipo3.component.css']
})
export class ReingresosTipo3Component implements OnInit {
  private api = inject(ApiService);
  datos: any[] = [];
  cargando = true;
  error: string | null = null;
  total = 0;
  skip = 0;
  limit = 50;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true; this.error = null;
    this.api.getReingresosTipo3(this.skip, this.limit).subscribe({
      next: (res) => { this.datos = res?.datos || res?.data || []; this.total = res?.total || this.datos.length; this.cargando = false; },
      error: () => { this.error = 'Error al cargar datos'; this.cargando = false; }
    });
  }
}
