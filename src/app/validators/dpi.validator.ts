import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dpiValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value ? control.value.toString().trim() : '';

    // Solo válido si tiene exactamente 13 números
    if (!/^\d{13}$/.test(valor)) {
      return { dpiInvalido: true };
    }

    return null;
  };
}
