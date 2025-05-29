import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[unaPalabra]',
  standalone: true
})
export class UnaPalabraDirective {
  constructor(private control: NgControl) { }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    // Elimina todos los espacios
    const sinEspacios = value.replace(/\s/g, '');

    // Solo conserva letras, números y guiones bajos (opcional)
    const soloUnaPalabra = sinEspacios.replace(/[^a-zA-Z0-9_]/g, '');

    if (soloUnaPalabra !== value) {
      this.control.control?.setValue(soloUnaPalabra);
    }
  }
}
