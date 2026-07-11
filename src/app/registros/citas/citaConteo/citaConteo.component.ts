import { FechasPipe } from '../../../pipes/fecha.pipe';

import { Component, Input, OnInit, OnChanges, SimpleChanges, inject, ChangeDetectionStrategy } from '@angular/core';
import { CitaService } from '../cita.service';
import { ConteoCitas } from '../../../interface/citas';
import { DatosExtraPipe } from '../../../pipes/datos-extra.pipe';
import { Location } from '@angular/common';

@Component({
  selector: 'app-citaConteo',
  templateUrl: './citaConteo.component.html',
  styleUrls: ['./citaConteo.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DatosExtraPipe, FechasPipe]
})

export class CitaConteoComponent implements OnInit, OnChanges {

  private location = inject(Location);

  @Input() especialidad: string | null = null;

  datos: any[] = [];

  loading = false;
  error: string | null = null;

  constructor(private citaService: CitaService) { }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['especialidad']) {
      this.cargarDatos();
    }
  }

  cargarDatos() {

    if (!this.especialidad) return;

    this.loading = true;
    this.error = null;

    this.citaService.conteoCitas({
      especialidad: this.especialidad
    })
      .subscribe({

        next: (res: ConteoCitas[]) => {

          this.datos = this.agruparDatos(res);

        },

        error: () => {

          this.error = 'Error al cargar datos';

        },

        complete: () => {

          this.loading = false;

        }

      });
  }

  agruparDatos(data: ConteoCitas[]) {

    const agrupado: any = {};

    data.forEach((item: any) => {

      if (!agrupado[item.fecha_cita]) {

        agrupado[item.fecha_cita] = {

          fecha_cita: item.fecha_cita,
          dia_semana: item.dia_semana,

          control: '10',
          preoperatorio: '',
          ingreso: '',
          procedimiento: ''

        };

      }

      switch (item.razon_consulta) {

        case 'control':

          agrupado[item.fecha_cita].control = 10 - item.total;

          break;

        case 'preoperatorio':

          agrupado[item.fecha_cita].preoperatorio = 5 - item.total;

          break;

        case 'ingreso':

          agrupado[item.fecha_cita].ingreso = 3 - item.total;

          break;

        case 'procedimiento':

          agrupado[item.fecha_cita].procedimiento = 5 - item.total;

          break;

      }

    });

    return Object.values(agrupado);

  }

}
