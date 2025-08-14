import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { svgHome } from '../svg-home/svg';
import { logoicon } from '../../shared/icons/svg-icon';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  // styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule, LoginComponent],
})
export class HomeComponent implements OnInit {
  private sanitizarSvg(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  svgHome: SafeHtml = svgHome
  logoicon: SafeHtml = logoicon
  constructor(
    private sanitizer: DomSanitizer
  ) {
    this.svgHome = this.sanitizarSvg(svgHome);
    this.logoicon = this.sanitizarSvg(logoicon);
  }

  ngOnInit() {
  }

  visible = signal(false);

  open() {
    this.visible.set(true);
  }

  close() {
    this.visible.set(false);
  }

}

