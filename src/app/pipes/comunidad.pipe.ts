import { Pipe, PipeTransform } from '@angular/core';
import { comunidadChimaltenango } from '../interface/comunidadChimaltenango';

/** Muestra el nombre canónico de una comunidad del catálogo local. */
@Pipe({
  name: 'comunidad',
  standalone: true
})
export class ComunidadPipe implements PipeTransform {
  /** Devuelve el nombre del catálogo cuando existe una coincidencia exacta. */
  transform(value: string): string {
    const comunidadEncontrado = comunidadChimaltenango.find(comunidades => comunidades.comunidad === value);
    if (comunidadEncontrado) {
      return comunidadEncontrado.comunidad;
    } else {
      return ''
    }
  }
}
