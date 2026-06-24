import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '@services/api.service';

@Component({
  selector: 'app-activos-mayores-30-dias',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './activos-mayores-30-dias.component.html',
  styleUrls: ['./activos-mayores-30-dias.component.css']
})
export class ActivosMayores30DiasComponent implements OnInit {
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
    this.api.getActivosMayores30Dias(this.skip, this.limit).subscribe({
      next: (res) => { this.datos = res?.datos || res?.data || []; this.total = res?.total || this.datos.length; this.cargando = false; },
      error: () => { this.error = 'Error al cargar datos'; this.cargando = false; }
    });
  }
}
