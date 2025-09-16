import { Directive, HostListener } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, NgControl } from '@angular/forms';

@Directive({
  selector: '[validarDPI]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: DpiValidadorDirective,
      multi: true
    }
  ]
})
export class DpiValidadorDirective implements Validator {
  constructor(private control: NgControl) { }

  // 🔹 Limpieza en tiempo real
  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    const soloNumeros = value.replace(/\D/g, '').slice(0, 13);
    if (soloNumeros !== value) {
      this.control.control?.setValue(soloNumeros, { emitEvent: false });
    }
  }

  // 🔹 Validación del DPI
  validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    if (value.length < 13) {
      return {
        validarDPI: {
          faltantes: 13 - value.length
        }
      };
    }
    return null;
  }
}
