import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CensoCamasService } from './censo-camas.service';
import { CensoCamasOut, CensoCamasCreate, CensoCamasUpdate } from './censo-camas.interface';
import { Encamamiento } from '../../interface/interfaces';
import { ApiService } from '../../service/api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-censo-camas-form',
  templateUrl: './censo-camas-form.component.html',
  styleUrls: ['./censo-camas-form.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, ReactiveFormsModule]
})
export class CensoCamasFormComponent implements OnInit, OnDestroy {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private censoService = inject(CensoCamasService);
  private api = inject(ApiService);
  private destroy$ = new Subject<void>();

  registroId: number | null = null;
  servicios: Encamamiento[] = [];
  cargando = false;
  guardando = false;
  enEdicion = false;
  mostrarAlerta = false;
  mensajeAlerta = '';
  tipoAlerta: 'exito' | 'error' = 'exito';
  registroActual: CensoCamasOut | null = null;
  copiandoDiaAnterior = false;
  mensajeCopia = '';
  mostrarCopia = false;
  existeRegistro = false;
  registroExistente: CensoCamasOut | null = null;

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
    this.revisarDuplicado();

    this.form.get('fecha')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.existeRegistro = false;
      this.registroExistente = null;
      this.revisarDuplicado();
    });
    this.form.get('servicio_id')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.existeRegistro = false;
      this.registroExistente = null;
      this.revisarDuplicado();
    });
    this.form.get('sexo')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.existeRegistro = false;
      this.registroExistente = null;
      this.revisarDuplicado();
    });

    this.registroId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.registroId) {
      this.enEdicion = true;
      this.cargarRegistro(this.registroId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarServicios(): void {
    this.api.getServiciosEncamamiento(true).subscribe({
      next: (data: Encamamiento[]) => this.servicios = data,
      error: () => this.servicios = []
    });
  }

  get servicioSeleccionado(): Encamamiento | null {
    const id = this.form.get('servicio_id')?.value;
    if (!id) return null;
    return this.servicios.find(s => s.id === id) || null;
  }

  get camasCensables(): number {
    return this.servicioSeleccionado?.camas_censables || 0;
  }

  get camasOcupadasTotales(): number {
    const ocupados = Number(this.form.get('ocupados')?.value ?? 0);
    const otro = Number(this.form.get('otro_ingresos')?.value ?? 0);
    const ingresos = Number(this.form.get('ingresos')?.value ?? 0);
    const huespedes = Number(this.form.get('huespedes')?.value ?? 0);
    const emergencia = Number(this.form.get('emergencia')?.value ?? 0);
    const egresos = Number(this.form.get('egresos')?.value ?? 0);
    const fallecidos = Number(this.form.get('fallecidos')?.value ?? 0);
    const referido = Number(this.form.get('referido')?.value ?? 0);
    const traslado = Number(this.form.get('traslado')?.value ?? 0);
    const contraindicados = Number(this.form.get('contraindicados')?.value ?? 0);
    const egresosTotales = egresos + fallecidos + referido + traslado + contraindicados;
    return emergencia + huespedes + ingresos + otro + ocupados - egresosTotales;
  }

  get porcentajeOcupacion(): number {
    if (this.camasCensables <= 0) return 0;
    return Math.round((this.camasOcupadasTotales / this.camasCensables) * 100);
  }

  get capacidadNivel(): 'bajo' | 'medio' | 'alto' | 'critico' {
    const pct = this.porcentajeOcupacion;
    if (pct >= 100) return 'critico';
    if (pct >= 80) return 'alto';
    if (pct >= 50) return 'medio';
    return 'bajo';
  }

  get camasDisponibles(): number {
    return Math.max(this.camasCensables - this.camasOcupadasTotales, 0);
  }

  sexoActivo(sexo: number): boolean {
    return (this.form.get('sexo')?.value ?? 0) === sexo;
  }

  seleccionarSexo(sexo: number): void {
    this.form.get('sexo')?.setValue(sexo);
  }

  verificarExistencia(): boolean {
    const fecha = this.form.get('fecha')?.value;
    const servicio_id = this.form.get('servicio_id')?.value;
    const sexo = this.form.get('sexo')?.value;
    if (!fecha || !servicio_id || sexo === null || sexo === undefined || this.enEdicion) return false;
    return true;
  }

  revisarDuplicado(): void {
    if (!this.verificarExistencia()) return;
    const fecha = this.form.get('fecha')?.value;
    const servicioId = this.form.get('servicio_id')?.value;
    const sexo = this.form.get('sexo')?.value;

    this.censoService.getRegistros({ fecha, servicio_id: servicioId, sexo, limit: 1 }).subscribe({
      next: (res) => {
        if (res.total > 0 && res.registros[0]) {
          this.existeRegistro = true;
          this.registroExistente = res.registros[0];
        } else {
          this.existeRegistro = false;
          this.registroExistente = null;
        }
      },
      error: () => {
        this.existeRegistro = false;
        this.registroExistente = null;
      }
    });
  }

  irAEditarExistente(): void {
    if (this.registroExistente) {
      this.router.navigate(['/censo-camas/editar', this.registroExistente.id]);
    }
  }

  copiarDiaAnterior(): void {
    const fecha = this.form.get('fecha')?.value;
    const servicioId = this.form.get('servicio_id')?.value;
    if (!fecha) return;

    this.copiandoDiaAnterior = true;
    this.mostrarCopia = false;
    const origen = this.fechaAnterior(fecha);
    this.censoService.copiarDiaAnterior(origen, fecha, servicioId).subscribe({
      next: (res) => {
        this.copiandoDiaAnterior = false;
        this.mostrarCopia = true;
        this.mensajeCopia = res.copiados > 0 || res.actualizados > 0
          ? `✓ Se copiaron ${res.copiados} registros y se actualizaron ${res.actualizados} desde el ${origen}`
          : `No hay registros del ${origen} para copiar.`;
        this.revisarDuplicado();
        this.tipoAlerta = res.copiados > 0 || res.actualizados > 0 ? 'exito' : 'error';
        this.mostrarAlerta = true;
        setTimeout(() => this.mostrarAlerta = false, 6000);
      },
      error: () => {
        this.copiandoDiaAnterior = false;
        this.mostrarCopia = true;
        this.mensajeCopia = 'Error al copiar registros del día anterior.';
        this.tipoAlerta = 'error';
        this.mostrarAlerta = true;
        setTimeout(() => this.mostrarAlerta = false, 6000);
      }
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

    if (this.existeRegistro && !this.enEdicion) {
      this.tipoAlerta = 'error';
      this.mostrarMensaje('Ya existe un registro para esa fecha, servicio y sexo. Abra el registro existente para editarlo.', 7000);
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
          this.tipoAlerta = 'exito';
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
    this.existeRegistro = false;
    this.registroExistente = null;
    this.mostrarCopia = false;
  }

  mostrarMensaje(mensaje: string, duracion: number = 5000): void {
    this.mensajeAlerta = mensaje;
    this.mostrarAlerta = true;
    setTimeout(() => this.mostrarAlerta = false, duracion);
  }

  private hoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  private fechaAnterior(fecha: string): string {
    const d = new Date(`${fecha}T00:00:00`);
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
