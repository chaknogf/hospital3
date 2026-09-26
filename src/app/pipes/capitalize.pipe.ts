import { Pipe, PipeTransform } from '@angular/core';

/** Convierte cada palabra a formato capitalizado para su presentación. */
@Pipe({
  name: 'capitalize',
  standalone: true
})
export class CapitalizePipe implements PipeTransform {
  /** Capitaliza cada palabra después de normalizarla a minúsculas. */
  transform(value: any): string {
    if (value == null) return '';

    return String(value)
      .toLowerCase()
      .split(' ')
      .map(word =>
        word.length > 0
          ? word.charAt(0).toUpperCase() + word.slice(1)
          : word
      )
      .join(' ');
  }
}
