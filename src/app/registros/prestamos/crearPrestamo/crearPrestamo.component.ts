import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { PrestamosService } from '../prestamos.service';
import { ConsultaService } from '../../consultas/consultas.service';
import { PrestamoCreate, PrestamoUpdate, Prestamo } from '../../../interface/prestamos';
import { ConsultaOut } from '../../../interface/consultas';
import { Nombre } from '../../../interface/interfaces';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-crearPrestamo',
  templateUrl: './crearPrestamo.component.html',
  styleUrls: ['./crearPrestamo.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class CrearPrestamoComponent implements OnInit, OnDestroy {

  private prestamosService = inject(PrestamosService);
  private consultaService = inject(ConsultaService);
  private route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private location = inject(Location);

  private destroy$ = new Subject<void>();

  isLoading = this.prestamosService.isLoading;
  consulta = signal<ConsultaOut | null>(null);
  cargandoConsulta = signal(true);
  errorCarga = signal<string | null>(null);
  mensaje = signal<{ texto: string; tipo: 'success' | 'error' } | null>(null);
  prestamoCreado = signal<Prestamo | null>(null);

  // ── Modo ──────────────────────────────────────────────
  // 'crear'  → ruta /prestamo/:idConsulta
  // 'editar' → ruta /editarPrestamo/:idPrestamo
  modoEditar = false;
  idPrestamo: number | null = null;

  tiposDocumento = ['EXPEDIENTE', 'DOCUMENTO', 'OTRO'];

  form: PrestamoCreate = {
    id_paciente: 0,
    id_consulta: null,
    expediente: '',
    fecha_prestamo: null,
    fecha_limite: null,
    solicitante: '',
    motivo: '',
    tipo_documento: 'EXPEDIENTE',
    activo: true,
    ubicacion: '',
    nota: ''
  };

  // Campos extra del PUT que no están en PrestamoCreate
  formUpdate = {
    fecha_devolucion: null as string | null
  };

  // Datos de auditoría (solo lectura, vienen del backend)
  usuarioEntrega: string | null = null;
  usuarioRecibe: string | null = null;

  // =========================================================
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    // Detectar modo por la URL activa
    this.modoEditar = this.router.url.startsWith('/editarPrestamo');

    if (this.modoEditar) {
      this.idPrestamo = id;
      this.cargarPrestamo(id);
    } else {
      this.cargarConsulta(id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =========================================================
  // MODO CREAR — carga consulta y auto-completa
  // =========================================================

  private cargarConsulta(idConsulta: number): void {
    this.cargandoConsulta.set(true);
    this.errorCarga.set(null);

    this.consultaService.getConsultaId(idConsulta).pipe(takeUntil(this.destroy$)).subscribe({
      next: (consulta) => {
        this.consulta.set(consulta);
        this.autoCompletar(consulta);
        this.cargandoConsulta.set(false);
      },
      error: () => {
        this.errorCarga.set('No se pudo cargar la consulta.');
        this.cargandoConsulta.set(false);
      }
    });
  }

  private autoCompletar(consulta: ConsultaOut): void {
    this.form.id_consulta = consulta.id;
    this.form.id_paciente = consulta.paciente_id ?? consulta.paciente?.id ?? 0;
    this.form.expediente = consulta.expediente ?? consulta.paciente?.expediente ?? '';

  }

  // =========================================================
  // MODO EDITAR — carga préstamo existente
  // =========================================================

  private cargarPrestamo(idPrestamo: number): void {
    this.cargandoConsulta.set(true);
    this.errorCarga.set(null);

    this.prestamosService.getPrestamo(idPrestamo).pipe(takeUntil(this.destroy$)).subscribe({
      next: (prestamo) => {
        this.rellenarFormDesde(prestamo);
        this.cargandoConsulta.set(false);
      },
      error: () => {
        this.errorCarga.set('No se pudo cargar el préstamo.');
        this.cargandoConsulta.set(false);
      }
    });
  }

  private rellenarFormDesde(prestamo: Prestamo): void {
    // Campos editables
    this.form = {
      id_paciente: prestamo.id_paciente,
      id_consulta: prestamo.id_consulta ?? null,
      expediente: prestamo.expediente ?? '',
      fecha_prestamo: prestamo.fecha_prestamo ?? null,
      fecha_limite: prestamo.fecha_limite ?? null,
      solicitante: prestamo.solicitante,
      motivo: prestamo.motivo ?? '',
      tipo_documento: prestamo.tipo_documento ?? 'EXPEDIENTE',
      activo: prestamo.activo ?? true,
      ubicacion: prestamo.ubicacion ?? '',
      nota: prestamo.nota ?? ''
    };
    // Campo extra solo disponible en edición
    this.formUpdate.fecha_devolucion = prestamo.fecha_devolucion ?? null;
    // Auditoría (solo lectura)
    this.usuarioEntrega = prestamo.usuario_entrega ?? null;
    this.usuarioRecibe = prestamo.usuario_recibe ?? null;
  }

  // =========================================================
  // GUARDAR — crea o actualiza según el modo
  // =========================================================

  guardar(): void {
    if (!this.form.id_paciente || !this.form.solicitante?.trim()) {
      this.mostrarMensaje('ID de paciente y solicitante son requeridos.', 'error');
      return;
    }

    if (this.modoEditar) {
      this.actualizar();
    } else {
      this.crear();
    }
  }

  private crear(): void {
    const payload: PrestamoCreate = {
      ...this.form,
      expediente: this.form.expediente?.trim() || null,
      motivo: this.form.motivo?.trim() || null,
      ubicacion: this.form.ubicacion?.trim() || null,
      nota: this.form.nota?.trim() || null,
      fecha_prestamo: this.form.fecha_prestamo || null,
      fecha_limite: this.form.fecha_limite || null,
    };

    this.prestamosService.crearPrestamo(payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (prestamo: Prestamo) => {
        this.prestamoCreado.set(prestamo);
        // Mostrar usuario_entrega que asignó el backend
        this.usuarioEntrega = prestamo.usuario_entrega ?? null;
        this.mostrarMensaje('Préstamo registrado correctamente.', 'success');
        setTimeout(() => this.router.navigate(['/prestamos']), 1800);
      },
      error: () => this.mostrarMensaje('Error al crear el préstamo.', 'error')
    });
  }

  private actualizar(): void {
    if (!this.idPrestamo) return;

    const payload: PrestamoUpdate = {
      id_consulta: this.form.id_consulta ?? null,
      expediente: this.form.expediente?.trim() || null,
      fecha_prestamo: this.form.fecha_prestamo || null,
      fecha_limite: this.form.fecha_limite || null,
      fecha_devolucion: this.formUpdate.fecha_devolucion || null,
      solicitante: this.form.solicitante?.trim() || null,
      motivo: this.form.motivo?.trim() || null,
      tipo_documento: this.form.tipo_documento || null,
      activo: this.form.activo,
      ubicacion: this.form.ubicacion?.trim() || null,
      nota: this.form.nota?.trim() || null,
      // usuario_recibe lo asigna el backend cuando llega fecha_devolucion
    };

    this.prestamosService.actualizarPrestamo(this.idPrestamo, payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (prestamo: Prestamo) => {
        // Refrescar usuarios desde la respuesta (backend puede haber asignado usuario_recibe)
        this.usuarioEntrega = prestamo.usuario_entrega ?? null;
        this.usuarioRecibe = prestamo.usuario_recibe ?? null;
        this.mostrarMensaje('Préstamo actualizado correctamente.', 'success');
        setTimeout(() => this.router.navigate(['/prestamos']), 1800);
      },
      error: () => this.mostrarMensaje('Error al actualizar el préstamo.', 'error')
    });
  }

  cancelar(): void {
    this.location.back();
  }

  // =========================================================
  // UTILIDADES
  // =========================================================

  construirNombre(nombre?: Nombre): string {
    if (!nombre) return '';
    return [
      nombre.primer_nombre,
      nombre.segundo_nombre,
      nombre.primer_apellido,
      nombre.segundo_apellido
    ].filter(Boolean).join(' ');
  }

  private mostrarMensaje(texto: string, tipo: 'success' | 'error'): void {
    this.mensaje.set({ texto, tipo });
    setTimeout(() => this.mensaje.set(null), 4000);
  }
}
