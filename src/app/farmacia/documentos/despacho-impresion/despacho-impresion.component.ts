import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { InsumosService } from '../../../insumos/insumos.service';
import { Despacho } from '../../../insumos/insumos.model';
import {
  DocumentoImpresionComponent,
  DocumentoMeta,
} from '../documento-impresion.component';

/**
 * Comprobante imprimible de un despacho.
 *
 * Carga el despacho por id y muestra datos generales, detalle por lote y
 * totales; el encabezado, las firmas y los botones vienen del shell común.
 */
@Component({
  selector: 'app-despacho-impresion',
  standalone: true,
  imports: [CommonModule, DocumentoImpresionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <app-documento-impresion
    titulo="Comprobante de despacho"
    [subtitulo]="subtitulo()"
    [meta]="meta()"
    [firmas]="firmas"
  >
    @if (cargando()) {
      <p class="doc-print-note">Cargando la información del despacho…</p>
    } @else if (error()) {
      <p class="doc-print-note" role="alert">{{ error() }}</p>
    } @else if (despacho(); as d) {
      <section class="doc-print-section">
        <h2 class="doc-print-section-title">Datos generales</h2>
        <div class="doc-print-datos">
          <span><strong>Número:</strong> {{ d.numero }}</span>
          <span><strong>Tipo:</strong> {{ tipoTexto(d.tipo) }}</span>
          <span><strong>Estado:</strong> {{ estadoTexto(d.estado) }}</span>
          <span><strong>Fecha:</strong> {{ d.fecha | date:'dd/MM/yyyy HH:mm' }}</span>
          <span><strong>Almacén origen:</strong> {{ d.almacen_origen_nombre || '—' }}</span>
          <span><strong>Destino:</strong> {{ destinoTexto(d) }}</span>
          @if (d.requisicion_id) {
            <span><strong>Requisición:</strong> #{{ d.requisicion_id }}</span>
          }
        </div>
      </section>

      <section class="doc-print-section">
        <h2 class="doc-print-section-title">Detalle del despacho</h2>
        @if (d.detalles?.length) {
          <table class="doc-print-table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Insumo</th>
                <th scope="col">Presentación</th>
                <th scope="col">Lote</th>
                <th scope="col" class="num">Cantidad</th>
                <th scope="col" class="num">Costo unit.</th>
                <th scope="col" class="num">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              @for (det of d.detalles; track det.id; let i = $index) {
                <tr>
                  <td class="nowrap">{{ i + 1 }}</td>
                  <td>{{ det.insumo_nombre || '—' }}</td>
                  <td>
                    {{ det.presentacion_nombre || '—' }}
                    @if (det.presentacion_codigo) {
                      <span class="doc-print-desglose">{{ det.presentacion_codigo }}</span>
                    }
                  </td>
                  <td class="nowrap">{{ det.lote_numero || '—' }}</td>
                  <td class="num">{{ det.cantidad | number:'1.0-2' }}</td>
                  <td class="num">{{ det.costo_unitario | number:'1.2-2' }}</td>
                  <td class="num">{{ subtotal(det.cantidad, det.costo_unitario) | number:'1.2-2' }}</td>
                </tr>
              }
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4">Total</td>
                <td class="num">{{ totalUnidades() | number:'1.0-2' }}</td>
                <td></td>
                <td class="num">{{ totalCosto() | number:'1.2-2' }}</td>
              </tr>
            </tfoot>
          </table>
        } @else {
          <p class="doc-print-empty">El despacho no tiene líneas de detalle.</p>
        }
      </section>

      @if (d.observaciones) {
        <section class="doc-print-section">
          <h2 class="doc-print-section-title">Observaciones</h2>
          <p class="doc-print-note">{{ d.observaciones }}</p>
        </section>
      }
    }
  </app-documento-impresion>
  `,
})
export class DespachoImpresionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(InsumosService);

  readonly despacho = signal<Despacho | null>(null);
  readonly cargando = signal(true);
  readonly error = signal('');

  readonly firmas = [
    'Entrega — Farmacia',
    'Recibe — Servicio / Paciente',
    'Vo.Bo. — Jefatura de Farmacia',
  ];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.cargando.set(false);
      this.error.set('El despacho solicitado no es válido.');
      return;
    }

    this.svc.obtenerDespacho(id).subscribe({
      next: (despacho) => {
        this.despacho.set(despacho);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('No se pudo cargar el despacho para impresión.');
      },
    });
  }

  subtitulo(): string {
    const d = this.despacho();
    if (!d) return '';
    return `${d.numero} · ${this.tipoTexto(d.tipo)}`;
  }

  meta(): DocumentoMeta[] {
    const d = this.despacho();
    if (!d) return [];
    return [
      { etiqueta: 'Estado', valor: this.estadoTexto(d.estado) },
      { etiqueta: 'Fecha', valor: new Date(d.fecha).toLocaleString('es-GT') },
      { etiqueta: 'Origen', valor: d.almacen_origen_nombre || '—' },
      { etiqueta: 'Destino', valor: this.destinoTexto(d) },
    ];
  }

  totalUnidades(): number {
    return (this.despacho()?.detalles ?? []).reduce(
      (total, det) => total + Number(det.cantidad || 0),
      0,
    );
  }

  totalCosto(): number {
    return (this.despacho()?.detalles ?? []).reduce(
      (total, det) => total + Number(det.cantidad || 0) * Number(det.costo_unitario || 0),
      0,
    );
  }

  subtotal(cantidad: number, costo: number): number {
    return Number(cantidad || 0) * Number(costo || 0);
  }

  tipoTexto(tipo: string): string {
    const etiquetas: Record<string, string> = {
      servicio: 'Despacho a servicio',
      paciente: 'Despacho a paciente',
      traslado: 'Traslado entre almacenes',
    };
    return etiquetas[tipo] || tipo;
  }

  estadoTexto(estado: string): string {
    const etiquetas: Record<string, string> = {
      borrador: 'Borrador',
      despachado: 'Despachado',
      anulado: 'Anulado',
    };
    return etiquetas[estado] || estado;
  }

  destinoTexto(d: Despacho): string {
    if (d.tipo === 'traslado') return d.almacen_destino_nombre || 'Almacén sin nombre';
    if (d.tipo === 'paciente') return d.paciente_nombre || 'Paciente sin nombre';
    return d.servicio_destino_nombre || 'Servicio sin nombre';
  }
}
