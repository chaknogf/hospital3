import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cui',
  standalone: true
})
export class CuiPipe implements PipeTransform {
  transform(value: string | number | null | undefined): string {
    if (!value) return '';
    const str = value.toString().replace(/\D/g, ''); // quitar todo lo que no sea número
    if (str.length !== 13) return value.toString(); // si no son 13 dígitos, mostrar tal cual
    return `${str.slice(0, 4)} ${str.slice(4, 9)} ${str.slice(9)}`;
  }
}
