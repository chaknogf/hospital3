import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '@services/api.service';
import { PacienteResumen } from '@models/interfaces';

@Component({
  selector: 'app-personal-hospital-list',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './personal-hospital-list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./personal-hospital-list.component.css']
})
export class PersonalHospitalListComponent implements OnInit {
  private api = inject(ApiService);

  pacientes: PacienteResumen[] = [];
  cargando = false;
  error: string | null = null;

  readonly pageSize = 10;
  paginaActual = 1;
  totalDeRegistros = 0;

  filtros = {
    expediente: '',
    cui: '',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: ''
  };

  get totalPaginas(): number {
    return Math.ceil(this.totalDeRegistros / this.pageSize) || 1;
  }

  get hayPaginaAnterior(): boolean { return this.paginaActual > 1; }
  get hayPaginaSiguiente(): boolean { return this.paginaActual < this.totalPaginas; }

  get paginas(): number[] {
    const total = this.totalPaginas;
    const actual = this.paginaActual;
    const delta = 2;
    const rango: number[] = [];
    for (let i = Math.max(1, actual - delta); i <= Math.min(total, actual + delta); i++) {
      rango.push(i);
    }
    return rango;
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = null;
    const skip = (this.paginaActual - 1) * this.pageSize;
    this.api.getPersonalHospitalPacientes({ skip, limit: this.pageSize, ...this.filtros }).subscribe({
      next: (res) => {
        this.pacientes = res.pacientes;
        this.totalDeRegistros = res.total;
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar personal del hospital';
        this.cargando = false;
      }
    });
  }

  buscar(): void {
    this.paginaActual = 1;
    this.cargar();
  }

  limpiarFiltros(): void {
    this.filtros = {
      expediente: '',
      cui: '',
      primer_nombre: '',
      segundo_nombre: '',
      primer_apellido: '',
      segundo_apellido: ''
    };
    this.paginaActual = 1;
    this.cargar();
  }

  cambiarPagina(paso: number): void {
    const nueva = this.paginaActual + paso;
    if (nueva < 1 || nueva > this.totalPaginas) return;
    this.paginaActual = nueva;
    this.cargar();
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.cargar();
  }

  async descargarExcel(): Promise<void> {
    if (this.totalDeRegistros === 0) return;
    this.api.getPersonalHospitalPacientes({ skip: 0, limit: this.totalDeRegistros, ...this.filtros }).subscribe({
      next: async (res) => {
        const rows = res.pacientes.map((p: any) => ({
          ID: p.id,
          Expediente: p.expediente || '-',
          Nombre: p.nombre_completo || '—',
          Sexo: p.sexo || '-',
          'Fecha Nacimiento': p.fecha_nacimiento ? new Date(p.fecha_nacimiento).toLocaleDateString('es-GT') : '-',
          Estado: p.estado === 'V' ? 'Vivo' : p.estado === 'F' ? 'Fallecido' : 'Inactivo',
        }));
        const { default: ExcelJS } = await import('exceljs');
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Personal Hospital');
        ws.columns = Object.keys(rows[0]).map(k => ({ header: k, key: k, width: Math.max(k.length, 20) }));
        ws.addRows(rows);
        const buffer = await wb.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `personal_hospital_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }
}
