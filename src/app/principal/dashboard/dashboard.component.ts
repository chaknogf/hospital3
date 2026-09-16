import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconService } from '../../service/icon.service';
import { ConsultaService } from '../../registros/consultas/consultas.service';
import { TotalesItem } from '../../interface/consultas';
import { Subject, takeUntil, finalize } from 'rxjs';

interface Modulo {
  nombre: string;
  descripcion: string;
  ruta: string;
  icon: string;
  color?: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule]
})
export class DashboardComponent implements OnInit, OnDestroy {

  private router = inject(Router);
  private iconS = inject(IconService);
  private consultaService = inject(ConsultaService);
  private destroy$ = new Subject<void>();

  icons: { [key: string]: SafeHtml } = {};
  modulos: Modulo[] = [];

  totales = signal<TotalesItem[]>([]);
  isLoadingTotales = signal(true);
  generatedAt = signal('');

  readonly ahora = new Date();
  readonly greeting = this.getGreeting();

  private getGreeting(): string {
    const h = this.ahora.getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  get fechaFormateada(): string {
    return this.ahora.toLocaleDateString('es-GT', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  get horaFormateada(): string {
    return this.ahora.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
  }

  constructor() {
    this.icons = {
      pacientes: this.iconS.getIcon('tarjetaPaciente'),
      datosIcon: this.iconS.getIcon('datosIcon'),
      logoicon: this.iconS.getIcon('logoicon'),
      rocket: this.iconS.getIcon('rocketIcon'),
      nutric: this.iconS.getIcon('nutritionIcon'),
      diente: this.iconS.getIcon('dienteIcon'),
      consultas: this.iconS.getIcon('consultaMedica'),
      doctor: this.iconS.getIcon('doctorIcon'),
    };
  }

  ngOnInit(): void {
    this.modulos = [
      { nombre: 'Registros Medicos', descripcion: 'Gestión de pacientes y registros médicos', ruta: '/registros', icon: 'pacientes', color: '#3b82f6' },
      { nombre: 'Medicos', descripcion: 'Gestión de consulta médica', ruta: '/clinica', icon: 'consultas', color: '#34d399' },
      { nombre: 'UISAU', descripcion: 'Gestor de Atención al Usuario', ruta: '/uisau', icon: 'datosIcon', color: '#818cf8' },
      { nombre: 'Trabajo Social', descripcion: 'Módulo de trabajo social', ruta: '/TrabajoSocial', icon: 'logoicon', color: '#e879f9' },
      { nombre: 'Estadística', descripcion: 'Reportes y datos estadísticos', ruta: '/estadistica', icon: 'datosIcon', color: '#22d3ee' },
      { nombre: 'Nutrición', descripcion: 'Gestor de nutrición', ruta: '/menu-nutri', icon: 'nutric', color: '#fbbf24' },
      { nombre: 'Odontología', descripcion: 'Gestor de odontología', ruta: '/menu-odonto', icon: 'diente', color: '#f472b6' },
      { nombre: 'Huston', descripcion: 'Panel de Control', ruta: '/adminsys', icon: 'rocket', color: '#a78bfa' },
    ];

    this.loadTotales();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  navegar(ruta: string): void {
    this.router.navigate([ruta]);
  }

  private loadTotales(): void {
    this.isLoadingTotales.set(true);
    this.consultaService.getTotales()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingTotales.set(false))
      )
      .subscribe({
        next: (res) => {
          this.totales.set(res.totales);
          if (res.generado_en) {
            this.generatedAt.set(
              new Date(res.generado_en).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })
            );
          }
        },
        error: () => {
          this.totales.set([]);
        }
      });
  }

  trackByEntidad(_index: number, item: TotalesItem): string {
    return item.entidad;
  }

  trackByModulo(_index: number, item: Modulo): string {
    return item.ruta;
  }

  colorForIndex(i: number): string {
    const palette = ['#3b82f6', '#818cf8', '#e879f9', '#22d3ee', '#34d399', '#fbbf24', '#f472b6', '#a78bfa'];
    return palette[i % palette.length];
  }
}
