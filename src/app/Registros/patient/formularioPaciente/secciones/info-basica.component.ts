// ==================== ARCHIVO 1: info-basica.component.ts ====================
import { Component, Input, OnInit, inject, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PacienteUtilService } from '../../../../service/paciente-util.service';
import { Enumeradores } from '../../../../interface/enumsIterfaces';
import { Municipio } from '../../../../interface/interfaces';

@Component({
  selector: 'app-seccion-info-basica',
  template: `
    <fieldset class="grupo info-basica">
      <legend>Información básica</legend>

      <!-- Sexo -->
      <label for="sexo">Sexo</label>
      <select
        id="sexo"
        [formControl]="mainForm.get('sexo')!"
        [class.is-null]="!mainForm.get('sexo')?.value"
      >
        <option value="">Seleccione sexo</option>
        <option value="M">Masculino</option>
        <option value="F">Femenino</option>
      </select>

      <!-- Fecha de nacimiento -->
      <label for="fecha_nacimiento">Fecha de nacimiento</label>
      <input
        id="fecha_nacimiento"
        type="date"
        [formControl]="mainForm.get('fecha_nacimiento')!"
        [ngClass]="mainForm.get('fecha_nacimiento')?.value ? 'is-valid' : 'is-null'"
      />

      <!-- Edad -->
      <legend>Edad</legend>
      <div class="edad" [formGroup]="edadForm">
        <div class="edad-grupo fila-completa">
          <label for="anios">Años</label>
          <input
            id="anios"
            type="number"
            formControlName="anios"
            placeholder="Años"
            min="0"
            [ngClass]="
              mainForm.get('fecha_nacimiento')?.value ? 'is-valid' : 'is-null'
            "
          />
        </div>

        <div class="edad-fila">
          <div class="edad-grupo">
            <label for="meses">Meses</label>
            <input
              id="meses"
              type="number"
              formControlName="meses"
              placeholder="Meses"
              min="0"
              max="11"
              [ngClass]="
                mainForm.get('fecha_nacimiento')?.value ? 'is-valid' : 'is-null'
              "
            />
          </div>

          <div class="edad-grupo">
            <label for="dias">Días</label>
            <input
              id="dias"
              type="number"
              formControlName="dias"
              placeholder="Días"
              min="0"
              max="30"
              [ngClass]="
                mainForm.get('fecha_nacimiento')?.value ? 'is-valid' : 'is-null'
              "
            />
          </div>
        </div>
      </div>

      <!-- Lugar de Nacimiento -->
      <legend>Lugar de Nacimiento</legend>

      <!-- Caso 1: Con CUI y Guatemalteco -->
      <ng-container
        *ngIf="
          mainForm.get('cui')?.value &&
          mainForm.get('datos_extra.demograficos.nacionalidad')?.value === 'GTM'
        "
      >
        <div class="input-50" [formGroup]="lugarNacimientoForm">
          <div>
            <label>Departamento</label>
            <select formControlName="departamento_nacimiento" disabled>
              <option
                *ngFor="let dep of enums.departamentos"
                [value]="dep.value"
              >
                {{ dep.label }}
              </option>
            </select>
          </div>
          <div>
            <label>Municipio</label>
            <select formControlName="municipio_nacimiento" disabled>
              <option
                *ngFor="let mun of municipios_nacimiento"
                [value]="mun.codigo"
              >
                {{ mun.municipio }}
              </option>
            </select>
          </div>
        </div>
      </ng-container>

      <!-- Caso 2: Sin CUI y Guatemalteco -->
      <ng-container
        *ngIf="
          !mainForm.get('cui')?.value &&
          mainForm.get('datos_extra.demograficos.nacionalidad')?.value === 'GTM'
        "
      >
        <div class="input-50" [formGroup]="lugarNacimientoForm">
          <div>
            <label>Departamento</label>
            <select
              formControlName="departamento_nacimiento"
              (change)="onDepartamentoNacimientoChange()"
            >
              <option value="">Seleccione</option>
              <option
                *ngFor="let dep of enums.departamentos"
                [value]="dep.value"
              >
                {{ dep.label }}
              </option>
            </select>
          </div>
          <div>
            <label>Municipio</label>
            <select formControlName="municipio_nacimiento">
              <option value="">Seleccione</option>
              <option
                *ngFor="let mun of municipios_nacimiento"
                [value]="mun.codigo"
              >
                {{ mun.municipio }}
              </option>
            </select>
          </div>
        </div>
      </ng-container>

      <!-- Caso 3: Extranjero -->
      <ng-container
        *ngIf="
          mainForm.get('datos_extra.demograficos.nacionalidad')?.value !== 'GTM'
        "
      >
        <div [formGroup]="lugarNacimientoForm">
          <label for="lugar_nacimiento">Lugar de Nacimiento</label>
          <input
            id="lugar_nacimiento"
            type="text"
            formControlName="lugar_nacimiento"
            placeholder="País/Lugar de nacimiento"
          />
        </div>
      </ng-container>
    </fieldset>
  `,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class SeccionInfoBasicaComponent implements OnInit, OnDestroy {
  @Input() mainForm!: FormGroup;
  @Input() municipios_nacimiento: Municipio[] = [];
  @Input() enums!: Enumeradores;
  @Output() esRecienNacidoChange = new EventEmitter<boolean>();

  private pacienteUtil = inject(PacienteUtilService);
  private destroy$ = new Subject<void>();
  private actualizandoFecha = false;
  private actualizandoEdad = false;

  get edadForm(): FormGroup {
    return this.mainForm.get('edad') as FormGroup;
  }

  get lugarNacimientoForm(): FormGroup {
    return this.mainForm.get('datos_extra.demograficos') as FormGroup;
  }

  ngOnInit(): void {
    this.configurarSuscripciones();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private configurarSuscripciones(): void {
    // Edad → Fecha
    combineLatest([
      this.edadForm.get('anios')!.valueChanges,
      this.edadForm.get('meses')!.valueChanges,
      this.edadForm.get('dias')!.valueChanges
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.actualizandoEdad) {
          this.calcularFecha();
        }
      });

    // Fecha → Edad
    this.mainForm.get('fecha_nacimiento')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(fechaStr => {
        if (!this.actualizandoFecha && fechaStr) {
          this.calcularEdad();
        }
      });
  }

  calcularFecha(): void {
    this.actualizandoEdad = true;
    const edad = this.edadForm.value;
    const fecha = this.pacienteUtil.calcularFechaDesdeEdad(edad);
    this.mainForm.get('fecha_nacimiento')?.setValue(fecha, { emitEvent: false });
    this.actualizandoEdad = false;
  }

  calcularEdad(): void {
    this.actualizandoFecha = true;
    const fechaNacimiento = this.mainForm.get('fecha_nacimiento')?.value;
    const edad = this.pacienteUtil.calcularEdad(fechaNacimiento);
    this.edadForm.patchValue(edad, { emitEvent: false });

    const rn = this.pacienteUtil.validarRecienNacido(fechaNacimiento);
    this.esRecienNacidoChange.emit(rn.recienNacido);

    this.actualizandoFecha = false;
  }

  onDepartamentoNacimientoChange(): void {
    // Notificar cambio si es necesario
  }
}

