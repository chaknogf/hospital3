import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-reportes',
  imports: [RouterOutlet],
  templateUrl: './reportes.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
/** Contenedor de las vistas de reportes del módulo estadístico. */
export class ReportesComponent {}
