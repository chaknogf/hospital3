// historial.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Metadata } from '../../../../interface/interfaces';

@Component({
  selector: 'app-seccion-historial',
  template: `
    <fieldset>
      <legend>Historial de registros</legend>
      <ul
        class="historial-grid"
        *ngIf="metadatos.length > 0; else sinHistorial"
      >
        <li class="meta" *ngFor="let meta of metadatos">
          <strong>{{ meta?.creado_por }}</strong>
          <br />
          <small>[{{ meta?.creado_en | date : "short" }}]</small>
        </li>
      </ul>
      <ng-template #sinHistorial>
        <p class="text-muted">Sin historial de registros</p>
      </ng-template>
    </fieldset>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class SeccionHistorialComponent {
  @Input() metadatos: Metadata[] = [];
}
