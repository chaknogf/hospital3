import {
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';

export interface DocumentoMeta {
  etiqueta: string;
  valor: string;
}

/**
 * Marco común para documentos imprimibles del módulo de farmacia.
 *
 * Provee la barra de controles (oculta al imprimir), el encabezado
 * institucional, el área de contenido proyectada, las firmas y el pie.
 * El contenido se imprime en A4 y las tablas fluyen entre páginas.
 */
@Component({
  selector: 'app-documento-impresion',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  template: `
  <section class="doc-print-root">
    <div class="doc-print-controls no-print">
      <div class="doc-print-controls-head">
        <div>
          <p class="doc-print-controls-kicker">Vista previa de impresión</p>
          <p class="doc-print-controls-title">{{ titulo || 'Documento' }}</p>
        </div>
        <div class="doc-print-actions">
          <button type="button" class="doc-print-btn" (click)="volver()">
            ← Volver
          </button>
          <button type="button" class="doc-print-btn doc-print-btn--primary" (click)="imprimir()">
            🖨 Imprimir
          </button>
        </div>
      </div>
      <ng-content select="[doc-controles]" />
    </div>

    <article class="doc-print-page print-page print-multipage">
      <header class="doc-print-header">
        <div class="doc-print-logo">
          <img src="assets/logo-gobierno.png" alt="Logo institucional" />
        </div>
        <div class="doc-print-titulos">
          <p class="doc-print-institucion">Hospital General Tipo I de Tecpán Guatemala</p>
          <p class="doc-print-area">Servicio de Farmacia</p>
          <h1 class="doc-print-titulo">{{ titulo }}</h1>
          @if (subtitulo) {
            <p class="doc-print-subtitulo">{{ subtitulo }}</p>
          }
        </div>
        <div class="doc-print-meta">
          @for (m of meta; track m.etiqueta) {
            <div><strong>{{ m.etiqueta }}:</strong> {{ m.valor }}</div>
          }
          <div><strong>Impreso:</strong> {{ impresoEn }}</div>
        </div>
      </header>

      <div class="doc-print-body">
        <ng-content />
      </div>

      <footer class="doc-print-footer">
        @if (firmas.length) {
          <div class="doc-print-firmas">
            @for (f of firmas; track f) {
              <div class="doc-print-firma">{{ f }}</div>
            }
          </div>
        }
        <p class="doc-print-pie">
          Documento generado por el sistema de farmacia · {{ impresoEn }}
        </p>
      </footer>
    </article>
  </section>
  `,
  styles: [`
    .doc-print-root {
      min-height: 100vh;
      padding: var(--theme-space-3, 16px);
      background: #eef1f5;
    }
    .doc-print-controls {
      display: grid;
      gap: 10px;
      max-width: 210mm;
      margin: 0 auto 12px;
      padding: 12px 14px;
      border: 1px solid #d5dbe3;
      border-radius: 6px;
      background: #fff;
      font-family: Arial, Helvetica, sans-serif;
    }
    .doc-print-controls-head {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .doc-print-controls-kicker {
      margin: 0;
      font-size: 7.5pt;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #6b7280;
    }
    .doc-print-controls-title {
      margin: 0;
      font-size: 11pt;
      font-weight: 700;
      color: #14315c;
    }
    .doc-print-actions { display: flex; flex-wrap: wrap; gap: 8px; }
    .doc-print-btn {
      min-height: 40px;
      padding: 6px 14px;
      border: 1px solid #c7ced8;
      border-radius: 4px;
      background: #f4f6f9;
      color: #1f2937;
      font-family: inherit;
      font-size: 9pt;
      font-weight: 600;
      cursor: pointer;
    }
    .doc-print-btn:hover { background: #e8ecf2; }
    .doc-print-btn--primary {
      border-color: #14315c;
      background: #14315c;
      color: #fff;
    }
    .doc-print-btn--primary:hover { background: #1d467f; }
    .doc-print-btn:focus-visible {
      outline: 2px solid #14315c;
      outline-offset: 2px;
    }
    .doc-print-filtros {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 12px;
      align-items: flex-end;
      padding-top: 10px;
      border-top: 1px solid #e5e7eb;
    }
    .doc-print-campo {
      display: grid;
      gap: 2px;
      min-width: 140px;
      font-size: 8pt;
      font-weight: 600;
      color: #4b5563;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .doc-print-campo input,
    .doc-print-campo select {
      min-height: 36px;
      padding: 4px 8px;
      border: 1px solid #c7ced8;
      border-radius: 4px;
      background: #fff;
      color: #111827;
      font-family: inherit;
      font-size: 9pt;
      text-transform: none;
      letter-spacing: normal;
    }

    .doc-print-page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 14mm;
      background: #fff;
      box-shadow: 0 2px 18px rgba(15, 23, 42, 0.16);
      color: #111;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9.5pt;
      line-height: 1.35;
    }
    .doc-print-header {
      display: grid;
      grid-template-columns: 56px minmax(0, 1fr) auto;
      gap: 14px;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 2px solid #14315c;
      margin-bottom: 12px;
    }
    .doc-print-logo img {
      display: block;
      width: 56px;
      height: 56px;
      object-fit: contain;
    }
    .doc-print-institucion {
      margin: 0;
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #374151;
    }
    .doc-print-area {
      margin: 0;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #6b7280;
    }
    .doc-print-titulo {
      margin: 2px 0 0;
      font-size: 15pt;
      line-height: 1.15;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      color: #14315c;
    }
    .doc-print-subtitulo {
      margin: 2px 0 0;
      font-size: 10pt;
      color: #1f2937;
    }
    .doc-print-meta {
      text-align: right;
      font-size: 8pt;
      color: #374151;
      white-space: nowrap;
    }
    .doc-print-meta div { margin-bottom: 2px; }

    .doc-print-section { margin-top: 14px; }
    .doc-print-section-title {
      margin: 0 0 6px;
      padding-bottom: 3px;
      border-bottom: 1px solid #cbd5e1;
      font-size: 10pt;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #14315c;
    }
    .doc-print-datos {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 3px 18px;
      margin: 0;
      font-size: 9pt;
    }
    .doc-print-datos span { min-width: 0; overflow-wrap: anywhere; }
    .doc-print-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
    }
    .doc-print-kpi {
      padding: 6px 8px;
      border: 1px solid #d5dbe3;
      border-radius: 4px;
      background: #f8fafc;
    }
    .doc-print-kpi-label {
      margin: 0;
      font-size: 7pt;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #6b7280;
    }
    .doc-print-kpi-value {
      margin: 2px 0 0;
      font-size: 12pt;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      color: #111827;
    }
    .doc-print-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
    }
    .doc-print-table th {
      padding: 4px 5px;
      background: #14315c;
      color: #fff;
      text-align: left;
      font-size: 7pt;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .doc-print-table td {
      padding: 3px 5px;
      border-bottom: 1px solid #d1d5db;
      vertical-align: top;
    }
    .doc-print-table tbody tr:nth-child(even) td { background: #f5f7fa; }
    .doc-print-table .num {
      text-align: right;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .doc-print-table .nowrap { white-space: nowrap; }
    .doc-print-table tfoot td {
      border-top: 1.5px solid #374151;
      font-weight: 700;
      background: #eef2f7;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .doc-print-desglose {
      display: block;
      font-size: 7pt;
      color: #6b7280;
    }
    .doc-print-empty,
    .doc-print-note {
      margin: 8px 0 0;
      padding: 8px;
      border: 1px dashed #cbd5e1;
      border-radius: 4px;
      color: #6b7280;
      font-size: 8pt;
      text-align: center;
    }
    .doc-print-note { text-align: left; border-style: solid; background: #f8fafc; color: #374151; }
    .doc-print-footer { margin-top: 18px; }
    .doc-print-firmas {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 18px;
      margin-top: 42px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .doc-print-firma {
      padding-top: 4px;
      border-top: 1px solid #374151;
      text-align: center;
      font-size: 8pt;
      color: #374151;
    }
    .doc-print-pie {
      margin: 12px 0 0;
      padding-top: 4px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 7pt;
      color: #6b7280;
    }

    @media (max-width: 820px) {
      .doc-print-page {
        width: 100%;
        min-height: 0;
        padding: 16px;
      }
      .doc-print-header {
        grid-template-columns: 44px minmax(0, 1fr);
      }
      .doc-print-logo img { width: 44px; height: 44px; }
      .doc-print-meta {
        grid-column: 1 / -1;
        text-align: left;
        white-space: normal;
      }
      .doc-print-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .doc-print-firmas { grid-template-columns: 1fr; gap: 28px; }
    }

    @media print {
      .doc-print-root {
        min-height: 0;
        padding: 0;
        background: #fff;
      }
      .doc-print-controls { display: none !important; }
      .doc-print-page.print-page.print-multipage {
        width: auto;
        max-width: none;
        min-height: 0;
        margin: 0;
        /* El reset global de .print-page fija padding 0; recuperamos el
           margen de la hoja con mayor especificidad. */
        padding: 12mm !important;
        box-shadow: none;
        font-size: 8pt;
      }
      .doc-print-table { font-size: 7.5pt; }
      .doc-print-table th,
      .doc-print-table td { padding: 2px 4px; }
      .doc-print-firmas { margin-top: 26px; }
      .doc-print-kpi-value { font-size: 11pt; }
    }
  `],
})
export class DocumentoImpresionComponent {
  @Input() titulo = 'Documento';
  @Input() subtitulo = '';
  @Input() meta: DocumentoMeta[] = [];
  @Input() firmas: string[] = [];
  /** Ruta a la que vuelve el botón "Volver". */
  @Input() volverA = '/farmacia';

  get impresoEn(): string {
    return new Intl.DateTimeFormat('es-GT', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date());
  }

  volver(): void {
    history.back();
  }

  imprimir(): void {
    const body = document.body;
    const html = document.documentElement;
    const previo = {
      bodyOverflow: body.style.overflow,
      bodyHeight: body.style.height,
      htmlOverflow: html.style.overflow,
      htmlHeight: html.style.height,
    };

    body.style.overflow = 'visible';
    body.style.height = 'auto';
    html.style.overflow = 'visible';
    html.style.height = 'auto';

    setTimeout(() => {
      window.print();
      body.style.overflow = previo.bodyOverflow;
      body.style.height = previo.bodyHeight;
      html.style.overflow = previo.htmlOverflow;
      html.style.height = previo.htmlHeight;
    }, 100);
  }
}
