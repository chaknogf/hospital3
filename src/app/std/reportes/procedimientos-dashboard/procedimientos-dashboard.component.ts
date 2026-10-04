import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '@services/api.service';
import { StdService } from '../../std.service';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-procedimientos-dashboard',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './procedimientos-dashboard.component.html',
  styleUrls: ['./procedimientos-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class ProcedimientosDashboardComponent implements OnInit {
  private api = inject(ApiService);
  private stdService = inject(StdService);

  /** Grupos etarios IMCI/OMS en orden, con las etiquetas de columna del Excel. */
  private readonly GRUPOS_EDAD_REPORTE = [
    { codigo: 'NEO', nombre: 'Neonato (0 a 28 días)', etiquetaM: 'NEO M', etiquetaF: 'NEO F' },
    { codigo: 'LAC', nombre: 'Lactante (>28 días a 12 meses)', etiquetaM: 'LAC M', etiquetaF: 'LAC F' },
    { codigo: 'PRI', nombre: 'Primera infancia (1 a <5 años)', etiquetaM: 'PRI M', etiquetaF: 'PRI F' },
    { codigo: 'SEG', nombre: 'Segunda infancia (>5 a 11 años)', etiquetaM: 'SEG M', etiquetaF: 'SEG F' },
    { codigo: 'ADO', nombre: 'Adolescente (12 a <18 años)', etiquetaM: 'ADO M', etiquetaF: 'ADO F' },
    { codigo: 'ADU', nombre: 'Adulto (18 a 59 años)', etiquetaM: 'ADU M', etiquetaF: 'ADU F' },
    { codigo: 'ADM', nombre: 'Adulto mayor (60 años o más)', etiquetaM: 'ADM M', etiquetaF: 'ADM F' }
  ];

  filtros: { desde: string; hasta: string; especialidad: string; lugar_servicio: string; sexo: string; nombre: string };

  cargando = false;
  descargando = false;
  error: string | null = null;

  // Vista pivote (reporte)
  totales: any = null;
  lugares: string[] = [];
  rows: { especialidad: string; lugares: { M: number; F: number; total: number }[]; total: number }[] = [];
  colTotales: { M: number; F: number; total: number }[] = [];
  totalGeneral = 0;

  // Vistas extra
  top5: Array<{ nombre: string; total_cantidad: number; total_anestesia: number; total?: number }> = [];
  registrosPorServicio: Array<{ lugar_servicio: string; total_registros: number }> = [];

  constructor() {
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.filtros = {
      desde: inicio.toISOString().split('T')[0],
      hasta: hoy.toISOString().split('T')[0],
      especialidad: '',
      lugar_servicio: '',
      sexo: '',
      nombre: ''
    };
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = null;

    const f: any = {
      desde: this.filtros.desde || undefined,
      hasta: this.filtros.hasta || undefined,
      especialidad: this.filtros.especialidad?.trim() || undefined,
      lugar_servicio: this.filtros.lugar_servicio?.trim() || undefined,
      sexo: this.filtros.sexo || undefined,
      nombre: this.filtros.nombre?.trim() || undefined
    };

    // Cargar reporte
    this.api.getReporteProcedimientos(f).subscribe({
      next: (res) => {
        this.totales = res.totales || null;
        const grupos = res.grupos || [];
        this.agruparReporte(grupos);
        this.extraerResumen(grupos);
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar datos';
        this.cargando = false;
      }
    });

    // Cargar resumen (top 5) con mismos filtros
    this.api.getResumenProcedimientos(f).subscribe({
      next: (res) => {
        const top = res?.top_procedimientos || res?.resumen || [];
        this.top5 = top.map((p: any) => ({
          nombre: p.nombre,
          total_cantidad: p.total_cantidad ?? 0,
          total_anestesia: p.total_anestesia ?? 0,
          total: p.total
        }));
      },
      error: () => { /* opcional */ }
    });
  }

  limpiar(): void {
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.filtros = { desde: inicio.toISOString().split('T')[0], hasta: hoy.toISOString().split('T')[0], especialidad: '', lugar_servicio: '', sexo: '', nombre: '' };
    this.cargar();
  }

  private extraerResumen(grupos: any[]): void {
    const servicioMap = new Map<string, number>();
    for (const g of grupos) {
      const key = g.lugar_servicio || '—';
      servicioMap.set(key, (servicioMap.get(key) || 0) + (g.total_registros || 0));
    }
    this.registrosPorServicio = Array.from(servicioMap.entries())
      .map(([lugar_servicio, total_registros]) => ({ lugar_servicio, total_registros }))
      .sort((a, b) => b.total_registros - a.total_registros);
  }

  private agruparReporte(datos: any[]): void {
    const lugarSet = new Set<string>();
    const espSet = new Set<string>();
    for (const d of datos) {
      lugarSet.add(d.lugar_servicio || '—');
      espSet.add(d.especialidad || '—');
    }
    this.lugares = [...lugarSet].sort();
    const especialidades = [...espSet];
    this.rows = especialidades.map(esp => {
      const lugaresArr: { M: number; F: number; total: number }[] = [];
      let totalEsp = 0;
      for (const lug of this.lugares) {
        const m = datos.find(x => (x.especialidad || '—') === esp && (x.lugar_servicio || '—') === lug && x.sexo === 'M');
        const f = datos.find(x => (x.especialidad || '—') === esp && (x.lugar_servicio || '—') === lug && x.sexo === 'F');
        const t = {
          M: m?.total_cantidad ?? 0,
          F: f?.total_cantidad ?? 0,
          total: (m?.total_cantidad ?? 0) + (f?.total_cantidad ?? 0)
        };
        lugaresArr.push(t);
        totalEsp += t.total;
      }
      return { especialidad: esp, lugares: lugaresArr, total: totalEsp };
    }).sort((a, b) => b.total - a.total);

    this.colTotales = this.lugares.map((_, i) => {
      const M = this.rows.reduce((s, r) => s + r.lugares[i].M, 0);
      const F = this.rows.reduce((s, r) => s + r.lugares[i].F, 0);
      return { M, F, total: M + F };
    });
    this.totalGeneral = this.rows.reduce((s, r) => s + r.total, 0);
  }

  async descargarExcel(): Promise<void> {
    if (this.descargando) return;
    if (this.filtros.desde && this.filtros.hasta && this.filtros.desde > this.filtros.hasta) {
      alert('La fecha "desde" no puede ser mayor que la fecha "hasta".');
      return;
    }

    this.descargando = true;
    try {
      const f: any = {
        fecha_inicio: this.filtros.desde || undefined,
        fecha_fin: this.filtros.hasta || undefined,
        especialidad: this.filtros.especialidad?.trim() || undefined,
        lugar_servicio: this.filtros.lugar_servicio?.trim() || undefined,
        sexo: this.filtros.sexo || undefined,
        skip: 0,
        limit: 100000
      };

      const registros = await this.traerRegistros(f);
      if (!registros.length) {
        alert('No hay registros para exportar con los filtros seleccionados.');
        return;
      }

      const { default: ExcelJS } = await import('exceljs');
      const wb = new ExcelJS.Workbook();
      const wsRegistros = wb.addWorksheet('Registros');
      const wsResumen = wb.addWorksheet('Resumen por edad');

      // ── Hoja 1: un renglón por registro, con el desglose en columnas ──
      const columnasEdad: string[] = [];
      for (const g of this.GRUPOS_EDAD_REPORTE) {
        columnasEdad.push(g.etiquetaM, g.etiquetaF);
      }

      const rowsDetalle = registros.map((p: any) => {
        const detalle = p.grupo_edad_detalle || {};
        const fila: Record<string, any> = {
          'Id': p.id,
          'Fecha': p.fecha || '',
          'Especialidad': p.especialidad || '',
          'Lugar/Servicio': p.lugar_servicio || '',
          'Procedimiento': p.catalogo?.nombre || p.procedimiento?.nombre || '',
          'Código': p.catalogo?.abreviatura || p.procedimiento?.abreviatura || '',
          'Zona de intervención': p.area_cuerpo?.nombre || '',
          'Región': p.area_cuerpo?.region || ''
        };
        for (const g of this.GRUPOS_EDAD_REPORTE) {
          const v = detalle[g.codigo];
          fila[g.etiquetaM] = v?.m ?? 0;
          fila[g.etiquetaF] = v?.f ?? 0;
        }
        fila['Total M'] = this.totalSexo(p, 'm');
        fila['Total F'] = this.totalSexo(p, 'f');
        fila['Total'] = p.cantidad ?? 0;
        fila['Anestesia'] = p.anestesia ?? 0;
        fila['Sexo histórico'] = p.sexo || '';
        fila['Responsable'] = p.responsable || '';
        fila['Registrado por'] = p.created_by || '';
        return fila;
      });

      wsRegistros.columns = Object.keys(rowsDetalle[0]).map(k => ({
        header: k,
        key: k,
        width: Math.max(k.length, 12)
      }));
      wsRegistros.addRows(rowsDetalle);
      this.estilizarHoja(wsRegistros, columnasEdad);

      // ── Hoja 2: totales por grupo de edad y sexo ──
      const rowsResumen: Record<string, any>[] = this.GRUPOS_EDAD_REPORTE.map((g: any) => {
        let m = 0;
        let f = 0;
        for (const p of registros) {
          const v = p.grupo_edad_detalle?.[g.codigo];
          m += v?.m ?? 0;
          f += v?.f ?? 0;
        }
        return {
          'Grupo de edad': g.nombre,
          'Código': g.codigo,
          'Masculino': m,
          'Femenino': f,
          'Total': m + f
        };
      });

      // Los registros históricos nunca recibieron grupo etario: se agrupan aparte
      let legacyM = 0;
      let legacyF = 0;
      for (const p of registros) {
        if (p.grupo_edad_detalle) continue;
        if (p.sexo === 'M') legacyM += p.cantidad ?? 0;
        else if (p.sexo === 'F') legacyF += p.cantidad ?? 0;
      }
      if (legacyM || legacyF) {
        rowsResumen.push({
          'Grupo de edad': 'Sin grupo de edad (registro histórico)',
          'Código': 'LEG',
          'Masculino': legacyM,
          'Femenino': legacyF,
          'Total': legacyM + legacyF
        });
      }

      rowsResumen.push({
        'Grupo de edad': 'TOTAL',
        'Código': '',
        'Masculino': rowsResumen.reduce((s: number, r: any) => s + r.Masculino, 0),
        'Femenino': rowsResumen.reduce((s: number, r: any) => s + r.Femenino, 0),
        'Total': rowsResumen.reduce((s: number, r: any) => s + r.Total, 0)
      });

      wsResumen.columns = Object.keys(rowsResumen[0]).map(k => ({
        header: k,
        key: k,
        width: Math.max(k.length, 18)
      }));
      wsResumen.addRows(rowsResumen);
      this.estilizarHoja(wsResumen, []);

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `procedimientos_${this.filtros.desde || 'inicio'}_${this.filtros.hasta || 'fin'}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al descargar Excel:', err);
      alert('Error al exportar los datos');
    } finally {
      this.descargando = false;
    }
  }

  /** Trae todos los registros que pasan los filtros. */
  private async traerRegistros(filtros: any): Promise<any[]> {
    const res = await firstValueFrom(this.stdService.getProcedimientos(filtros));
    return res?.procedimientos || [];
  }

  /**
   * Suma de uno de los sexos en todos los grupos etarios de un registro.
   * Los registros históricos no tienen desglose: su cantidad se atribuye al
   * sexo con que se capturó, para que Total M + Total F siempre iguale Total.
   */
  private totalSexo(p: any, clave: 'm' | 'f'): number {
    const detalle = p.grupo_edad_detalle;
    if (!detalle) {
      return p.sexo === (clave === 'm' ? 'M' : 'F') ? p.cantidad ?? 0 : 0;
    }
    let total = 0;
    for (const valores of Object.values(detalle)) {
      total += (valores as any)?.[clave] ?? 0;
    }
    return total;
  }

  /** Encabezado en negrita, filtros congelados y anchos por tipo de dato. */
  private estilizarHoja(ws: any, columnasEdad: string[]): void {
    const encabezado = ws.getRow(1);
    encabezado.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    encabezado.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
    encabezado.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    encabezado.height = 30;
    ws.views = [{ state: 'frozen', ySplit: 1 }];

    ws.eachRow((row: any, n: number) => {
      if (n === 1) return;
      row.eachCell((cell: any) => {
        if (typeof cell.value === 'number') {
          cell.numFmt = '0';
          cell.alignment = { horizontal: 'center' };
        }
      });
    });

    for (const col of columnasEdad) {
      const idx = ws.columns.findIndex((c: any) => c.key === col) + 1;
      if (idx > 0) ws.getColumn(idx).width = 11;
    }
  }
}
