import { Directive, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[unaPalabra]',
  standalone: true
})
export class UnaPalabraDirective {
  @Input() permitirEspacios = false;
  private componiendo = false;

  constructor(private control: NgControl) { }

  @HostListener('compositionstart')
  onCompositionStart() {
    this.componiendo = true;
  }

  @HostListener('compositionend', ['$event.target.value'])
  onCompositionEnd(value: string) {
    this.componiendo = false;
    this.limpiar(value);
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    if (this.componiendo) return; // esperar a que termine la composición
    this.limpiar(value);
  }

  private limpiar(value: string): void {
    const sinEspacios = this.permitirEspacios
      ? value
      : value.replace(/\s/g, '');

    const limpio = sinEspacios.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9_\s]/g, '');

    if (limpio !== value) {
      // Preservar posición del cursor
      const input = this.control.valueAccessor as any;
      const el: HTMLInputElement = input?._elementRef?.nativeElement;
      const pos = el?.selectionStart ?? limpio.length;

      this.control.control?.setValue(limpio, { emitEvent: false });

      // Restaurar cursor después del re-render
      if (el) {
        setTimeout(() => el.setSelectionRange(pos, pos), 0);
      }
    }
  }
}
