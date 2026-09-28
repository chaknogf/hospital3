import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CensoCamasService } from './censo-camas.service';
import { CensoCamasOut, CensoCamasCreate, CensoCamasUpdate, CensoCamasSexoOut } from './censo-camas.interface';
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
/** Captura el censo diario de camas por servicio y sexo. */
export class CensoCamasFormComponent implements OnInit, OnDestroy {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private censoService = inject(CensoCamasService);
  private api = inject(ApiService);
  private destroy$ = new Subject<void>();
  private revisionDuplicado = 0;

  registroId: number | null = null;
  servicios: Encamamiento[] = [];
  cargando = false;
  guardando = false;
  enEdicion = false;
  mostrarAlerta = false;
  mensajeAlerta = '';
  tipoAlerta: 'exito' | 'error' = 'exito';
  registroMasculino: CensoCamasSexoOut | null = null;
  registroFemenino: CensoCamasSexoOut | null = null;
  copiandoDiaAnterior = false;
  mensajeCopia = '';
  mostrarCopia = false;
  existeRegistro = false;
  registroExistente: CensoCamasOut | null = null;

  form: FormGroup = this.fb.group({
    fecha: [this.ayer(), Validators.required],
    servicio_id: [null, Validators.required],
    masculino: this.crearGrupoMovimientos(),
    femenino: this.crearGrupoMovimientos(),
  });

  ngOnInit(): void {
    this.cargarServicios();
    this.revisarDuplicado();

    this.form.get('fecha')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.cambiarContexto());
    this.form.get('servicio_id')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.cambiarContexto());

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
    return this.calcularCamasOcupadas(this.grupoSexo(0)) + this.calcularCamasOcupadas(this.grupoSexo(1));
  }

  private crearGrupoMovimientos(): FormGroup {
    return this.fb.group({
      ocupados: [0, [Validators.required, Validators.min(0)]],
      egresos: [0, [Validators.required, Validators.min(0)]],
      fallecidos: [0, [Validators.required, Validators.min(0)]],
      referido: [0, [Validators.required, Validators.min(0)]],
      traslado: [0, [Validators.required, Validators.min(0)]],
      contraindicados: [0, [Validators.required, Validators.min(0)]],
      otro_ingresos: [0, [Validators.required, Validators.min(0)]],
      ingresos: [0, [Validators.required, Validators.min(0)]],
      huespedes: [0, [Validators.required, Validators.min(0)]],
      emergencia: [0, [Validators.required, Validators.min(0)]],
    });
  }

  private grupoSexo(sexo: 0 | 1): FormGroup {
    return this.form.get(sexo === 0 ? 'masculino' : 'femenino') as FormGroup;
  }

  private calcularCamasOcupadas(movimientos: FormGroup): number {
    const v = movimientos.value;
    const egresosTotales = Number(v.egresos ?? 0) + Number(v.fallecidos ?? 0)
      + Number(v.referido ?? 0) + Number(v.traslado ?? 0) + Number(v.contraindicados ?? 0);
    return Number(v.emergencia ?? 0) + Number(v.huespedes ?? 0) + Number(v.ingresos ?? 0)
      + Number(v.otro_ingresos ?? 0) + Number(v.ocupados ?? 0) - egresosTotales;
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

  private resetearMovimientos(): void {
    this.grupoSexo(0).reset(this.valoresMovimientosVacios(), { emitEvent: false });
    this.grupoSexo(1).reset(this.valoresMovimientosVacios(), { emitEvent: false });
  }

  private valoresMovimientosVacios(): Record<string, number> {
    return {
      ocupados: 0,
      egresos: 0,
      fallecidos: 0,
      referido: 0,
      traslado: 0,
      contraindicados: 0,
      otro_ingresos: 0,
      ingresos: 0,
      huespedes: 0,
      emergencia: 0,
    };
  }

  private cambiarContexto(): void {
    if (this.enEdicion) return;
    this.resetearMovimientos();
    this.existeRegistro = false;
    this.registroExistente = null;
    this.revisarDuplicado();
  }

  verificarExistencia(): boolean {
    const fecha = this.form.get('fecha')?.value;
    const servicio_id = this.form.get('servicio_id')?.value;
    if (!fecha || !servicio_id || this.enEdicion) return false;
    return true;
  }

  revisarDuplicado(): void {
    const revision = ++this.revisionDuplicado;
    if (!this.verificarExistencia()) {
      this.existeRegistro = false;
      this.registroExistente = null;
      this.registroMasculino = null;
      this.registroFemenino = null;
      return;
    }
    const fecha = this.form.get('fecha')?.value;
    const servicioId = this.form.get('servicio_id')?.value;
    this.censoService.getRegistros({ fecha, servicio_id: servicioId, limit: 1 }).subscribe({
      next: (res) => {
        if (revision !== this.revisionDuplicado) return;
        this.establecerRegistro(res.registros[0] ?? null);
      },
      error: () => {
        if (revision !== this.revisionDuplicado) return;
        this.existeRegistro = false;
        this.registroExistente = null;
        this.registroMasculino = null;
        this.registroFemenino = null;
      }
    });
  }

  private establecerRegistro(registro: CensoCamasOut | null): void {
    this.registroMasculino = registro?.masculino ?? null;
    this.registroFemenino = registro?.femenino ?? null;
    this.existeRegistro = !!registro;
    this.registroExistente = registro;
  }

  private cargarRegistrosDelServicio(fecha: string, servicioId: number): void {
    this.censoService.getRegistros({ fecha, servicio_id: servicioId, skip: 0, limit: 1 }).subscribe({
      next: (res) => {
        const registro = res.registros[0] ?? null;
        this.establecerRegistro(registro);
        this.grupoSexo(0).reset(this.movimientosDe(registro?.masculino ?? null), { emitEvent: false });
        this.grupoSexo(1).reset(this.movimientosDe(registro?.femenino ?? null), { emitEvent: false });
      },
      error: () => {
        this.registroMasculino = null;
        this.registroFemenino = null;
      },
      complete: () => {
        this.cargando = false;
      },
    });
  }

  private movimientosDe(registro: CensoCamasSexoOut | null): Record<string, number> {
    return {
      ocupados: registro?.ocupados ?? 0,
      egresos: registro?.egresos ?? 0,
      fallecidos: registro?.fallecidos ?? 0,
      referido: registro?.referido ?? 0,
      traslado: registro?.traslado ?? 0,
      contraindicados: registro?.contraindicados ?? 0,
      otro_ingresos: registro?.otro_ingresos ?? 0,
      ingresos: registro?.ingresos ?? 0,
      huespedes: registro?.huespedes ?? 0,
      emergencia: registro?.emergencia ?? 0,
    };
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
        if (servicioId) this.cargarRegistrosDelServicio(fecha, servicioId);
        else this.revisarDuplicado();
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
        this.form.patchValue({
          fecha: data.fecha,
          servicio_id: data.servicio_id,
          masculino: this.movimientosDe(data.masculino),
          femenino: this.movimientosDe(data.femenino),
        }, { emitEvent: false });
        this.establecerRegistro(data);
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        console.error('Error al cargar registro');
      },
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.existeRegistro && !this.enEdicion) {
      this.tipoAlerta = 'error';
      this.mostrarMensaje('Ya existe un registro para esta fecha y servicio. Ábralo para editar ambos sexos.', 7000);
      return;
    }

    this.guardando = true;
    const registro = this.crearRegistro();
    const solicitud = this.enEdicion && this.registroId
      ? this.censoService.actualizar(this.registroId, {
        masculino: registro.masculino,
        femenino: registro.femenino,
      })
      : this.censoService.crear(registro);

    solicitud.subscribe({
      next: (res) => {
        if ((res as any)?.queued) {
          this.tipoAlerta = 'exito';
          this.mostrarMensaje('Censo de ambos sexos guardado localmente; se sincronizará al recuperar conexión');
          if (this.enEdicion) this.router.navigate(['/censo-camas']);
          else this.limpiarForm();
          return;
        }

        if (this.enEdicion) {
          this.router.navigate(['/censo-camas']);
        } else {
          this.tipoAlerta = 'exito';
          this.mostrarMensaje('Registro de censo guardado correctamente');
          this.limpiarForm();
        }
      },
      error: () => {
        this.tipoAlerta = 'error';
        this.mostrarMensaje('No se pudo guardar el censo de ambos sexos.');
      },
      complete: () => this.guardando = false,
    });
  }

  private crearRegistro(): CensoCamasCreate {
    return {
      fecha: this.form.get('fecha')?.value,
      servicio_id: Number(this.form.get('servicio_id')?.value),
      masculino: this.grupoSexo(0).getRawValue(),
      femenino: this.grupoSexo(1).getRawValue(),
    };
  }

  volver(): void {
    this.router.navigate(['/censo-camas']);
  }

  get f() { return this.form.controls; }

  private limpiarForm(): void {
    this.form.reset({ fecha: this.ayer(), servicio_id: null }, { emitEvent: false });
    this.resetearMovimientos();
    this.existeRegistro = false;
    this.registroExistente = null;
    this.registroMasculino = null;
    this.registroFemenino = null;
    this.mostrarCopia = false;
    this.revisionDuplicado++;
  }

  mostrarMensaje(mensaje: string, duracion: number = 5000): void {
    this.mensajeAlerta = mensaje;
    this.mostrarAlerta = true;
    setTimeout(() => this.mostrarAlerta = false, duracion);
  }

  private ayer(): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - 1);
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
  }

  private fechaAnterior(fecha: string): string {
    const d = new Date(`${fecha}T00:00:00`);
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
