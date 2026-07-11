import { Directive, HostListener } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors, NgControl } from '@angular/forms';

@Directive({
  selector: '[peso]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: PesoDirective,
      multi: true
    }
  ]
})
export class PesoDirective implements Validator {

  constructor(private control: NgControl) { }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    // Solo permitir dígitos y un punto
    let limpio = value.replace(/[^\d.]/g, '');

    // Solo un punto
    const partes = limpio.split('.');
    if (partes.length > 2) {
      limpio = partes[0] + '.' + partes.slice(1).join('');
    }

    // Libras: máximo 2 dígitos
    if (partes[0] && partes[0].length > 2) {
      limpio = partes[0].slice(0, 2) + (partes[1] !== undefined ? '.' + partes[1] : '');
    }

    // Onzas: máximo 2 dígitos
    if (partes[1] && partes[1].length > 2) {
      limpio = partes[0] + '.' + partes[1].slice(0, 2);
    }

    if (limpio !== value) {
      this.control.control?.setValue(limpio, { emitEvent: false });
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const regex = /^\d+(\.\d{1,2})?$/;
    if (!regex.test(value)) {
      return { peso: 'Formato inválido. Ej: 6.08 (libras.onzas)' };
    }

    const [librasStr, onzasStr] = String(value).split('.');
    const libras = parseInt(librasStr, 10);

    if (libras < 0 || libras > 20) {
      return { peso: 'Las libras deben estar entre 0 y 20' };
    }

    if (onzasStr) {
      const onzas = parseInt(onzasStr, 10);
      if (onzas < 0 || onzas > 15) {
        return { peso: 'Las onzas deben estar entre 0 y 15' };
      }
    }

    return null;
  }
}
