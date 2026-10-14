// quirofano-excel-export.component.ts

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';

import { ReporteQuirofanoParams } from '../../../interface/quirofano.interface';
import { IconService } from '../../../service/icon.service';
import { QuirofanoService } from '../quirofano.service';

type EstadoExportacion = 'idle' | 'generando' | 'exito' | 'error';

/** Botón que descarga el reporte de quirófanos en formato Excel (.xlsx). */
@Component({
  selector: 'app-quirofano-excel-export',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      class="btn-export"
      [class.cargando]="estado() === 'generando'"
      [disabled]="estado() === 'generando'"
      (click)="descargar()"
    >
      <span class="icono" [innerHTML]="iconoSave" aria-hidden="true"></span>
      {{ etiqueta() }}
    </button>
    @if (estado() === 'exito') {
      <span class="aviso ok" role="status">{{ mensaje() }}</span>
    }
    @if (estado() === 'error') {
      <span class="aviso err" role="alert">{{ mensaje() }}</span>
    }
  `,
  styles: [`
    :host { display: inline-flex; align-items: center; gap: var(--theme-space-2); flex-wrap: wrap; }
    .btn-export {
      display: inline-flex; align-items: center; gap: var(--theme-space-1);
      min-height: var(--theme-touch-min);
      padding: var(--theme-space-1) var(--theme-space-3);
      background: var(--theme-success-dim);
      border: var(--theme-border-width) solid color-mix(in srgb, var(--theme-success) 45%, transparent);
      border-radius: var(--theme-radius-md);
      color: var(--theme-success);
      font-family: var(--theme-font-ui);
      font-size: var(--theme-font-size-sm);
      font-weight: var(--theme-font-weight-bold);
      cursor: pointer;
      transition: background var(--theme-transition-fast), border-color var(--theme-transition-fast), color var(--theme-transition-fast);
    }
    .btn-export:hover:not(:disabled) {
      background: var(--theme-success);
      border-color: var(--theme-success);
      color: var(--theme-text-on-primary);
    }
    .btn-export:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-export.cargando .icono { animation: spin 0.9s linear infinite; }
    .icono { display: inline-flex; line-height: 0; }
    :host ::ng-deep .icono svg { width: 16px; height: 16px; margin: 0; }
    .aviso { font-size: var(--theme-font-size-xs); font-weight: var(--theme-font-weight-bold); }
    .aviso.ok { color: var(--theme-success); }
    .aviso.err { color: var(--theme-danger); }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class QuirofanoExcelExportComponent {
  private api = inject(QuirofanoService);
  private iconService = inject(IconService);

  readonly filtros = input.required<ReporteQuirofanoParams>();

  readonly estado = signal<EstadoExportacion>('idle');
  readonly mensaje = signal('');

  readonly iconoSave = this.iconService.getIcon('saveIcon');

  etiqueta(): string {
    return this.estado() === 'generando' ? 'Generando…' : 'Descargar Excel';
  }

  descargar(): void {
    if (this.estado() === 'generando') return;
    this.estado.set('generando');
    this.mensaje.set('');

    this.api.descargarExcelReporte(this.filtros()).subscribe({
      next: respuesta => {
        const blob = respuesta.body;
        if (!blob) {
          this.estado.set('error');
          this.mensaje.set('El servidor no devolvió el archivo.');
          return;
        }
        const nombre = this.nombreArchivo(respuesta.headers.get('Content-Disposition'));
        this.guardarBlob(blob, nombre);
        this.estado.set('exito');
        this.mensaje.set('Excel descargado.');
        setTimeout(() => this.estado.set('idle'), 4000);
      },
      error: () => {
        this.estado.set('error');
        this.mensaje.set('No se pudo generar el Excel. Intenta de nuevo.');
      },
    });
  }

  private nombreArchivo(disposicion: string | null): string {
    const f = this.filtros();
    const porDefecto = `Control_Quirofanos_${f.fecha_desde}_${f.fecha_hasta}.xlsx`;
    if (!disposicion) return porDefecto;
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposicion);
    return match?.[1] ? decodeURIComponent(match[1]) : porDefecto;
  }

  private guardarBlob(blob: Blob, nombre: string): void {
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  }
}
