import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '@services/api.service';
import { Especialidades } from '@enums/especialidades';

interface ReferenciaListaItem {
  id: number;
  paciente_id: number | null;
  expediente: string | null;
  tipo_consulta: number | null;
  tipo_consulta_nombre: string | null;
  especialidad: string | null;
  fecha_consulta: string | null;
  sexo: string | null;
  edad: number | null;
  diagnostico: string | null;
  viene_referido_de: string | null;
  va_referido_a: string | null;
  viene_referido: string | null;
  fue_referido: string | null;
}

interface ReferenciaResumenItem {
  direccion: string;
  direccion_nombre: string;
  referencia: string;
  total_consultas: number;
  consultas_distintas: number;
  pacientes_distintos: number;
  variantes: { valor: string; total: number }[];
}

@Component({
  selector: 'app-referencias-consultas',
  imports: [FormsModule, RouterLink],
  templateUrl: './referencias-consultas.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./referencias-consultas.component.css']
})
/** Presenta la lista paginada y el resumen de referencias del período seleccionado. */
export class ReferenciasConsultasComponent implements OnInit {
  private api = inject(ApiService);

  data: any = null;
  lista: ReferenciaListaItem[] = [];
  resumen: ReferenciaResumenItem[] = [];
  cargando = false;
  descargando = false;
  error: string | null = null;

  desde = '';
  hasta = '';
  tipoConsulta: number | undefined = undefined;
  especialidad = '';
  skip = 0;
  limit = 100;
  direccion: '' | 'viene' | 'va' = '';

  readonly tiposConsulta = [
    { value: undefined, label: 'Todos' },
    { value: 1, label: 'COEX' },
    { value: 2, label: 'Hospitalización' },
    { value: 3, label: 'Emergencia' }
  ];

  readonly especialidades = Especialidades;

  get totalLista(): number {
    return this.data?.total_general ?? 0;
  }

  get paginaActual(): number {
    return Math.floor(this.skip / this.limit) + 1;
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.totalLista / this.limit));
  }

  get resumenFiltrado(): ReferenciaResumenItem[] {
    if (!this.direccion) return this.resumen;
    return this.resumen.filter(r => r.direccion === this.direccion);
  }

  ngOnInit(): void {
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.desde = inicio.toISOString().split('T')[0];
    this.hasta = hoy.toISOString().split('T')[0];
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = null;
    this.api
      .getReferenciasConsultas({
        desde: this.desde,
        hasta: this.hasta,
        tipo_consulta: this.tipoConsulta ?? null,
        especialidad: this.especialidad || null,
        skip: this.skip,
        limit: this.limit
      })
      .subscribe({
        next: (res) => {
          this.data = res;
          this.lista = res?.lista ?? [];
          this.resumen = res?.resumen ?? [];
          this.cargando = false;
        },
        error: () => { this.error = 'Error al cargar datos'; this.cargando = false; }
      });
  }

  aplicarFiltros(): void {
    this.skip = 0;
    this.cargar();
  }

  limpiar(): void {
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.desde = inicio.toISOString().split('T')[0];
    this.hasta = hoy.toISOString().split('T')[0];
    this.tipoConsulta = undefined;
    this.especialidad = '';
    this.direccion = '';
    this.skip = 0;
    this.cargar();
  }

  paginaSiguiente(): void {
    this.skip += this.limit;
    this.cargar();
  }

  paginaAnterior(): void {
    if (this.skip >= this.limit) {
      this.skip -= this.limit;
      this.cargar();
    }
  }

  origen(item: ReferenciaListaItem): string {
    return item.viene_referido_de || item.viene_referido || '—';
  }

  destino(item: ReferenciaListaItem): string {
    return item.va_referido_a || item.fue_referido || '—';
  }

sexoLabel(sexo: string | null): string {
    if (sexo === 'M') return 'M';
    if (sexo === 'F') return 'F';
    return '—';
  }

  /** Descarga el resumen por institución y el detalle completo del rango filtrado. */
  async descargarExcel(): Promise<void> {
    if (this.descargando) return;
    if (this.desde > this.hasta) {
      alert('La fecha "desde" no puede ser mayor que la fecha "hasta".');
      return;
    }

    this.descargando = true;
    try {
      const lista = await this.traerListaCompleta();
      if (!lista.length) {
        alert('No hay registros para exportar con los filtros seleccionados.');
        return;
      }

      const rowsResumen = this.resumenFiltrado.map(r => ({
        'Dirección': r.direccion_nombre,
        'Institución': r.referencia,
        'Consultas': r.total_consultas,
        'Consultas distintas': r.consultas_distintas,
        'Pacientes distintos': r.pacientes_distintos,
        'Variantes': r.variantes.map(v => `${v.valor} (${v.total})`).join(' | ')
      }));

      const rowsDetalle = lista.map(c => ({
        'Id': c.id,
        'Expediente': c.expediente || '',
        'Fecha': c.fecha_consulta || '',
        'Tipo': c.tipo_consulta_nombre || '',
        'Especialidad': c.especialidad || '',
        'Sexo': this.sexoLabel(c.sexo),
        'Edad': c.edad ?? '',
        'Diagnóstico': c.diagnostico || '',
        'Viene referido de': this.origen(c),
        'Va referido a': this.destino(c)
      }));

      const { default: ExcelJS } = await import('exceljs');
      const wb = new ExcelJS.Workbook();
      const wsDetalle = wb.addWorksheet('Detalle');
      const wsResumen = wb.addWorksheet('Resumen');

      wsDetalle.columns = Object.keys(rowsDetalle[0]).map(k => ({ header: k, key: k, width: Math.max(k.length, 18) }));
      wsDetalle.addRows(rowsDetalle);

      if (rowsResumen.length) {
        wsResumen.columns = Object.keys(rowsResumen[0]).map(k => ({ header: k, key: k, width: Math.max(k.length, 18) }));
        wsResumen.addRows(rowsResumen);
      }

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `referencias_consultas_${this.desde}_${this.hasta}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al descargar Excel:', err);
      alert('Error al descargar el Excel. Intente de nuevo.');
    } finally {
      this.descargando = false;
    }
  }

  /** El endpoint limita `limit` a 1000, así que se recorre en páginas. */
  private async traerListaCompleta(): Promise<ReferenciaListaItem[]> {
    const porPagina = 1000;
    const acumulado: ReferenciaListaItem[] = [];
    let skip = 0;
    let total = 0;

    do {
      const res: any = await firstValueFrom(
        this.api.getReferenciasConsultas({
          desde: this.desde,
          hasta: this.hasta,
          tipo_consulta: this.tipoConsulta ?? null,
          especialidad: this.especialidad || null,
          skip,
          limit: porPagina
        })
      );
      const pagina: ReferenciaListaItem[] = res?.lista ?? [];
      acumulado.push(...pagina);
      total = res?.total_general ?? 0;
      skip += porPagina;
      if (!pagina.length) break;
    } while (acumulado.length < total);

    return acumulado;
  }
}