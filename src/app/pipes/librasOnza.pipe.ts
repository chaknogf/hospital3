import { Pipe, PipeTransform } from '@angular/core';

/** Presenta el peso capturado como libras y onzas con dos dígitos. */
@Pipe({
  name: 'librasOnzas',
  standalone: true
})
export class LibrasOnzasPipe implements PipeTransform {
  /** Convierte el formato libras.onzas o libras/onzas a una etiqueta. */
  transform(value: any): string {
    if (value == null || value === '') return '';

    const str = String(value).trim();

    // Soporta separador "." o "/"
    const partes = str.split(/[.\/]/);

    const libras = partes[0]?.padStart(2, '0') ?? '00';
    let onzas = partes[1] ?? '00';

    onzas = onzas.padStart(2, '0').slice(0, 2);

    return `${libras} Libras ${onzas} onzas`;
  }
}
