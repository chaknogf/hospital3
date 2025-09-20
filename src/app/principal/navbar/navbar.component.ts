import { logoicon2, logoicon } from './../../shared/icons/svg-icon';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true
})
export class NavbarComponent {
  @Input() usuario: string = 'usuario';
  @Input() rol: string = 'rol';
  @Output() cerrarSesion = new EventEmitter<void>();
  private sanitizarSvg(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  logoicon: SafeHtml = logoicon
  logoicon2: SafeHtml = logoicon2

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.logoicon = this.sanitizarSvg(logoicon);
    this.logoicon2 = this.sanitizarSvg(logoicon2);
  }

  logout() {
    this.cerrarSesion.emit();
  }

  menu() {
    this.router.navigate(['/dash']);
  }



}
