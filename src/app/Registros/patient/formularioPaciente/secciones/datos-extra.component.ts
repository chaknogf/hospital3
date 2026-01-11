// ==================== ARCHIVO 5: datos-extra.component.ts ====================
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { Enumeradores } from '../../../../interface/enumsIterfaces';
import { PaisesIso, Municipio } from '../../../../interface/interfaces';

@Component({
  selector: 'app-seccion-datos-extra',
  template: `
    <fieldset class="grupo datos-extra" [formGroup]="form">
      <legend>Datos Extra</legend>

      <!-- Defunción y CUI Persona -->
      <div class="d-flex gap-3">
        <div style="flex: 1">
          <label for="defuncion">Defunción</label>
          <input
            id="defuncion"
            type="text"
            formControlName="defuncion"
            placeholder="Información de defunción"
          />
        </div>
        <div style="flex: 1">
          <label for="cuipersona">CUI Persona</label>
          <input
            id="cuipersona"
            type="text"
            formControlName="cuipersona"
            placeholder="CUI"
          />
        </div>
      </div>

      <!-- DEMOGRÁFICOS -->
      <fieldset [formGroup]="demograficosForm" class="sub-fieldset">
        <legend>Información Demográfica</legend>

        <div>
          <label for="nacionalidad">Nacionalidad</label>
          <select
            id="nacionalidad"
            formControlName="nacionalidad"
            [ngClass]="
              form.get('demograficos.nacionalidad')?.value
                ? 'is-valid'
                : 'is-null'
            "
          >
            <option value="">Seleccione nacionalidad</option>
            <option *ngFor="let n of paisesIso" [value]="n.codigo_iso3">
              {{ n.nombre }}
            </option>
          </select>
        </div>

        <div>
          <label for="estado_civil">Estado Civil</label>
          <select
            id="estado_civil"
            formControlName="estado_civil"
            [ngClass]="
              form.get('demograficos.estado_civil')?.value
                ? 'is-valid'
                : 'is-null'
            "
          >
            <option value="">Seleccione</option>
            <option *ngFor="let ec of enums.estadocivil" [value]="ec.value">
              {{ ec.label }}
            </option>
          </select>
        </div>

        <div>
          <label for="pueblo">Pueblo</label>
          <select
            id="pueblo"
            formControlName="pueblo"
            [ngClass]="
              form.get('demograficos.pueblo')?.value ? 'is-valid' : 'is-null'
            "
          >
            <option value="">Seleccione</option>
            <option *ngFor="let p of enums.pueblos" [value]="p.value">
              {{ p.label }}
            </option>
          </select>
        </div>

        <div>
          <label for="idioma">Idioma</label>
          <select
            id="idioma"
            formControlName="idioma"
            [ngClass]="
              form.get('demograficos.idioma')?.value ? 'is-valid' : 'is-null'
            "
          >
            <option value="">Seleccione</option>
            <option *ngFor="let i of enums.idiomas" [value]="i.value">
              {{ i.label }}
            </option>
          </select>
        </div>

        <!-- Lugar de Nacimiento (para extranjeros) -->
        <div *ngIf="form.get('demograficos.nacionalidad')?.value !== 'GTM'">
          <label for="lugar_nacimiento">Lugar de Nacimiento</label>
          <input
            id="lugar_nacimiento"
            type="text"
            formControlName="lugar_nacimiento"
            placeholder="País/Lugar"
          />
        </div>

        <!-- Departamento Nacimiento (para guatemaltecos) -->
        <div *ngIf="form.get('demograficos.nacionalidad')?.value === 'GTM'">
          <label for="departamento_nacimiento">Departamento Nacimiento</label>
          <select
            id="departamento_nacimiento"
            formControlName="departamento_nacimiento"
            (change)="onDepartamentoNacimientoChange()"
          >
            <option value="">Seleccione</option>
            <option *ngFor="let dep of enums.departamentos" [value]="dep.value">
              {{ dep.label }}
            </option>
          </select>
        </div>

        <!-- Municipio Nacimiento (para guatemaltecos) -->
        <div *ngIf="form.get('demograficos.nacionalidad')?.value === 'GTM'">
          <label for="municipio_nacimiento">Municipio Nacimiento</label>
          <select id="municipio_nacimiento" formControlName="municipio_nacimiento">
            <option value="">Seleccione</option>
            <option *ngFor="let mun of municipios_nacimiento" [value]="mun.codigo">
              {{ mun.municipio }}
            </option>
          </select>
        </div>
      </fieldset>

      <!-- SOCIOECONÓMICOS -->
      <fieldset [formGroup]="socioeconomicosForm" class="sub-fieldset">
        <legend>Información Socioeconómica</legend>

        <div>
          <label for="ocupacion">Ocupación</label>
          <input
            id="ocupacion"
            type="text"
            formControlName="ocupacion"
            [ngClass]="
              form.get('socioeconomicos.ocupacion')?.value
                ? 'is-valid'
                : 'is-null'
            "
            placeholder="Ocupación"
          />
        </div>

        <div>
          <label for="nivel_educativo">Nivel Educativo</label>
          <select
            id="nivel_educativo"
            formControlName="nivel_educativo"
            [ngClass]="
              form.get('socioeconomicos.nivel_educativo')?.value
                ? 'is-valid'
                : 'is-null'
            "
          >
            <option value="">Seleccione</option>
            <option *ngFor="let ne of enums.gradoacademico" [value]="ne.value">
              {{ ne.label }}
            </option>
          </select>
        </div>

        <!-- Toggles de Sí/No -->
        <div class="d-flex gap-3">
          <!-- Estudiante Público -->
          <div class="toggle-group" style="flex: 1">
            <label>Estudiante Público</label>
            <div class="toggle-buttons">
              <button
                type="button"
                [class.active]="form.get('socioeconomicos.estudiante_publico')?.value === 'SI'"
                (click)="
                  form.get('socioeconomicos.estudiante_publico')?.setValue('SI')
                "
              >
                Sí
              </button>
              <button
                type="button"
                [class.active]="form.get('socioeconomicos.estudiante_publico')?.value === 'NO'"
                (click)="
                  form.get('socioeconomicos.estudiante_publico')?.setValue('NO')
                "
              >
                No
              </button>
            </div>
          </div>

          <!-- Empleado Público -->
          <div class="toggle-group" style="flex: 1">
            <label>Empleado Público</label>
            <div class="toggle-buttons">
              <button
                type="button"
                [class.active]="form.get('socioeconomicos.empleado_publico')?.value === 'SI'"
                (click)="
                  form.get('socioeconomicos.empleado_publico')?.setValue('SI')
                "
              >
                Sí
              </button>
              <button
                type="button"
                [class.active]="form.get('socioeconomicos.empleado_publico')?.value === 'NO'"
                (click)="
                  form.get('socioeconomicos.empleado_publico')?.setValue('NO')
                "
              >
                No
              </button>
            </div>
          </div>

          <!-- Discapacidad -->
          <div class="toggle-group" style="flex: 1">
            <label>Discapacidad</label>
            <div class="toggle-buttons">
              <button
                type="button"
                [class.active]="form.get('socioeconomicos.discapacidad')?.value === 'SI'"
                (click)="form.get('socioeconomicos.discapacidad')?.setValue('SI')"
              >
                Sí
              </button>
              <button
                type="button"
                [class.active]="form.get('socioeconomicos.discapacidad')?.value === 'NO'"
                (click)="form.get('socioeconomicos.discapacidad')?.setValue('NO')"
              >
                No
              </button>
            </div>
          </div>
        </div>
      </fieldset>

      <!-- NEONATALES -->
      <fieldset
        *ngIf="esRecienNacido"
        [formGroup]="neonatalesForm"
        class="sub-fieldset"
      >
        <legend>Datos de Nacimiento (Recién Nacido)</legend>

        <div>
          <label for="peso_nacimiento">Peso Nacimiento (libras.onzas)</label>
          <input
            id="peso_nacimiento"
            type="text"
            formControlName="peso_nacimiento"
            placeholder="Ej: 3.08"
          />
        </div>

        <div>
          <label for="edad_gestacional">Edad Gestacional (semanas)</label>
          <input
            id="edad_gestacional"
            type="text"
            formControlName="edad_gestacional"
            placeholder="Ej: 40"
          />
        </div>

        <div>
          <label for="parto">Tipo de Parto</label>
          <select id="parto" formControlName="parto">
            <option value="">Seleccione</option>
            <option value="P">Vaginal</option>
            <option value="C">Cesárea</option>
          </select>
        </div>

        <div>
          <label for="gemelo">Número de Gemelo</label>
          <input
            id="gemelo"
            type="text"
            formControlName="gemelo"
            placeholder="Ej: 1"
          />
        </div>

        <div>
          <label for="expediente_madre">Expediente de la Madre</label>
          <input
            id="expediente_madre"
            type="text"
            formControlName="expediente_madre"
            placeholder="Ej: 12345"
          />
        </div>
      </fieldset>
    </fieldset>
  `,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class SeccionDatosExtraComponent {
  @Input() form!: FormGroup;
  @Input() paisesIso: PaisesIso[] = [];
  @Input() enums!: Enumeradores;
  @Input() esRecienNacido: boolean = false;
  @Input() municipios_nacimiento: Municipio[] = [];
  @Output() departamentoNacimientoChange = new EventEmitter<string>();

  get demograficosForm(): FormGroup {
    return this.form.get('demograficos') as FormGroup;
  }

  get socioeconomicosForm(): FormGroup {
    return this.form.get('socioeconomicos') as FormGroup;
  }

  get neonatalesForm(): FormGroup {
    return this.form.get('neonatales') as FormGroup;
  }

  onDepartamentoNacimientoChange(): void {
    const depto = this.form.get('demograficos.departamento_nacimiento')?.value;
    this.departamentoNacimientoChange.emit(depto);
  }
}
