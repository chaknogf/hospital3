// ==================== ARCHIVO 1: nombres.component.ts ====================
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { UnaPalabraDirective } from '../../../../directives/unaPalabra.directive';

@Component({
  selector: 'app-seccion-nombres',
  template: `
    <fieldset class="grupo nombres" [formGroup]="form">
      <legend>Nombre</legend>

      <label for="primer_nombre">Primer Nombre</label>
      <input
        id="primer_nombre"
        [formControl]="form.get('primer_nombre')!"
        placeholder="Primer nombre"
        unaPalabra
        autocomplete="off"
      />

      <label for="segundo_nombre">Segundo Nombre</label>
      <input
        id="segundo_nombre"
        [formControl]="form.get('segundo_nombre')!"
        placeholder="Segundo nombre"
        unaPalabra
        autocomplete="off"
      />

      <label for="otro_nombre">Otro Nombre</label>
      <input
        id="otro_nombre"
        [formControl]="form.get('otro_nombre')!"
        placeholder="Otro nombre"
        autocomplete="off"
      />

      <label for="primer_apellido">Primer Apellido</label>
      <input
        id="primer_apellido"
        [formControl]="form.get('primer_apellido')!"
        placeholder="Apellido primero"
        unaPalabra
        autocomplete="off"
      />

      <label for="segundo_apellido">Segundo Apellido</label>
      <input
        id="segundo_apellido"
        [formControl]="form.get('segundo_apellido')!"
        placeholder="Apellido segundo"
        unaPalabra
        autocomplete="off"
      />

      <!-- Apellido de casada (solo si es mujer) -->
      <ng-container *ngIf="sexo === 'F'">
        <label for="apellido_casada">Apellido de casada</label>
        <input
          id="apellido_casada"
          [formControl]="form.get('apellido_casada')!"
          placeholder="Apellido casada"
          autocomplete="off"
        />
      </ng-container>
    </fieldset>
  `,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, UnaPalabraDirective]
})
export class SeccionNombresComponent {
  @Input() form!: FormGroup;
  @Input() sexo: string = '';
}
