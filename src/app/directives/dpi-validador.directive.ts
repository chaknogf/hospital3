import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[validarDPI]',
  standalone: true
})
export class DpiValidadorDirective {
  constructor(private control: NgControl) { }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    const soloNumeros = value.replace(/\D/g, '').slice(0, 13);
    if (soloNumeros !== value) {
      this.control.control?.setValue(soloNumeros);
    }
  }
}
