import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CensoCamasService } from './censo-camas.service';
import { CensoCamasOut, CensoCamasCreate, CensoCamasUpdate } from './censo-camas.interface';
import { Encamamiento } from '../../interface/interfaces';
import { ApiService } from '../../service/api.service';

@Component({
  selector: 'app-censo-camas-form',
  templateUrl: './censo-camas-form.component.html',
  styleUrls: ['./censo-camas-form.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, ReactiveFormsModule]
})
export class CensoCamasFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private censoService = inject(CensoCamasService);
  private api = inject(ApiService);

  registroId: number | null = null;
  servicios: Encamamiento[] = [];
  cargando = false;
  guardando = false;
  enEdicion = false;
  mostrarAlerta = false;
  mensajeAlerta = '';
  registroActual: CensoCamasOut | null = null;

  form: FormGroup = this.fb.group({
    fecha: [this.hoy(), Validators.required],
    servicio_id: [null, Validators.required],
    sexo: [0, Validators.required],
    ocupados: [0, [Validators.required, Validators.min(0)]],
    egresos: [0, [Validators.required, Validators.min(0)]],
    fallecidos: [0, [Validators.required, Validators.min(0)]],
    referido: [0, [Validators.required, Validators.min(0)]],
    traslado: [0, [Validators.required, Validators.min(0)]],
    contraindicados: [0, [Validators.required, Validators.min(0)]],
    otro_ingresos: [0, [Validators.required, Validators.min(0)]],
    ingresos: [0, [Validators.required, Validators.min(0)]],
    huespedes: [0, [Validators.required, Validators.min(0)]],
    emergencia: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.cargarServicios();

    this.registroId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.registroId) {
      this.enEdicion = true;
      this.cargarRegistro(this.registroId);
    }
  }

  cargarServicios(): void {
    this.api.getServiciosEncamamiento(true).subscribe({
      next: (data: Encamamiento[]) => this.servicios = data,
      error: () => this.servicios = []
    });
  }

  cargarRegistro(id: number): void {
    this.cargando = true;
    this.censoService.getRegistro(id).subscribe({
      next: (data) => {
        this.registroActual = data;
        this.form.patchValue({
          fecha: data.fecha,
          servicio_id: data.servicio_id,
          sexo: data.sexo,
          ocupados: data.ocupados,
          egresos: data.egresos,
          fallecidos: data.fallecidos,
          referido: data.referido,
          traslado: data.traslado,
          contraindicados: data.contraindicados,
          otro_ingresos: data.otro_ingresos,
          ingresos: data.ingresos,
          huespedes: data.huespedes,
          emergencia: data.emergencia
        });
      },
      error: () => console.error('Error al cargar registro'),
      complete: () => this.cargando = false
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    const raw = this.form.value;

    if (this.enEdicion && this.registroId) {
      const updateData: CensoCamasUpdate = {
        ocupados: raw.ocupados,
        egresos: raw.egresos,
        fallecidos: raw.fallecidos,
        referido: raw.referido,
        traslado: raw.traslado,
        contraindicados: raw.contraindicados,
        otro_ingresos: raw.otro_ingresos,
        ingresos: raw.ingresos,
        huespedes: raw.huespedes,
        emergencia: raw.emergencia
      };
      this.censoService.actualizar(this.registroId, updateData).subscribe({
        next: () => this.router.navigate(['/censo-camas']),
        error: () => this.guardando = false,
        complete: () => this.guardando = false
      });
    } else {
      const payload: CensoCamasCreate = {
        fecha: raw.fecha,
        servicio_id: raw.servicio_id,
        sexo: raw.sexo,
        ocupados: raw.ocupados,
        egresos: raw.egresos,
        fallecidos: raw.fallecidos,
        referido: raw.referido,
        traslado: raw.traslado,
        contraindicados: raw.contraindicados,
        otro_ingresos: raw.otro_ingresos,
        ingresos: raw.ingresos,
        huespedes: raw.huespedes,
        emergencia: raw.emergencia
      };
      this.censoService.crear(payload).subscribe({
        next: () => {
          this.mostrarMensaje('Registro de censo guardado correctamente');
          this.limpiarForm();
        },
        error: () => this.guardando = false,
        complete: () => this.guardando = false
      });
    }
  }

  volver(): void {
    this.router.navigate(['/censo-camas']);
  }

  get f() { return this.form.controls; }

  limpiarForm(): void {
    this.form.reset({
      fecha: this.hoy(),
      servicio_id: null,
      sexo: 0,
      ocupados: 0,
      egresos: 0,
      fallecidos: 0,
      referido: 0,
      traslado: 0,
      contraindicados: 0,
      otro_ingresos: 0,
      ingresos: 0,
      huespedes: 0,
      emergencia: 0
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  mostrarMensaje(mensaje: string, duracion: number = 5000): void {
    this.mensajeAlerta = mensaje;
    this.mostrarAlerta = true;
    setTimeout(() => this.mostrarAlerta = false, duracion);
  }

  private hoy(): string {
    return new Date().toISOString().split('T')[0];
  }
}
