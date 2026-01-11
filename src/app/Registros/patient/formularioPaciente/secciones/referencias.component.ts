// ==================== ARCHIVO 3: referencias.component.ts ====================
import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Enumeradores } from '../../../../interface/enumsIterfaces';
import { addIcon, removeIcon } from '../../../../shared/icons/svg-icon';

@Component({
  selector: 'app-seccion-referencias',
  template: `
    <fieldset class="grupo referencias">
      <legend>Referencias</legend>
      <div [formArray]="referencias">
        <div
          *ngFor="let ref of referencias.controls; let i = index"
          [formGroupName]="i"
          class="referencia-item"
          [class.es-responsable]="ref.get('responsable')?.value"
        >
          <!-- Checkbox de Responsable -->
          <div class="checkbox-responsable">
            <label class="checkbox-label">
              <input
                type="checkbox"
                formControlName="responsable"
                (change)="marcarComoResponsable(i)"
              />
              <span class="responsable-badge" *ngIf="ref.get('responsable')?.value">
                ★ Responsable
              </span>
            </label>
          </div>

          <!-- Nombre -->
          <input
            type="text"
            formControlName="nombre"
            placeholder="Nombre de referencia"
            autocomplete="off"
          />

          <!-- Teléfono -->
          <input
            type="tel"
            formControlName="telefono"
            placeholder="Teléfono"
            autocomplete="off"
          />

          <!-- Parentesco -->
          <select formControlName="parentesco">
            <option value="">-- Seleccione --</option>
            <option *ngFor="let p of parentescos" [value]="p.value">
              {{ p.label }}
            </option>
          </select>

          <!-- Botones de acción -->
          <div class="botones justify-content-between">
            <button
              class="btn-sm btn-danger"
              type="button"
              (click)="eliminarReferencia(i)"
              [disabled]="referencias.length === 1"
            >
              <span [innerHTML]="removeIconSafe"></span>
              Eliminar
            </button>
            <button class="btn-sm btn-primary" type="button" (click)="agregarReferencia()">
              <span [innerHTML]="addIconSafe"></span>
              Agregar
            </button>
          </div>
        </div>
      </div>

      <!-- Informativo -->
      <p class="info-text">
        <small>
          💡 Marca con ★ a la persona responsable. Solo una referencia puede ser responsable.
        </small>
      </p>
    </fieldset>
  `,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class SeccionReferenciasComponent {
  @Input() mainForm!: FormGroup;
  @Input() enums!: Enumeradores;

  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);

  get referencias(): FormArray {
    return this.mainForm.get('referencias') as FormArray;
  }

  get parentescos(): any[] {
    const parentescos = this.enums.parentescos;
    if (typeof parentescos === 'object' && !Array.isArray(parentescos)) {
      return Object.values(parentescos);
    }
    return parentescos as any[];
  }

  get addIconSafe(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(addIcon);
  }

  get removeIconSafe(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(removeIcon);
  }

  agregarReferencia(): void {
    this.referencias.push(this.crearReferencia());
  }

  eliminarReferencia(i: number): void {
    const ref = this.referencias.at(i);
    if (ref.get('idpersona')?.value) {
      ref.disable(); // soft-delete
    } else {
      this.referencias.removeAt(i);
    }
  }

  marcarComoResponsable(index: number): void {
    this.referencias.controls.forEach((control, i) => {
      control.get('responsable')?.setValue(i === index);
    });
  }

  private crearReferencia(ref?: any): FormGroup {
    return this.fb.group({
      nombre: [ref?.nombre || ''],
      telefono: [ref?.telefono || ''],
      parentesco: [ref?.parentesco || ''],
      expediente: [ref?.expediente || null],
      idpersona: [ref?.idpersona || null],
      responsable: [ref?.responsable === true]
    });
  }
}
