import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CitaService } from '../../../registros/citas/cita.service';
import { DiaInhabil } from '../../../interface/citas';

@Component({
  selector: 'app-gestion-dias-inhabiles',
  templateUrl: './gestion-dias-inhabiles.component.html',
  styleUrls: ['./gestion-dias-inhabiles.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, FormsModule],
})
/** Gestiona los días inhábiles que afectan la programación de atención. */
export class GestionDiasInhabilesComponent implements OnInit, OnDestroy {
  private api = inject(CitaService);
  private destroy$ = new Subject<void>();

  dias: DiaInhabil[] = [];
  cargando = signal(false);
  mensaje = signal<{ texto: string; tipo: 'success' | 'error' } | null>(null);

  // Formulario
  nuevaFecha = '';
  nuevoMotivo = '';
  guardando = false;

  ngOnInit(): void {
    this.cargar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargar(): void {
    this.cargando.set(true);
    this.api.getDiasInhabiles().pipe(takeUntil(this.destroy$)).subscribe({
      next: (lista) => { this.dias = lista; this.cargando.set(false); },
      error: () => { this.cargando.set(false); this.mostrar('No se pudieron cargar las fechas.', 'error'); }
    });
  }

  agregar(): void {
    if (!this.nuevaFecha) {
      this.mostrar('Selecciona una fecha.', 'error');
      return;
    }
    const [y, m, d] = this.nuevaFecha.split('-').map(Number);
    const dia = new Date(y, m - 1, d);
    if (dia.getDay() === 0 || dia.getDay() === 6) {
      this.mostrar('Los fines de semana ya son inhábiles por regla; elige un día de lunes a viernes.', 'error');
      return;
    }
    this.guardando = true;
    this.api.crearDiaInhabil({ fecha: this.nuevaFecha, motivo: this.nuevoMotivo || undefined })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.guardando = false;
          this.nuevaFecha = '';
          this.nuevoMotivo = '';
          this.mostrar('Fecha deshabilitada correctamente.', 'success');
          this.cargar();
        },
        error: (err) => {
          this.guardando = false;
          this.mostrar(err?.error?.detail ?? 'No se pudo deshabilitar la fecha.', 'error');
        }
      });
  }

  toggle(d: DiaInhabil): void {
    this.api.actualizarDiaInhabil(d.id, { activo: !d.activo })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.mostrar(d.activo ? 'Fecha habilitada.' : 'Fecha deshabilitada.', 'success'); this.cargar(); },
        error: () => this.mostrar('No se pudo cambiar el estado.', 'error')
      });
  }

  eliminar(d: DiaInhabil): void {
    if (!confirm(`¿Eliminar ${d.fecha}?`)) return;
    this.api.eliminarDiaInhabil(d.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.mostrar('Fecha eliminada.', 'success'); this.cargar(); },
      error: () => this.mostrar('No se pudo eliminar la fecha.', 'error')
    });
  }

  private mostrar(texto: string, tipo: 'success' | 'error'): void {
    this.mensaje.set({ texto, tipo });
    setTimeout(() => this.mensaje.set(null), 3500);
  }
}
