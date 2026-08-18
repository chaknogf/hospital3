import { logoicon2, logoicon } from './../../shared/icons/svg-icon';
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { ThemeService, ThemeName } from '../../service/theme.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
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

  readonly currentTheme: Signal<ThemeName>;

  private readonly THEME_LABELS: Record<string, string> = {
    current: 'Predeterminado',
    hospital: 'Hospital',
    neumorfismo: 'Neumorfismo',
    'cyber-brutalism': 'Cyber',
  };
  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private themeService: ThemeService
  ) {
    this.logoicon = this.sanitizarSvg(logoicon);
    this.logoicon2 = this.sanitizarSvg(logoicon2);
    this.currentTheme = this.themeService.theme;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  themeLabel(): string {
    return this.THEME_LABELS[this.currentTheme()] ?? this.currentTheme();
  }

  logout() {
    this.cerrarSesion.emit();
  }

  menu() {
    this.router.navigate(['/dash']);
  }



}
