import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[soloNumero]',
  standalone: true
})
export class SoloNumeroDirective {
  constructor(private control: NgControl) { }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    // Elimina todo lo que no sea número o punto
    const soloNumerosYPunto = value.replace(/[^0-9.]/g, '');

    // Evita múltiples puntos (opcional)
    const partes = soloNumerosYPunto.split('.');
    let valorFinal = partes.shift() || '';
    if (partes.length > 0) {
      valorFinal += '.' + partes.join('');
    }

    if (valorFinal !== value) {
      this.control.control?.setValue(valorFinal);
    }
  }
}
