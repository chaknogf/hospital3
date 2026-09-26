import { Injectable, signal, effect } from '@angular/core';

/**
 * Gestión de temas.
 *
 * Los temas se activan cambiando un atributo en el elemento raíz:
 *   <html data-theme="current">   → tema por defecto (look actual)
 *   <html data-theme="hospital">  → tema claro (base hospital + paleta light)
 *   <html data-theme="cerulean">  → tema Cerulean (Bootswatch light)
 *   <html data-theme="cyber-brutalism"> → tema cyber-brutalism
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
/** Nombre de tema reconocido y modo de color compatible con Bootstrap. */
export interface RegisteredTheme {
  name: string;
  bsTheme: 'dark' | 'light';
}

/** Registro fuente de temas disponibles para la interfaz. */
export const REGISTERED_THEMES: RegisteredTheme[] = [
  { name: 'current', bsTheme: 'dark' },
  { name: 'hospital', bsTheme: 'light' },
  { name: 'cerulean', bsTheme: 'light' },
  { name: 'cyber-brutalism', bsTheme: 'dark' },
];

/** Unión de nombres derivada del catálogo de temas registrados. */
export type ThemeName = (typeof REGISTERED_THEMES)[number]['name'];

@Injectable({ providedIn: 'root' })
/** Aplica un tema registrado a la raíz del documento y lo conserva localmente. */
export class ThemeService {
  private readonly STORAGE_KEY = 'medicalapp-theme';

  readonly theme = signal<ThemeName>(this.load());

  constructor() {
    effect(() => this.apply(this.theme()));
  }

  get themes(): readonly RegisteredTheme[] {
    return REGISTERED_THEMES;
  }

  /** Cambia al tema solicitado solo si pertenece al catálogo registrado. */
  setTheme(name: string): void {
    if (!this.isRegistered(name)) return;
    this.theme.set(name as ThemeName);
    localStorage.setItem(this.STORAGE_KEY, name);
  }

  /** Avanza al siguiente tema siguiendo el orden del catálogo. */
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
