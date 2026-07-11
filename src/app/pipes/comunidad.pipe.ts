import { Pipe, PipeTransform } from '@angular/core';
import { comunidadChimaltenango } from '../interface/comunidadChimaltenango';

@Pipe({
  name: 'comunidad',
  standalone: true
})
export class ComunidadPipe implements PipeTransform {
  transform(value: string): string {
    const comunidadEncontrado = comunidadChimaltenango.find(comunidades => comunidades.comunidad === value);
    if (comunidadEncontrado) {
      return comunidadEncontrado.comunidad;
    } else {
      return ''
    }
  }
}
