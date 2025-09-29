import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'time' })
export class TimePipe implements PipeTransform {
  transform(value: any): string {
    if (!value) return '';
    return value.substring(0, 5); // solo HH:mm
  }
}
