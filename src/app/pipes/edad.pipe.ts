import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'edad'
})
export class EdadPipe implements PipeTransform {

  transform(value: any | any): any {
    if (!value) return '';

    const birthDate = new Date(value);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return `${years} años ${months} meses ${days} dias`;
  }

}

@Pipe({
  name: 'aedad'
})
export class APipe implements PipeTransform {

  transform(value: any | any): any {
    if (!value) return '';

    const birthDate = new Date(value);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return `${years} años`;
  }

}

@Pipe({
  name: 'grupoEdad',
  standalone: true
})
export class GrupoEdadPipe implements PipeTransform {

  transform(fechaNacimiento: any): any {
    if (!fechaNacimiento) return '';

    const birthDate = new Date(fechaNacimiento);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDias = years * 365 + months * 30 + days;

    if (totalDias <= 28) return 'Neonato';
    if (years < 10) return 'Niño';
    if (years < 18) return 'Adolescente';
    if (years < 60) return 'Adulto';
    return 'Anciano';
  }
}
