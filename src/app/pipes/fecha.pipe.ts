import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

/** Formatea fechas con abreviaturas de meses en español. */
@Pipe({
  name: 'fecha',
  standalone: true
})
export class FechasPipe implements PipeTransform {

  private datePipe = new DatePipe('es');

  /** Devuelve la fecha en formato día-mes abreviado-año. */
  transform(value: any): any {
    if (!value) return '';

    const fecha = this.datePipe.transform(value, 'dd-MMM-yyyy');

    return fecha ? fecha.toLowerCase() : '';
  }
}
