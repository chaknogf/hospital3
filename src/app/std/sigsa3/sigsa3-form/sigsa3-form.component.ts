import { Location } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Sigsa3Create, Sigsa3Out, Sigsa3Update } from '../../../interface/sigsa3.interface';
import { Sigsa3Service } from '../sigsa3.service';
import { IconService } from '../../../service/icon.service';
import { MedicosService, EspecialidadItem } from '../../medicos/medicos.service';
import { MedicoOut } from '../../../interface/medicos.interface';

@Component({
  selector: 'app-sigsa3-form',
  templateUrl: './sigsa3-form.component.html',
  styleUrls: ['./sigsa3-form.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ReactiveFormsModule]
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

  medicos: MedicoOut[] = [];
  especialidades: EspecialidadItem[] = [];

  form: FormGroup = this.fb.group({
    paciente_id: [null],
    consulta_id: [null],
    personal_atencion_id: [null],
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
    especialidad_id: [null],
  });

  saveIcon: any;
  cancelIcon: any;

  get nombre_paciente_display(): string {
    return this.form.get('nombre_paciente')?.value || (this.enEdicion ? 'EDITANDO' : 'NUEVO');
  }

  constructor(
    private api: Sigsa3Service,
    private apiService: MedicosService,
    private iconService: IconService
  ) {
    this.saveIcon = this.iconService.getIcon('saveIcon');
    this.cancelIcon = this.iconService.getIcon('cancelIcon');
  }

  ngOnInit(): void {
    this.cargarMedicos();
    this.cargarEspecialidades();
    this.registroId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.registroId) {
      this.enEdicion = true;
      this.cargarRegistro(this.registroId);
    }
  }

  cargarMedicos(): void {
    this.apiService.getMedicos({}).subscribe({
      next: (data) => this.medicos = data.personal_atencion.filter(m => m.activo),
      error: () => {}
    });
  }

  cargarEspecialidades(): void {
    this.apiService.getEspecialidades().subscribe({
      next: (data) => this.especialidades = data,
      error: () => {}
    });
  }

  cargarRegistro(id: number): void {
    this.cargando = true;
    this.api.obtenerRegistro(id).subscribe({
      next: (data) => {
        this.registroActual = data;
        this.form.patchValue({
          paciente_id: data.paciente_id,
          consulta_id: data.consulta_id,
          personal_atencion_id: data.personal_atencion_id,
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
          especialidad_id: data.especialidad_id,
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
    const payload: Sigsa3Create | Sigsa3Update = { ...this.form.value };

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
