import { Pipe, PipeTransform } from '@angular/core';

/** Reduce una hora con segundos a su representación HH:mm. */
@Pipe({
  name: 'time',
  standalone: true
})
export class TimePipe implements PipeTransform {
  /** Recorta una hora con segundos al formato de cinco caracteres. */
  transform(value: any): string {
    if (!value) return '';
    return String(value).substring(0, 5);
  }
}
