import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefuncionOut, FallecidoInfo, MadreInfo } from '../defunciones.interface';
import { Medico } from '../../../interface/medicos.interface';
import { DefuncionesService } from '../defunciones.service';
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function parseDateLocal(iso: string): Date | null {
  if (!iso) return null;
  const parts = iso.split('T')[0].split('-').map(Number);
  if (parts.length === 3 && parts.every(n => !isNaN(n))) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

@Component({
  selector: 'app-defuncion-informe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './defuncion-informe.component.html',
  styleUrls: ['./defuncion-informe.component.css'],
})
export class DefuncionInformeComponent implements OnChanges {
  private defuncionesService = inject(DefuncionesService);

  @Input() defuncion: DefuncionOut | null = null;
  @Input() defuncionId: number | null = null;
  @Output() cargado = new EventEmitter<DefuncionOut>();

  cargando = false;
  error: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['defuncionId'] && this.defuncionId != null && !this.defuncion) {
      this.cargar(this.defuncionId);
    }
  }

  private cargar(id: number): void {
    this.cargando = true;
    this.error = null;
    this.defuncionesService.getDefuncion(id).subscribe({
      next: (d) => {
        this.defuncion = d as DefuncionOut;
        this.cargando = false;
        this.cargado.emit(d as DefuncionOut);
      },
      error: () => {
        this.error = 'No se pudo cargar el informe de defunción.';
        this.cargando = false;
      },
    });
  }

  nombreCompleto(p?: FallecidoInfo | MadreInfo | Medico | null): string {
    if (!p) return '';
    const obj = p as any;
    if (obj.nombre_completo) return obj.nombre_completo;
    if (typeof obj.nombre === 'string') return obj.nombre;
    if (obj.nombre && typeof obj.nombre === 'object') {
      const n = obj.nombre;
      const nombres = [n['primer_nombre'], n['segundo_nombre'], n['otro_nombre']].filter(Boolean).join(' ');
      const apellidos = [n['primer_apellido'], n['segundo_apellido']].filter(Boolean).join(' ');
      const casada = n['apellido_casada'] ? ' de ' + n['apellido_casada'] : '';
      return (nombres + ' ' + apellidos + casada).trim();
    }
    return [obj.nombres, obj.apellidos].filter(Boolean).join(' ').trim();
  }

  marcado(valor: string | number | null | undefined, ...opciones: (string | number)[]): string {
    if (valor === null || valor === undefined) return '';
    const v = String(valor).trim().toLowerCase();
    return opciones.some(o => String(o).trim().toLowerCase() === v) ? 'X' : '';
  }

  marcadoBool(valor: boolean | null | undefined, esperado: boolean): string {
    return valor === esperado ? 'X' : '';
  }

  get fecha() {
    const iso = this.defuncion?.fecha_defuncion;
    if (!iso) return { dia: '', mes: '', anio: '', hora: '' };
    const d = parseDateLocal(iso);
    if (!d) return { dia: '', mes: '', anio: '', hora: '' };
    return {
      dia: d.getDate().toString(),
      mes: MESES[d.getMonth()],
      anio: d.getFullYear().toString(),
      hora: iso.includes('T') ? iso.slice(11, 16) : '',
    };
  }

  get edadCumplida() {
    const f = this.defuncion;
    if (!f) return { horas: '', dias: '', meses: '', anios: '' };
    if (f.fallecido_edad_horas != null) return { horas: f.fallecido_edad_horas, dias: '', meses: '', anios: '' };
    if (f.fallecido_edad_dias != null) return { horas: '', dias: f.fallecido_edad_dias, meses: '', anios: '' };
    if (f.fallecido_edad_meses != null) return { horas: '', dias: '', meses: f.fallecido_edad_meses, anios: '' };
    if (f.fallecido_edad_anios != null) return { horas: '', dias: '', meses: '', anios: f.fallecido_edad_anios };
    return { horas: '', dias: '', meses: '', anios: '' };
  }

  hoy() {
    const d = new Date();
    return { dia: d.getDate(), mes: MESES[d.getMonth()], anio: d.getFullYear() };
  }
}
