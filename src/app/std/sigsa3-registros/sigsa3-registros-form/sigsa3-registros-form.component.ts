import { Location } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Sigsa3Registro, Sigsa3RegistroCreate, Sigsa3RegistroUpdate } from '../../../interface/sigsa3-registros.interface';
import { Sigsa3RegistrosService } from '../sigsa3-registros.service';
import { IconService } from '../../../service/icon.service';
import { MedicosService, EspecialidadItem } from '../../medicos/medicos.service';
import { MedicoOut } from '../../../interface/medicos.interface';

@Component({
  selector: 'app-sigsa3-registros-form',
  templateUrl: './sigsa3-registros-form.component.html',
  styleUrls: ['./sigsa3-registros-form.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ReactiveFormsModule]
})
export class Sigsa3RegistrosFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  registroId: number | null = null;
  registroActual: Sigsa3Registro | null = null;
  cargando = false;
  guardando = false;
  enEdicion = false;

  medicos: MedicoOut[] = [];
  especialidades: EspecialidadItem[] = [];
  tiposConsulta = [
    { id: 1, nombre: 'Primeras' },
    { id: 2, nombre: 'Reconsultas' },
    { id: 3, nombre: 'Emergencia' },
    { id: 4, nombre: 'Interconsultas' },
  ];

  form: FormGroup = this.fb.group({
    paciente_id: [null, [Validators.required, Validators.min(1)]],
    consulta_id: [null],
    medico_id: [null],
    personal_salud_id: [null],
    fecha_consulta: ['', Validators.required],
    tipo_consulta_id: [null],
    control: [''],
    semana_gestacional: [null],
    codigo_cie_10_id: [null],
    especialidad_id: [null],
  });

  saveIcon: any;
  cancelIcon: any;

  get paciente_display(): string {
    if (this.enEdicion && this.registroActual?.paciente_nombre) {
      return this.registroActual.paciente_nombre;
    }
    return this.enEdicion ? 'EDITANDO' : 'NUEVO';
  }

  constructor(
    private api: Sigsa3RegistrosService,
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
      next: (data) => this.medicos = data.medicos.filter(m => m.activo),
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
          medico_id: data.medico_id,
          personal_salud_id: data.personal_salud_id,
          fecha_consulta: data.fecha_consulta,
          tipo_consulta_id: data.tipo_consulta_id,
          control: data.control,
          semana_gestacional: data.semana_gestacional,
          codigo_cie_10_id: data.codigo_cie_10_id,
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
    const payload: Sigsa3RegistroCreate | Sigsa3RegistroUpdate = { ...this.form.value };

    if (this.enEdicion && this.registroId) {
      this.api.actualizarRegistro(this.registroId, payload as Sigsa3RegistroUpdate).subscribe({
        next: () => this.router.navigate(['/sigsa3-registros']),
        error: () => { this.guardando = false; },
        complete: () => { this.guardando = false; }
      });
      return;
    }

    this.api.crearRegistro(payload as Sigsa3RegistroCreate).subscribe({
      next: () => this.router.navigate(['/sigsa3-registros']),
      error: () => { this.guardando = false; },
      complete: () => { this.guardando = false; }
    });
  }

  volver(): void { this.location.back(); }
  get f() { return this.form.controls; }
}
