import { Location } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { MedicoCreate, MedicoOut, MedicoUpdate } from '../../../interface/medicos.interface';
import { MedicosService, EspecialidadItem } from '../medicos.service';
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
export class DoctorFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  // ======= DATA =======

  medicoId: number | null = null;
  medicoActual: MedicoOut | null = null;

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
    private api: MedicosService,
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
    this.api.getMedico(id).subscribe({
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
    const payload: MedicoCreate | MedicoUpdate = {
      ...raw,
      dpi: raw.dpi === '' ? null : raw.dpi,
      colegiado: raw.colegiado === '' ? null : raw.colegiado,
    };
    // ======= EDITAR =======
    if (this.enEdicion && this.medicoId) {
      this.api.actualizarMedico(
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
    this.api.crearMedico(payload as MedicoCreate).subscribe({
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
