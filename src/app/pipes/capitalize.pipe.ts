import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize'
})
export class CapitalizePipe implements PipeTransform {
  transform(value: any): string {
    if (value == null) return '';

    return String(value)
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }
}
