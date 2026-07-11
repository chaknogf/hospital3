import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ListaNacimientosComponent } from '../../std/nacimientos/lista-nacimientos/lista-nacimientos.component';

@Component({
  selector: 'app-nacimientos-ts',
  standalone: true,
  imports: [ListaNacimientosComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<app-lista-nacimientos [sinEditar]="true" [rutaVolver]="'/TrabajoSocial'" />`
})
export class NacimientosTsComponent {}
