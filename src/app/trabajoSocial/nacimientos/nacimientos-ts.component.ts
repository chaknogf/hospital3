import { Component } from '@angular/core';
import { ListaNacimientosComponent } from '../../std/nacimientos/lista-nacimientos/lista-nacimientos.component';

@Component({
  selector: 'app-nacimientos-ts',
  standalone: true,
  imports: [ListaNacimientosComponent],
  template: `<app-lista-nacimientos [sinEditar]="true" [rutaVolver]="'/TrabajoSocial'" />`
})
export class NacimientosTsComponent {}
