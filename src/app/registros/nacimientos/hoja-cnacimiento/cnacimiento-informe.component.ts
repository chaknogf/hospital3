import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface NombrePersona {
  primer_nombre?: string | null;
  segundo_nombre?: string | null;
  otro_nombre?: string | null;
  primer_apellido?: string | null;
  segundo_apellido?: string | null;
  apellido_casada?: string | null;
}

export interface NeonatalesInfo {
  peso_nacimiento?: string | null;
  hora_nacimiento?: string | null;
  tipo_parto?: string | null;
  clase_parto?: string | null;
  edad_gestacional?: string | null;
  id_medico?: number | null;
}

export interface DemograficosInfo {
  vecindad?: string | null;
  lugar_nacimiento?: string | null;
  nacionalidad?: string | null;
}

export interface MadreInfo {
  nombre?: NombrePersona | null;
  fecha_nacimiento?: string | null;
  cui?: string | null;
  pasaporte?: string | null;
  datos_extra?: { demograficos?: DemograficosInfo | null } | null;
}

export interface PacienteInfo {
  nombre?: NombrePersona | null;
  sexo?: string | null;
  fecha_nacimiento?: string | null;
  datos_extra?: { neonatales?: NeonatalesInfo | null } | null;
}

export interface MedicoInfo {
  nombre?: string | null;
  sexo?: string | null;
  colegiado?: string | number | null;
  dpi?: string | number | bigint | null;
}

export interface CnacimientoOut {
  id: number;
  documento?: string | null;
  fecha_registro?: string | null;
  hijos?: number | null;
  vivos?: number | null;
  muertos?: number | null;
  observaciones?: string | null;
  paciente?: PacienteInfo | null;
  madre?: MadreInfo | null;
  medico?: MedicoInfo | null;
}

const str = (v: unknown): string =>
  v == null ? '' : String(v);

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const capitalize = (s: string | null | undefined): string =>
  !s ? '' : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

@Component({
  selector: 'app-cnacimiento-informe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cnacimiento-informe.component.html',
  styleUrls: ['./cnacimiento-informe.component.scss'],
})
export class CnAcimientoInformeComponent {
  @Input({ required: true }) constancia!: CnacimientoOut;
  @Input() medico?: MedicoInfo | null;

  nombreCompleto(n: NombrePersona | null | undefined): string {
    if (!n) return '—';
    return [
      n.primer_nombre, n.segundo_nombre, n.otro_nombre,
      n.primer_apellido, n.segundo_apellido,
      n.apellido_casada ? `de ${n.apellido_casada}` : null,
    ].filter(Boolean).join(' ');
  }

  get fechaEmision() {
    const iso = this.constancia?.fecha_registro;
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return `${dias[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
  }

  get fechaNacimiento() {
    const iso = this.constancia?.paciente?.fecha_nacimiento;
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return `${dias[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
  }

  get horaNacimiento(): string {
    return this.constancia?.paciente?.datos_extra?.neonatales?.hora_nacimiento ?? '—';
  }

  get sexoNeonato(): string {
    const s = this.constancia?.paciente?.sexo;
    return s === 'M' ? 'Masculino' : s === 'F' ? 'Femenino' : s || '—';
  }

  get pesoNacer(): string {
    const p = this.constancia?.paciente?.datos_extra?.neonatales?.peso_nacimiento;
    if (!p) return '—';
    const lbs = Math.floor(Number(p) / 16);
    const oz = Number(p) % 16;
    return lbs ? `${lbs} lb ${oz} oz` : `${oz} oz`;
  }

  get tipoParto(): string {
    return this.constancia?.paciente?.datos_extra?.neonatales?.tipo_parto ?? '—';
  }

  get clasePartoTexto(): string {
    const c = this.constancia?.paciente?.datos_extra?.neonatales?.clase_parto;
    if (c === 'Pes') return 'Eutócico (Parto Vaginal Espontáneo)';
    if (c === 'Cstp') return 'Distócico (Cesárea)';
    return c ?? '—';
  }

  get edadMadre(): number | string {
    const fn = this.constancia?.madre?.fecha_nacimiento;
    if (!fn) return '—';
    const nac = new Date(fn);
    if (isNaN(nac.getTime())) return '—';
    return Math.floor((Date.now() - nac.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  }

  get documentoIdentificacionMadre(): string {
    const m = this.constancia?.madre;
    if (!m) return '—';
    if (typeof this.edadMadre === 'number' && this.edadMadre < 18) return 'Certificado de Nacimiento - CUI';
    if (m.cui) return 'DPI - CUI';
    if (m.pasaporte) return 'Pasaporte';
    return '—';
  }

  get numeroIdentificacionMadre(): string {
    const m = this.constancia?.madre;
    if (!m) return '—';
    if (m.cui) return str(m.cui).replace(/(\d{4})(\d{5})(\d{4})/, '$1 $2 $3');
    if (m.pasaporte) return m.pasaporte;
    return '—';
  }

  get vecindadMadre(): string {
    return this.constancia?.madre?.datos_extra?.demograficos?.vecindad ?? '—';
  }

  get nacionalidadMadre(): string {
    return this.constancia?.madre?.datos_extra?.demograficos?.nacionalidad ?? '—';
  }

  get lugarNacimientoMadre(): string {
    return this.constancia?.madre?.datos_extra?.demograficos?.lugar_nacimiento ?? '—';
  }

  get nombreMadre(): string {
    return this.nombreCompleto(this.constancia?.madre?.nombre ?? null);
  }

  get nombreMedico(): string {
    return this.medico?.nombre ?? '—';
  }

  get cargoMedico(): string {
    return this.medico?.sexo === 'F'
      ? 'Ginecóloga y Obstetra'
      : 'Ginecólogo y Obstetra';
  }

  get colegiadoMedico(): string {
    const m = this.medico;
    if (m?.colegiado) {
      const cui = str(m.dpi).replace(/(\d{4})(\d{5})(\d{4})/, '$1 $2 $3');
      const sufijo = cui ? ` — CUI: ${cui}` : '';
      return `Colegiado ${m.colegiado}${sufijo}`;
    }
    return 'Hospital General Tipo I de Tecpán Guatemala';
  }

  get esGuatemalteca(): boolean {
    return this.nacionalidadMadre === 'GTM' || !!this.constancia?.madre?.cui;
  }

  hoy() {
    const d = new Date();
    return { dia: d.getDate(), mes: MESES[d.getMonth()], anio: d.getFullYear() };
  }
}
