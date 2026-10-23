import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TabPreservationService {

  private storageKey = 'censo-camas-tab-state';

  constructor(private router: Router) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const currentUrl = event.urlAfterRedirects || event.url;
      const isLeavingCensoCamas = currentUrl !== '/censo-camas' && this.router.routerState.snapshot.url.includes('/censo-camas');

      if (isLeavingCensoCamas) {
        // Get current tab from the component - we'll store it differently
        // For now, just store the fact we're leaving
      }
    });
  }

  guardarEstado(tab: string, rutaOrigen: string): void {
    try {
      localStorage.setItem(`${this.storageKey}-${rutaOrigen}`, tab);
    } catch (e) {}
  }

  restaurarTab(rutaOrigen: string): string {
    try {
      const guardado = localStorage.getItem(`${this.storageKey}-${rutaOrigen}`);
      if (guardado) return guardado;
    } catch (e) {}
    return 'registros';
  }

  limpiar(): void {
    try { localStorage.removeItem(this.storageKey); } catch (e) {}
  }
}
