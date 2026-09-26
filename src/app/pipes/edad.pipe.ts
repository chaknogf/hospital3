import { Pipe, PipeTransform } from '@angular/core';

/** Muestra la edad calendario en años, meses y días. */
@Pipe({
  name: 'edad',
  standalone: true
})
export class EdadPipe implements PipeTransform {

  /** Calcula años, meses y días cumplidos para presentar la edad. */
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

/** Devuelve únicamente los años cumplidos desde una fecha de nacimiento. */
@Pipe({
  name: 'aedad',
  standalone: true
})
export class APipe implements PipeTransform {

  /** Devuelve los años cumplidos a partir de la fecha de nacimiento. */
  transform(value: any | any): number {
    if (!value) return 0;

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

    return years;
  }

}

/** Agrupa la edad en categorías usadas por las vistas de pacientes. */
@Pipe({
  name: 'grupoEdad',
  standalone: true
})
export class GrupoEdadPipe implements PipeTransform {

  /** Clasifica la edad en grupo neonatal, pediátrico, adolescente o adulto. */
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
