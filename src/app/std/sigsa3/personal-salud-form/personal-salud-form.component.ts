import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Sigsa3Service } from '../sigsa3.service';
import { PersonalSaludCreate, PersonalSaludUpdate } from '../../../interface/sigsa3.interface';
import { MedicosService, EspecialidadItem } from '../../medicos/medicos.service';
import { IconService } from '../../../service/icon.service';

@Component({
  selector: 'app-personal-salud-form',
  templateUrl: './personal-salud-form.component.html',
  styleUrls: ['./personal-salud-form.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ReactiveFormsModule]
})
export class PersonalSaludFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private api = inject(Sigsa3Service);
  private medicosService = inject(MedicosService);
  private iconService = inject(IconService);

  registroId: number | null = null;
  cargando = false;
  guardando = false;
  enEdicion = false;

  especialidades: EspecialidadItem[] = [];

  form: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    especialidad_id: [null],
    medico_id: [null],
    activo: [true],
  });

  saveIcon = this.iconService.getIcon('saveIcon');
  cancelIcon = this.iconService.getIcon('cancelIcon');

  ngOnInit(): void {
    this.cargarEspecialidades();
    this.registroId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.registroId) {
      this.enEdicion = true;
      this.cargarRegistro(this.registroId);
    }
  }

  cargarEspecialidades(): void {
    this.medicosService.getEspecialidades().subscribe({
      next: (data) => this.especialidades = data,
      error: () => { }
    });
  }

  cargarRegistro(id: number): void {
    this.cargando = true;
    this.api.obtenerPersonalSalud(id).subscribe({
      next: (data) => {
        this.form.patchValue({
          nombre: data.nombre,
          especialidad_id: data.especialidad_id,
          medico_id: data.medico_id,
          activo: data.activo ?? true,
        });
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando = true;
    const payload: PersonalSaludCreate | PersonalSaludUpdate = { ...this.form.value };

    if (this.enEdicion && this.registroId) {
      this.api.actualizarPersonalSalud(this.registroId, payload as PersonalSaludUpdate).subscribe({
        next: () => this.router.navigate(['/personal-salud']),
        error: () => { this.guardando = false; },
        complete: () => { this.guardando = false; }
      });
      return;
    }

    this.api.crearPersonalSalud(payload as PersonalSaludCreate).subscribe({
      next: () => this.router.navigate(['/personal-salud']),
      error: () => { this.guardando = false; },
      complete: () => { this.guardando = false; }
    });
  }

  volver(): void { this.location.back(); }
  get f() { return this.form.controls; }
}
