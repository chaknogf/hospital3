import { Location } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { PersonalAtencionCreate, PersonalAtencionOut, PersonalAtencionUpdate } from '../../../interface/personal_atencion.interface';
import { PersonalAtencionService, EspecialidadItem } from '../personal_atencion.service';
import { IconService } from '../../../service/icon.service';


@Component({
  selector: 'app-doctorForm',
  templateUrl: './doctorForm.component.html',
  styleUrls: ['./doctorForm.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    ReactiveFormsModule
]
})
/** Formulario para registrar o actualizar datos de personal médico. */
export class DoctorFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  // ======= DATA =======

  medicoId: number | null = null;
  medicoActual: PersonalAtencionOut | null = null;

  especialidades: EspecialidadItem[] = [];
  cargando = false;
  guardando = false;

  enEdicion = false;

  // ======= FORM =======

  form: FormGroup = this.fb.group({

    nombre: ['', [
      Validators.required,
      Validators.minLength(4)
    ]],
    colegiado: [''],
    pasaporte: [''],
    especialidad_id: [null],
    dpi: [''],
    sexo: [''],
    activo: [true]

  });

  // ======= ICONOS =======

  saveIcon: any;
  cancelIcon: any;

  constructor(
    private api: PersonalAtencionService,
    private iconService: IconService
  ) {

    this.saveIcon = this.iconService.getIcon('saveIcon');
    this.cancelIcon = this.iconService.getIcon('cancelIcon');
  }

  ngOnInit(): void {
    this.cargarEspecialidades();
    this.medicoId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.medicoId) {
      this.enEdicion = true;
      this.cargarMedico(this.medicoId);
    }
  }

  cargarEspecialidades(): void {
    this.api.getEspecialidades().subscribe({
      next: (data) => {
        this.especialidades = data;
      },
      error: (err) => {
        console.error('Error cargando especialidades:', err);
      }
    });
  }

  // ======= API =======

  cargarMedico(id: number): void {
    this.cargando = true;
    this.api.getPersonalAtencionById(id).subscribe({
      next: (data) => {
        this.medicoActual = data;
        this.form.patchValue({
          nombre: data.nombre,
          colegiado: data.colegiado,
          pasaporte: data.pasaporte,
          especialidad_id: data.especialidad_id,
          dpi: data.dpi,
          sexo: data.sexo,
          activo: data.activo
        });
      },

      error: (err) => {
        console.error(err);
      },

      complete: () => {
        this.cargando = false;
      }

    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando = true;
    const raw = this.form.value;
    const payload: PersonalAtencionCreate | PersonalAtencionUpdate = {
      ...raw,
      dpi: raw.dpi === '' ? null : raw.dpi,
      colegiado: raw.colegiado === '' ? null : raw.colegiado,
    };
    // ======= EDITAR =======
    if (this.enEdicion && this.medicoId) {
      this.api.actualizarPersonalAtencion(
        this.medicoId,
        payload
      ).subscribe({
        next: () => {
          this.router.navigate(['/doctores']);
        },
        error: (err) => {
          console.error(err);
          this.guardando = false;
        },
        complete: () => {
          this.guardando = false;
        }
      });

      return;
    }

    // ======= CREAR =======
    this.api.crearPersonalAtencion(payload as PersonalAtencionCreate).subscribe({
      next: () => {
        this.router.navigate(['/doctores']);
      },
      error: (err) => {
        console.error(err);
        this.guardando = false;
      },
      complete: () => {
        this.guardando = false;
      }
    });
  }

  // ======= UI =======
  volver(): void {
    this.location.back();
  }
  get f() {
    return this.form.controls;
  }

}
