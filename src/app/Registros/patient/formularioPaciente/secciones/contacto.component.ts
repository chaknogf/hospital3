// ==================== ARCHIVO 2: contacto.component.ts ====================
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { Enumeradores } from '../../../../interface/enumsIterfaces';
import { Municipio } from '../../../../interface/interfaces';

@Component({
  selector: 'app-seccion-contacto',
  template: `
    <fieldset class="grupo contacto" [formGroup]="form">
      <legend>Contacto</legend>

      <label for="telefono">Teléfono A</label>
      <input
        id="telefono"
        type="tel"
        formControlName="telefono"
        placeholder="Teléfono A"
        autocomplete="off"
      />

      <label for="telefono2">Teléfono B</label>
      <input
        id="telefono2"
        type="tel"
        formControlName="telefono2"
        placeholder="Teléfono B"
        autocomplete="off"
      />

      <label for="telefono3">Teléfono C</label>
      <input
        id="telefono3"
        type="tel"
        formControlName="telefono3"
        placeholder="Teléfono C"
        autocomplete="off"
      />

      <label for="departamento">Departamento</label>
      <select
        id="departamento"
        formControlName="departamento"
        (change)="onDepartamentoChange()"
        [class.is-null]="!form.get('departamento')?.value"
      >
        <option value="">Seleccione departamento</option>
        <option *ngFor="let dep of enums.departamentos" [value]="dep.value">
          {{ dep.label }}
        </option>
      </select>

      <label for="municipio">Municipio</label>
      <select
        id="municipio"
        formControlName="municipio"
        [class.is-null]="!form.get('municipio')?.value"
      >
        <option value="">Seleccione municipio</option>
        <option *ngFor="let mun of municipios_direccion" [value]="mun.codigo">
          {{ mun.vecindad }}
        </option>
      </select>

      <label for="localidad">Dirección domicilio</label>
      <input
        id="localidad"
        type="text"
        formControlName="localidad"
        placeholder="Dirección"
        autocomplete="off"
      />
    </fieldset>
  `,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class SeccionContactoComponent {
  @Input() form!: FormGroup;
  @Input() municipios_direccion: Municipio[] = [];
  @Input() enums!: Enumeradores;
  @Output() departamentoChange = new EventEmitter<string>();

  onDepartamentoChange(): void {
    const depto = this.form.get('departamento')?.value;
    this.departamentoChange.emit(depto);
  }
}

