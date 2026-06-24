import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '@services/api.service';

@Component({
  selector: 'app-resumen-procedimientos',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './resumen-procedimientos.component.html',
  styleUrls: ['./resumen-procedimientos.component.css']
})
export class ResumenProcedimientosComponent implements OnInit {
  private api = inject(ApiService);
  data: any = null;
  cargando = false;
  error: string | null = null;
  anio = new Date().getFullYear();
  mes: number | undefined = undefined;

  meses = [
    { value: undefined, label: 'Todos' },
    { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
  ];

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true; this.error = null;
    this.api.getResumenProcedimientos({ anio: this.anio, mes: this.mes }).subscribe({
      next: (res) => { this.data = res; this.cargando = false; },
      error: () => { this.error = 'Error al cargar datos'; this.cargando = false; }
    });
  }
}
