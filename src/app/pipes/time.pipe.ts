import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'time',
  standalone: true
})
export class TimePipe implements PipeTransform {
  transform(value: any): string {
    if (!value) return '';
    return String(value).substring(0, 5);
  }
}
