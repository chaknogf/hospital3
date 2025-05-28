import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router: Router) { }

  logout() {
    this.cerrarSesion.emit();
  }

  menu() {
    this.router.navigate(['/dash']);
  }



}
