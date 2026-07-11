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

  @HostListener('compositionend', ['$event'])
  onCompositionEnd(event: Event) {
    this.componiendo = false;
    const value = (event.target as HTMLInputElement).value;
    this.limpiar(value, false);
  }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    if (this.componiendo) return;
    const value = (event.target as HTMLInputElement).value;
    this.limpiar(value, false);
  }

  @HostListener('blur', ['$event'])
  onBlur(event: Event) {
    const el = event.target as HTMLInputElement;
    if (!el) return;
    this.limpiar(el.value, true);
  }

  private limpiar(value: string, normalizar: boolean): void {
    let limpio: string;

    if (!this.permitirEspacios) {
      // Sin espacios: quitar todos
      limpio = value.replace(/\s/g, '');
    } else {
      // Con espacios: quitar caracteres inválidos
      limpio = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9_\s]/g, '');

      if (normalizar) {
        // Al hacer blur: quitar espacios al inicio/fin y colapsar espacios múltiples
        limpio = limpio.replace(/\s+/g, ' ').trim();
      } else {
        // Durante escritura: solo colapsar múltiples espacios consecutivos
        // (no recortar al inicio para no interrumpir mientras se escribe)
        limpio = limpio.replace(/\s{2,}/g, ' ');
      }
    }

    if (limpio !== value) {
      const input = this.control.valueAccessor as any;
      const el: HTMLInputElement = input?._elementRef?.nativeElement;
      const pos = el?.selectionStart ?? limpio.length;

      this.control.control?.setValue(limpio, { emitEvent: false });

      if (el && !normalizar) {
        // Solo restaurar cursor durante input, no en blur
        setTimeout(() => el.setSelectionRange(pos, pos), 0);
      }
    }
  }
}
