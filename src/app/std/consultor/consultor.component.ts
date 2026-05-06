import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConsultaService } from '../../Registros/consultas/consultas.service';
import { Router } from '@angular/router';
import { PacienteService } from '../../Registros/patient/paciente.service';
import { ConsultasIdPaciente, PacienteBuscado } from '../../interface/consultas';
import { Paciente, Referencia } from '../../interface/interfaces';
import { DatosExtraPipe } from '../../pipes/datos-extra.pipe';
import { TimePipe } from '../../pipes/time.pipe';
import { CuiPipe } from '../../pipes/cui.pipe';
import { EdadPipe } from '../../pipes/edad.pipe';

@Component({
  selector: 'app-consultor',
  templateUrl: './consultor.component.html',
  styleUrls: ['./consultor.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, DatosExtraPipe, TimePipe, CuiPipe, EdadPipe]
})
export class ConsultorComponent implements OnInit {

  private api = inject(ConsultaService);
  private apip = inject(PacienteService);
  private router = inject(Router);

  // ── Estado de búsqueda ──────────────────────────────────
  filtros = {
    paciente_id: '',
    expediente: '',
    documento: '',
    cui: '',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: ''
  };

  resultados: PacienteBuscado[] = [];
  mostrarTabla: boolean = false;
  buscando: boolean = false;

  // ── Datos del paciente seleccionado ────────────────────
  paciente!: Paciente;
  pacienteId: number = 0;
  consultasPorPaciente: ConsultasIdPaciente[] = [];
  cargandoPaciente: boolean = false;
  cargandoConsultas: boolean = false;
  error: string | null = null;

  // ── Listas procesadas ──────────────────────────────────
  demograficosFiltrados: { key: string; valor: any }[] = [];
  socioeconomicosFiltrados: { key: string; valor: any }[] = [];
  referenciasFiltradas: Referencia[] = [];
  metadatosArray: { key: string; valor: any }[] = [];
  neonatalesFiltrados: { key: string; valor: any }[] = [];

  ngOnInit() { }

  // ── Búsqueda ────────────────────────────────────────────
  buscar(): void {
    this.buscando = true;
    this.resultados = [];

    // Limpiar filtros vacíos antes de enviar
    const params: any = {};
    Object.entries(this.filtros).forEach(([k, v]) => {
      if (v !== '' && v !== null) params[k] = v;
    });

    this.api.getPacientesBuscados(params).subscribe({
      next: (data) => {
        this.resultados = data;
        this.mostrarTabla = true;
        this.buscando = false;
      },
      error: () => {
        this.buscando = false;
      }
    });
  }

  limpiarFiltros(): void {
    Object.keys(this.filtros).forEach(k => (this.filtros as any)[k] = '');
    this.resultados = [];
    this.mostrarTabla = false;
  }

  cerrarTabla(): void {
    this.mostrarTabla = false;
  }

  // ── Selección de paciente ───────────────────────────────
  seleccionarPaciente(p: PacienteBuscado): void {
    this.pacienteId = p.id;
    this.mostrarTabla = false;
    this.cargarPaciente();
    this.cargarConsultas();
  }

  private cargarPaciente(): void {
    if (!this.pacienteId) return;
    this.cargandoPaciente = true;

    // 🔥 Limpiar listas antes de cargar nuevo paciente
    this.demograficosFiltrados = [];
    this.socioeconomicosFiltrados = [];
    this.neonatalesFiltrados = [];
    this.referenciasFiltradas = [];
    this.metadatosArray = [];

    this.apip.getPaciente(this.pacienteId).subscribe({
      next: (data) => {
        this.paciente = data;
        this.procesarPaciente(); // ← debe estar aquí, dentro del next
        this.error = null;
        this.cargandoPaciente = false;
      },
      error: (err) => {
        this.error = err?.message || 'Error al cargar paciente.';
        this.cargandoPaciente = false;
      }
    });
  }

  private cargarConsultas(): void {
    this.cargandoConsultas = true;

    this.api.getConsultasPorPaciente(this.pacienteId, {}).subscribe({
      next: (data) => {
        this.consultasPorPaciente = data;
        this.cargandoConsultas = false;
      },
      error: () => {
        this.cargandoConsultas = false;
      }
    });
  }

  // ── Procesado ───────────────────────────────────────────
  private procesarPaciente(): void {
    if (!this.paciente) return;

    // Referencias
    this.referenciasFiltradas = Array.isArray(this.paciente.referencias)
      ? this.paciente.referencias.filter(ref => ref != null)
      : [];

    // Demográficos
    if (this.paciente.datos_extra?.demograficos) {
      this.demograficosFiltrados = Object.entries(this.paciente.datos_extra.demograficos)
        .filter(([, valor]) =>
          valor !== null && valor !== undefined && valor !== 0 && valor !== ''
        )
        .map(([key, valor]) => ({ key, valor }));
    } else {
      this.demograficosFiltrados = [];
    }

    // Socioeconómicos
    if (this.paciente.datos_extra?.socioeconomicos) {
      this.socioeconomicosFiltrados = Object.entries(this.paciente.datos_extra.socioeconomicos)
        .filter(([, valor]) =>
          valor !== null && valor !== undefined && valor !== '' && valor !== 0
        )
        .map(([key, valor]) => ({ key, valor }));
    } else {
      this.socioeconomicosFiltrados = [];
    }

    // Neonatales
    if (this.paciente.datos_extra?.neonatales) {
      this.neonatalesFiltrados = Object.entries(this.paciente.datos_extra.neonatales)
        .filter(([, valor]) =>
          valor !== null && valor !== undefined && valor !== '' && valor !== 0
        )
        .map(([key, valor]) => ({ key, valor }));
    } else {
      this.neonatalesFiltrados = [];
    }

    this.procesarMetadatos();
  }

  private procesarMetadatos(): void {
    this.metadatosArray = [];

    const metas = this.paciente?.metadatos;
    if (!Array.isArray(metas) || metas.length === 0) return;

    metas.forEach((evento, index) => {
      this.metadatosArray.push({
        key: `Evento ${index + 1}`,
        valor: {
          usuario: evento.usuario,
          registro: this.formatearFecha(evento.registro),
          accion: evento.accion,
          expediente_duplicado: evento.expediente_duplicado ? 'Sí' : 'No'
        }
      });
    });
  }

  private extraerFiltrado(obj: any): { key: string; valor: any }[] {
    if (!obj) return [];
    return Object.entries(obj)
      .filter(([, v]) => v !== null && v !== undefined && v !== '' && v !== 0)
      .map(([key, valor]) => ({ key, valor }));
  }



  // ── Helpers de vista ────────────────────────────────────
  get estadoPaciente(): string {
    const mapa: Record<string, string> = { V: 'Vivo', F: 'Fallecido', I: 'Inactivo', A: 'Activo' };
    const e = this.paciente?.estado?.trim().toUpperCase() ?? '';
    return mapa[e] ?? 'Desconocido';
  }

  get fechaDefuncion(): string | null {
    return this.paciente?.datos_extra?.defuncion || null;
  }

  get cuiPersona(): string | null {
    return this.paciente?.datos_extra?.personaid || null;
  }

  get tieneReferencias(): boolean {
    return this.referenciasFiltradas.length > 0;
  }

  formatearFecha(fecha: string | null | undefined): string {
    if (!fecha) return 'No disponible';
    try {
      return new Date(fecha).toLocaleDateString('es-GT', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return fecha; }
  }

  convertirClave(key: string): string {
    const mapa: Record<string, string> = {
      idioma: 'Idioma', pueblo: 'Pueblo', estado_civil: 'Estado civil',
      nacionalidad: 'Nacionalidad', lugar_nacimiento: 'Lugar de nacimiento',
      ocupacion: 'Ocupación', educacion: 'Nivel educativo',
      peso_nacimiento: 'Peso al nacimiento Lb.Onz',
      edad_gestacional: 'Edad gestacional (semanas)',
      tipo_parto: 'Tipo de parto', clase_parto: 'Clase de parto',
      hora_nacimiento: 'Hora de nacimiento',
      expediente_madre: 'Expediente de la madre',
      defuncion: 'Fecha de defunción'
    };
    return mapa[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getNombreReferencia(ref: Referencia): string { return ref.nombre ?? 'Sin nombre'; }
  getParentesco(ref: any): string { return ref?.parentesco || 'Sin parentesco'; }
  getTelefono(ref: any): string { return ref?.telefono || 'Sin teléfono'; }
  getExpediente(ref: any): string { return ref?.expediente || '—'; }
  getIdPersona(ref: any): string { return ref?.idpersona || '—'; }

  verDetalle(id: number): void { this.router.navigate(['/detalleAdmision', id]); }
  editar(id: number): void { this.router.navigate(['/pacienteEdit', id]); }
  regresar(): void { this.router.navigate(['/pacientes']); }
}
