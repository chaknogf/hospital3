import { Component, Input, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICON_SVG } from '../icons/icon-map';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `<span [innerHTML]="svg" style="display:inline-flex;align-items:center"></span>`
})
export class AppIconComponent {
  @Input() name!: string;
  @Input() size: string | number = 24;
  @Input() color?: string;

  private sanitizer = inject(DomSanitizer);

  get svg(): SafeHtml {
    const raw = ICON_SVG[this.name] || '';
    if (!raw) return '';
    const attrs = [`width="${this.size}"`, `height="${this.size}"`];
    if (this.color) attrs.push(`color="${this.color}"`);
    const styled = raw.replace('<svg', `<svg ${attrs.join(' ')}`);
    return this.sanitizer.bypassSecurityTrustHtml(styled);
  }
}
