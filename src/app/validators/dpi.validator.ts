import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function validarCui(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value?.toString().replace(/\D/g, '') || '';
    const longitud = valor.length;

    if (longitud === 13) return null
    if (longitud === 0) return null;

    return {
      validarDPI: {
        mensaje: `El CUI debe tener exactamente 13 dígitos. Te faltan ${13 - longitud} dígito(s).`,
        faltantes: 13 - longitud
      }
    };
  };
}
