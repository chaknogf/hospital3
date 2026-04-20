import { FechasPipe } from './../../../pipes/fecha.pipe';
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CitaService } from '../cita.service';
import { ConteoCitas } from '../../../interface/citas';
import { DatosExtraPipe } from '../../../pipes/datos-extra.pipe';




@Component({
  selector: 'app-citaConteo',
  templateUrl: './citaConteo.component.html',
  styleUrls: ['./citaConteo.component.css'],
  standalone: true,
  imports: [CommonModule, DatosExtraPipe, FechasPipe]
})


export class CitaConteoComponent implements OnInit, OnChanges {

  @Input() especialidad: string | null = null;

  datos: ConteoCitas[] = [];
  loading = false;
  error: string | null = null;


  constructor(private citaService: CitaService) { }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['especialidad']) {          // ← quitar el !firstChange
      this.cargarDatos();
    }
  }

  cargarDatos() {
    if (!this.especialidad) return;

    this.loading = true;
    this.error = null;

    this.citaService.conteoCitas({ especialidad: this.especialidad })
      .subscribe({
        next: (res: any) => {
          this.datos = res;
        },
        error: () => {
          this.error = 'Error al cargar datos';
        },
        complete: () => {
          this.loading = false;
        }
      });
  }
}
