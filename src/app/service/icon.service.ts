import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as icons from '../shared/icons/svg-icon';

/** Expone los SVG del catálogo heredado como HTML confiable para plantillas. */
@Injectable({ providedIn: 'root' })
export class IconService {
  constructor(private sanitizer: DomSanitizer) { }

  /** Obtiene el SVG registrado por nombre para renderizarlo en la interfaz. */
  getIcon(name: keyof typeof icons): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icons[name]);
  }
}
