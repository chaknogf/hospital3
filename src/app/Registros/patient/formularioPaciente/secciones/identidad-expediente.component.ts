// identidad-expediente.component.ts
import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { removeIcon } from '../../../../shared/icons/svg-icon';

@Component({
  selector: 'app-seccion-identidad-expediente',
  template: `
    <fieldset class="grupo identificadores">
      <legend>Opciones del Expediente</legend>

      <!-- Toggle para edición -->
      <div *ngIf="enEdicion" class="toggle-buttons justify-content-center">
        <button
          [class.active]="accionExpediente === 'mantener'"
          type="button"
          class="btn"
          (click)="onAccionExpediente('mantener')"
        >
          Mantener
        </button>
        <button
          [class.active]="accionExpediente === 'generar'"
          type="button"
          class="btn"
          (click)="onAccionExpediente('generar')"
        >
          Generar
        </button>
        <button
          [class.active]="accionExpediente === 'sobrescribir'"
          type="button"
          class="btn"
          (click)="onAccionExpediente('sobrescribir')"
        >
          Sobrescribir
        </button>
      </div>

      <!-- Toggle para creación -->
      <div *ngIf="!enEdicion" class="toggle-buttons justify-content-center">
        <button
          [class.active]="!crearExpediente"
          type="button"
          class="btn"
          (click)="onCrearExpediente(false)"
        >
          Sin Expediente
        </button>
        <button
          [class.active]="crearExpediente"
          type="button"
          class="btn"
          (click)="onCrearExpediente(true)"
        >
          Con Expediente
        </button>
      </div>

      <legend>Identificadores</legend>

      <!-- CUI -->
      <label for="cui">CUI</label>
      <input
        id="cui"
        type="text"
        [formControl]="form.get('cui')!"
        placeholder="1234 56789 9999"
        mask="0000 00000 0000"
        (paste)="onPasteCUI($event)"
      />
      <div class="error" *ngIf="form.get('cui')?.errors?.['validarDPI']">
        El CUI debe tener exactamente 13 dígitos
      </div>

      <!-- Expediente (solo en edición) -->
      <ng-container *ngIf="enEdicion && form.get('expediente')?.value">
        <label for="expediente">Expediente</label>
        <input
          id="expediente"
          type="text"
          [formControl]="form.get('expediente')!"
          placeholder="Número de expediente"
          disabled
          autocomplete="off"
        />
      </ng-container>

      <!-- Pasaporte (si no es guatemalteco) -->
      <ng-container *ngIf="form.get('datos_extra.demograficos.nacionalidad')?.value !== 'GTM'">
        <label for="pasaporte">Pasaporte</label>
        <input
          id="pasaporte"
          type="text"
          [formControl]="form.get('pasaporte')!"
          placeholder="Ingresa el pasaporte"
          autocomplete="off"
        />
      </ng-container>

      <!-- Otra identificación (si no tiene CUI) -->
      <ng-container *ngIf="!form.get('cui')?.value">
        <label for="otro">Otra Identificación</label>
        <input
          id="otro"
          type="text"
          [formControl]="form.get('otro')!"
          placeholder="Constancia de Nacimiento"
          autocomplete="off"
        />
      </ng-container>

      <!-- Estado -->
      <legend>Estado</legend>
      <select [formControl]="form.get('estado')!">
        <option value="V">Vivo</option>
        <option value="F">Muerto</option>
      </select>

      <!-- Biométricos -->
      <legend>Biométricos</legend>
      <div class="biometricos">
        <div class="biometricos-contenedor">
          <div class="biometrico-foto">
            <h6 class="biometrico-label">Foto</h6>
          </div>
          <div class="biometrico-huella">
            <h6 class="biometrico-label">Huella</h6>
          </div>
        </div>
      </div>
    </fieldset>
  `,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxMaskDirective],
  providers: [provideNgxMask()]
})
export class SeccionIdentidadExpedienteComponent {
  @Input() form!: FormGroup;
  @Input() enEdicion: boolean = false;
  @Input() crearExpediente: boolean = false;
  @Input() accionExpediente: string = 'mantener';

  constructor(private sanitizer: DomSanitizer) { }

  onAccionExpediente(accion: string): void {
    // Emitir cambio al padre si es necesario
  }

  onCrearExpediente(crear: boolean): void {
    // Emitir cambio al padre si es necesario
  }

  onPasteCUI(event: ClipboardEvent): void {
    event.preventDefault();
    const paste = event.clipboardData?.getData('text') || '';
    const input = event.target as HTMLInputElement;
    const numbers = paste.replace(/\D/g, '').slice(0, 13);

    input.value = numbers.replace(/(\d{4})(\d{0,5})(\d{0,4})/, (_, p1, p2, p3) => {
      return [p1, p2, p3].filter(Boolean).join(' ');
    });

    this.form.get('cui')?.setValue(numbers, { emitEvent: false });
  }
}
