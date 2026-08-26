import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConsultaService } from '../../registros/consultas/consultas.service';
import { Router } from '@angular/router';
import { PacienteService } from '../../registros/patient/paciente.service';
import { ConsultasIdPaciente, ConsultaOut, ConsultaListResponse, PacienteBuscado } from '../../interface/consultas';
import { Paciente, Referencia } from '../../interface/interfaces';
import { DatosExtraPipe } from '../../pipes/datos-extra.pipe';
import { TimePipe } from '../../pipes/time.pipe';
import { CuiPipe } from '../../pipes/cui.pipe';
import { EdadPipe } from '../../pipes/edad.pipe';
import { Location } from '@angular/common';
import { Citas } from '../../interface/citas';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Cie10Component } from '../../medica/cie10/cie10.component';
import { Dict, especialidades, tipoConsulta } from '../../enum/diccionarios';

@Component({
  selector: 'app-consultor',
  templateUrl: './consultor.component.html',
  styleUrls: ['./consultor.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, DatosExtraPipe, TimePipe, CuiPipe, EdadPipe, Cie10Component]
})
export class ConsultorComponent implements OnInit, OnDestroy {

  private api = inject(ConsultaService);
  private apip = inject(PacienteService);
  private router = inject(Router);
  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef);

  private destroy$ = new Subject<void>();

  // ── Estado del sidebar (bottom sheet en mobile) ──────────
  sidebarAbierto: boolean = false;

  // ── CIE-10 modal ─────────────────────────────────────────────
  cie10Abierto = signal(false);
  cie10Mensaje = signal('');

  // ── Estado de búsqueda ──────────────────────────────────
  modoBusqueda: 'pacientes' | 'consultas' = 'pacientes';

  filtros = {
    q: '',
    paciente_id: '',
    expediente: '',
    documento: '',
    cui: '',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    fecha_nacimiento: '',
    especialidad: '',
    tipo_consulta: '',
    fecha_consulta: ''
  };
  limit: number = 10;

  listaEspecialidades: Dict[] = especialidades;
  listaTiposConsulta: Dict[] = tipoConsulta;

  resultados: PacienteBuscado[] = [];
  resultadosConsultas: ConsultaOut[] = [];
  totalConsultas: number = 0;
  mostrarTabla: boolean = false;
  buscando: boolean = false;

  // ── Datos del paciente seleccionado ────────────────────
  paciente!: Paciente;
  pacienteId: number = 0;
  consultasPorPaciente: ConsultasIdPaciente[] = [];
  cargandoPaciente: boolean = false;
  cargandoConsultas: boolean = false;
  error: string | null = null;
  citasPorPaciente: Citas[] = [];
  citasProcesadas: { titulo: string; campos: { key: string; valor: any }[] }[] = [];
  rol: string | null = '';

  // ── Listas procesadas ──────────────────────────────────
  demograficosFiltrados: { key: string; valor: any }[] = [];
  socioeconomicosFiltrados: { key: string; valor: any }[] = [];
  referenciasFiltradas: Referencia[] = [];
  metadatosArray: { key: string; valor: any }[] = [];
  neonatalesFiltrados: { key: string; valor: any }[] = [];

  ngOnInit() {

    this.rol = localStorage.getItem('role');
    console.log(this.rol);

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── CIE-10 ──────────────────────────────────────────────────
  abrirCie10(): void {
    this.cie10Abierto.set(true);
  }

  cerrarCie10(): void {
    this.cie10Abierto.set(false);
  }

  // ── Control del sidebar / bottom sheet ─────────────────
  toggleSidebar(): void {
    this.sidebarAbierto = !this.sidebarAbierto;
  }

  cerrarSidebar(): void {
    this.sidebarAbierto = false;
  }

  /** Cierra el sidebar automáticamente en mobile (< 768px) */
  private cerrarSidebarEnMobile(): void {
    if (window.innerWidth < 768) {
      this.sidebarAbierto = false;
    }
  }

  // ── Búsqueda ────────────────────────────────────────────
  buscar(): void {
    if (this.modoBusqueda === 'consultas') {
      this.buscarConsultas();
    } else {
      this.buscarPacientes();
    }
  }

  private buscarPacientes(): void {
    this.buscando = true;
    this.resultados = [];
    this.resultadosConsultas = [];

    const params: any = { limit: this.limit };

    Object.entries(this.filtros).forEach(([k, v]) => {
      const val = typeof v === 'string' ? v.trim() : v;
      if (val !== '' && val !== null && val !== undefined) {
        params[k] = val;
      }
    });

    const tieneDocumento = !!this.filtros.documento && this.filtros.documento.trim() !== '';

    if (tieneDocumento) {
      this.api.getPacientesBuscados(params).pipe(takeUntil(this.destroy$)).subscribe({
        next: (data) => {
          this.resultados = data;
          this.mostrarTabla = true;
          this.buscando = false;
          this.cerrarSidebarEnMobile();
          this.cdr.markForCheck();
        },
        error: () => {
          this.buscando = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      this.apip.getPacientes(params).pipe(takeUntil(this.destroy$)).subscribe({
        next: (data) => {
          this.resultados = data.pacientes.map(p => ({
            id: p.id,
            cui: p.cui ?? 0,
            expediente: p.expediente ?? '',
            nombre_completo: p.nombre_completo
              ?? `${p.nombre.primer_nombre} ${p.nombre.primer_apellido}`,
            fecha_nacimiento: p.fecha_nacimiento ?? ''
          }));
          this.mostrarTabla = true;
          this.buscando = false;
          this.cerrarSidebarEnMobile();
          this.cdr.markForCheck();
        },
        error: () => {
          this.buscando = false;
          this.cdr.markForCheck();
        }
      });
    }
  }

  private buscarConsultas(): void {
    this.buscando = true;
    this.resultados = [];
    this.resultadosConsultas = [];

    const params: any = { limit: this.limit };

    if (this.filtros.expediente.trim()) params.expediente = this.filtros.expediente.trim();
    if (this.filtros.paciente_id) params.paciente_id = this.filtros.paciente_id;
    if (this.filtros.documento.trim()) params.documento = this.filtros.documento.trim();
    if (this.filtros.primer_nombre.trim()) params.primer_nombre = this.filtros.primer_nombre.trim();
    if (this.filtros.segundo_nombre.trim()) params.segundo_nombre = this.filtros.segundo_nombre.trim();
    if (this.filtros.primer_apellido.trim()) params.primer_apellido = this.filtros.primer_apellido.trim();
    if (this.filtros.segundo_apellido.trim()) params.segundo_apellido = this.filtros.segundo_apellido.trim();
    if (this.filtros.especialidad) params.especialidad = this.filtros.especialidad;
    if (this.filtros.tipo_consulta !== '') params.tipo_consulta = this.filtros.tipo_consulta;
    if (this.filtros.fecha_consulta) params.fecha = this.filtros.fecha_consulta;
    if (this.filtros.q.trim()) params.q = this.filtros.q.trim();

    this.api.getConsultas(params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: ConsultaListResponse) => {
        this.resultadosConsultas = data.consultas ?? [];
        this.totalConsultas = data.total ?? this.resultadosConsultas.length;
        this.mostrarTabla = true;
        this.buscando = false;
        this.cerrarSidebarEnMobile();
        this.cdr.markForCheck();
      },
      error: () => {
        this.buscando = false;
        this.cdr.markForCheck();
      }
    });
  }

  limpiarFiltros(): void {
    Object.keys(this.filtros).forEach(k => (this.filtros as any)[k] = '');
    this.resultados = [];
    this.resultadosConsultas = [];
    this.totalConsultas = 0;
    this.mostrarTabla = false;
  }

  cambiarModo(modo: 'pacientes' | 'consultas'): void {
    this.modoBusqueda = modo;
    this.resultados = [];
    this.resultadosConsultas = [];
    this.totalConsultas = 0;
    this.mostrarTabla = false;
    this.limpiarFiltros();
  }

  cerrarTabla(): void {
    this.mostrarTabla = false;
  }

  seleccionarConsulta(c: ConsultaOut): void {
    this.mostrarTabla = false;
    this.cerrarSidebarEnMobile();
    if (c.paciente_id) {
      this.pacienteId = c.paciente_id;
      this.cargarPaciente();
      this.cargarConsultas();
      this.cargarCitas();
    } else {
      this.router.navigate(['/detalleAdmision', c.id]);
    }
  }

  nombrePacienteDe(c: ConsultaOut): string {
    const n = c.paciente?.nombre;
    if (!n) return '—';
    return [
      n.primer_nombre, n.segundo_nombre, n.otro_nombre,
      n.primer_apellido, n.segundo_apellido
    ].filter(Boolean).join(' ').trim() || '—';
  }

  editarPaciente(id: number): void { this.router.navigate(['/pacienteEdit', id]); }

  editarCita(id: number): void {

    this.router.navigate(['/reagendar/cita', id]);
  }

  // ── Selección de paciente ───────────────────────────────
  seleccionarPaciente(p: PacienteBuscado): void {
    this.pacienteId = p.id;
    this.mostrarTabla = false;
    // Cerramos sidebar en mobile al seleccionar
    this.cerrarSidebarEnMobile();
    this.cargarPaciente();
    this.cargarConsultas();
    this.cargarCitas();
  }

  private cargarPaciente(): void {
    if (!this.pacienteId) return;
    this.cargandoPaciente = true;

    this.demograficosFiltrados = [];
    this.socioeconomicosFiltrados = [];
    this.neonatalesFiltrados = [];
    this.referenciasFiltradas = [];
    this.metadatosArray = [];

    this.apip.getPaciente(this.pacienteId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.paciente = data;
        this.procesarPaciente();
        this.error = null;
        this.cargandoPaciente = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err?.message || 'Error al cargar paciente.';
        this.cargandoPaciente = false;
        this.cdr.markForCheck();
      }
    });
  }

  private cargarConsultas(): void {
    this.cargandoConsultas = true;

    this.api.getConsultasPorPaciente(this.pacienteId, {}).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.consultasPorPaciente = data;
        this.cargandoConsultas = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargandoConsultas = false;
        this.cdr.markForCheck();
      }
    });
  }

  private cargarCitas(): void {
    if (!this.pacienteId) return;

    this.apip.getCitasPaciente(this.pacienteId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.citasPorPaciente = data;
        console.log('Citas del paciente:', this.citasPorPaciente);

        this.citasProcesadas = data.map((cita, index) => ({
          titulo: `Cita ${index + 1}`,
          campos: Object.entries(cita)
            .filter(([_, valor]) =>
              valor !== null && valor !== undefined && valor !== ''
            )
            .map(([key, valor]) => ({
              key,
              valor
            }))
        }));
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error al cargar las citas del paciente:', err);
        this.cdr.markForCheck();
      }
    });
  }

  // ── Procesado ───────────────────────────────────────────
  private procesarPaciente(): void {
    if (!this.paciente) return;

    this.referenciasFiltradas = Array.isArray(this.paciente.referencias)
      ? this.paciente.referencias.filter(ref => ref != null)
      : [];

    if (this.paciente.datos_extra?.demograficos) {
      this.demograficosFiltrados = Object.entries(this.paciente.datos_extra.demograficos)
        .filter(([, valor]) => valor !== null && valor !== undefined && valor !== 0 && valor !== '')
        .map(([key, valor]) => ({ key, valor }));
    } else {
      this.demograficosFiltrados = [];
    }

    if (this.paciente.datos_extra?.socioeconomicos) {
      this.socioeconomicosFiltrados = Object.entries(this.paciente.datos_extra.socioeconomicos)
        .filter(([, valor]) => valor !== null && valor !== undefined && valor !== '' && valor !== 0)
        .map(([key, valor]) => ({ key, valor }));
    } else {
      this.socioeconomicosFiltrados = [];
    }

    if (this.paciente.datos_extra?.neonatales) {
      this.neonatalesFiltrados = Object.entries(this.paciente.datos_extra.neonatales)
        .filter(([, valor]) => valor !== null && valor !== undefined && valor !== '' && valor !== 0)
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
  regresar(): void { this.location.back(); }

  trackById(index: number, item: any): any {
    return item.id ?? index;
  }

  copiarTexto(texto: string): void {
    navigator.clipboard.writeText(texto)
      .then(() => {
        console.log('Texto copiado');
        // Aquí puedes mostrar un toast
      })
      .catch(err => {
        console.error('Error al copiar:', err);
      });
  }
}
