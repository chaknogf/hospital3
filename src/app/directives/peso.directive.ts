import { Directive } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';

@Directive({
  selector: '[peso]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: PesoDirective,
      multi: true
    }
  ]
})
export class PesoDirective implements Validator {

  validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    // Solo números con máximo 2 decimales
    const regex = /^\d+(\.\d{1,2})?$/;
    if (!regex.test(value)) {
      return { peso: 'Formato inválido. Ej: 6.08 (libras.onzas)' };
    }

    // Verificar que las onzas sean válidas (0–15)
    const [libras, onzasStr] = String(value).split('.');
    if (onzasStr) {
      const onzas = parseInt(onzasStr, 10);
      if (onzas < 0 || onzas > 15) {
        return { peso: 'Las onzas deben estar entre 0 y 15' };
      }
    }

    return null;
  }
}
