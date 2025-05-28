import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './principal/navbar/navbar.component';
import { HomeComponent } from './principal/home/home.component';
import { ApiService } from './service/api.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'medicalApp';
  estaAutenticado = false;
  username = '';
  role = '';

  constructor(private router: Router, private api: ApiService) { }

  ngOnInit() {
    this.detectarRuta();

    this.username = localStorage.getItem('username') || '';
    this.role = 'Rol: ' + localStorage.getItem('role') || '';
    if (this.username) {
      this.estaAutenticado = true;
    }
  }

  detectarRuta() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((evento) => {
        const url = evento.urlAfterRedirects;
        // console.log('Ruta actual:', url);

        if (url === '/' || url.includes('/inicio')) {
          this.estaAutenticado = false;
        } else {
          this.estaAutenticado = true;
        }
      });
  }

  desconectarUsuario() {
    console.log('Cerrando sesión...');

    this.api.logOut();

  }
}
