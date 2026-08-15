import { Injectable, signal, effect } from '@angular/core';

/**
 * Gestión de temas.
 *
 * Los temas se activan cambiando un atributo en el elemento raíz:
 *   <html data-theme="current">   → tema por defecto (look actual)
 *   <html data-theme="light">     → tema de prueba claro
 *   <html data-theme="hospital">  → tema hospitalario (nuevo)
 *   <html data-theme="glass">     → tema glassmorphism (prueba de arquitectura)
 *
 * Para añadir un tema nuevo basta con registrarlo en `REGISTERED_THEMES`
 * (nombre + data-bs-theme) y definir su hoja en src/styles/themes/
 * bajo el selector `:root[data-theme="<nombre>"]`.
 *
 * Un componente NUNCA decide colores: solo usa tokens (--theme-*)
 * y el tema resuelve los valores. Este servicio solo conmuta el
 * atributo en la raíz (y ajusta data-bs-theme de bootstrap para
 * mantener la coherencia).
 */
export interface RegisteredTheme {
  name: string;
  bsTheme: 'dark' | 'light';
}

export const REGISTERED_THEMES: RegisteredTheme[] = [
  { name: 'current', bsTheme: 'dark' },
  { name: 'light', bsTheme: 'light' },
  { name: 'hospital', bsTheme: 'light' },
  { name: 'glass', bsTheme: 'dark' },
];

export type ThemeName = (typeof REGISTERED_THEMES)[number]['name'];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'medicalapp-theme';

  readonly theme = signal<ThemeName>(this.load());

  constructor() {
    effect(() => this.apply(this.theme()));
  }

  get themes(): readonly RegisteredTheme[] {
    return REGISTERED_THEMES;
  }

  setTheme(name: string): void {
    if (!this.isRegistered(name)) return;
    this.theme.set(name as ThemeName);
    localStorage.setItem(this.STORAGE_KEY, name);
  }

  toggleTheme(): void {
    const current = this.theme();
    const index = REGISTERED_THEMES.findIndex((t) => t.name === current);
    const next = REGISTERED_THEMES[(index + 1) % REGISTERED_THEMES.length];
    this.setTheme(next.name);
  }

  private isRegistered(name: string): boolean {
    return REGISTERED_THEMES.some((t) => t.name === name);
  }

  private load(): ThemeName {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return this.isRegistered(saved ?? '') ? (saved as ThemeName) : 'current';
  }

  private apply(name: ThemeName): void {
    const theme = REGISTERED_THEMES.find((t) => t.name === name) ?? REGISTERED_THEMES[0];
    document.documentElement.setAttribute('data-theme', theme.name);
    document.body.setAttribute('data-bs-theme', theme.bsTheme);
  }
}
