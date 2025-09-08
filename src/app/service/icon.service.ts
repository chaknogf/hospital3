// icon.service.ts
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as icons from '../shared/icons/svg-icon';

@Injectable({ providedIn: 'root' })
export class IconService {
  constructor(private sanitizer: DomSanitizer) { }

  getIcon(name: keyof typeof icons): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icons[name]);
  }
}
