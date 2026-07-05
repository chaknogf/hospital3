// sigsa3-form.component.ts

import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Sigsa3Create, Sigsa3Out, Sigsa3Update } from '../../../interface/sigsa3.interface';
import { Sigsa3Service } from '../sigsa3.service';
import { IconService } from '../../../service/icon.service';

@Component({
  selector: 'app-sigsa3-form',
  templateUrl: './sigsa3-form.component.html',
  styleUrls: ['./sigsa3-form.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class Sigsa3FormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  registroId: number | null = null;
  registroActual: Sigsa3Out | null = null;
  cargando = false;
  guardando = false;
  enEdicion = false;

  form: FormGroup = this.fb.group({
    personal_salud: [''],
    fecha_consulta: [''],
    no_historia_clinica: [''],
    nombre_paciente: [''],
    sexo: [''],
    edad_dias: [null],
    edad_meses: [null],
    edad_anios: [null],
    tipo_consulta: [''],
    control: [''],
    semana_gestacional: [null],
    codigo_cie_10: [''],
    dx: [''],
    especialidad: [''],
  });

  saveIcon: any;
  cancelIcon: any;

  get nombre_paciente_display(): string {
    return this.form.get('nombre_paciente')?.value || (this.enEdicion ? 'EDITANDO' : 'NUEVO');
  }

  constructor(
    private api: Sigsa3Service,
    private iconService: IconService
  ) {
    this.saveIcon = this.iconService.getIcon('saveIcon');
    this.cancelIcon = this.iconService.getIcon('cancelIcon');
  }

  ngOnInit(): void {
    this.registroId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.registroId) {
      this.enEdicion = true;
      this.cargarRegistro(this.registroId);
    }
  }

  cargarRegistro(id: number): void {
    this.cargando = true;
    this.api.obtenerRegistro(id).subscribe({
      next: (data) => {
        this.registroActual = data;
        this.form.patchValue({
          personal_salud: data.personal_salud,
          fecha_consulta: data.fecha_consulta,
          no_historia_clinica: data.no_historia_clinica,
          nombre_paciente: data.nombre_paciente,
          sexo: data.sexo,
          edad_dias: data.edad_dias,
          edad_meses: data.edad_meses,
          edad_anios: data.edad_anios,
          tipo_consulta: data.tipo_consulta,
          control: data.control,
          semana_gestacional: data.semana_gestacional,
          codigo_cie_10: data.codigo_cie_10,
          dx: data.dx,
          especialidad: data.especialidad,
        });
      },
      error: (err) => console.error(err),
      complete: () => { this.cargando = false; }
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando = true;
    const payload = { ...this.form.value };

    if (this.enEdicion && this.registroId) {
      this.api.actualizarRegistro(this.registroId, payload as Sigsa3Update).subscribe({
        next: () => this.router.navigate(['/sigsa3']),
        error: () => { this.guardando = false; },
        complete: () => { this.guardando = false; }
      });
      return;
    }

    this.api.crearRegistro(payload as Sigsa3Create).subscribe({
      next: () => this.router.navigate(['/sigsa3']),
      error: () => { this.guardando = false; },
      complete: () => { this.guardando = false; }
    });
  }

  volver(): void { this.location.back(); }
  get f() { return this.form.controls; }
}
