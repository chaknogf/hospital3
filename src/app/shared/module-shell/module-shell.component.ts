import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SafeHtml } from '@angular/platform-browser';
import { IconService } from '../../service/icon.service';
import { menuColor } from '../module-menu';
import { ModuleNavConfig } from '../module-nav';

const EMPTY_NAV: ModuleNavConfig = {
  title: 'Módulo',
  subtitle: '',
  accent: '#5f72ed',
  items: [],
};

/** Layout compartido de módulos: barra lateral fija y rutas hijas. */
@Component({
  selector: 'app-module-shell',
  templateUrl: './module-shell.component.html',
  styleUrls: ['./module-shell.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterModule],
})
export class ModuleShellComponent {
  private route = inject(ActivatedRoute);
  private iconS = inject(IconService);

  readonly config: ModuleNavConfig = this.route.snapshot.data['module'] ?? EMPTY_NAV;
  readonly menuColor = menuColor;
  readonly sidebarAbierta = signal(false);
  readonly icons: Record<string, SafeHtml> = {};

  constructor() {
    this.icons['menu'] = this.iconS.getIcon('menuIcon');
    this.icons['regresar'] = this.iconS.getIcon('backIcon');

    for (const item of this.config.items) {
      this.icons[item.icon] = this.iconS.getIcon(item.icon);
    }
  }

  alternarSidebar(): void {
    this.sidebarAbierta.update((abierta) => !abierta);
  }

  cerrarSidebar(): void {
    this.sidebarAbierta.set(false);
  }
}
