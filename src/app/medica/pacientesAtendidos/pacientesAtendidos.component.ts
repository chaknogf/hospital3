
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EdadPipe } from '../../pipes/edad.pipe';
import { Paciente, Totales } from '../../interface/interfaces';
import { ConsultaOut, CicloClinico, EstadoCiclo, ConsultaUpdate, Egreso, Dx } from '../../interface/consultas';
import { Router } from '@angular/router';
import { IconService } from '../../service/icon.service';
import { ConsultaResponse, Ciclo } from '../../interface/consultas';
import { catchError, tap } from 'rxjs/operators';
import { ciclos, tipoConsulta, } from '../../enum/diccionarios';
import { DatosExtraPipe } from './../../pipes/datos-extra.pipe';
import { CuiPipe } from './../../pipes/cui.pipe';
import { TimePipe } from '../../pipes/time.pipe';
import { Dict, especialidades } from './../../enum/diccionarios';
import { of } from 'rxjs';
import { ConsultaService } from '../../Registros/consultas/consultas.service';

const ESTADOS_INACTIVOS = new Set(['archivo', 'descartado', 'recepcion', 'egreso']);
@Component({
  selector: 'app-pacientesAtendidos',
  templateUrl: './pacientesAtendidos.component.html',
  styleUrls: ['./pacientesAtendidos.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, DatosExtraPipe, CuiPipe, TimePipe]
})
export class PacientesAtendidosComponent implements OnInit {

  private api = inject(ConsultaService);
  private router = inject(Router);
  private iconService = inject(IconService);

  // ── Datos ──────────────────────────────────────────────────
  consultas: ConsultaOut[] = [];
  tipos: Dict[] = tipoConsulta;
  ciclos: Dict[] = ciclos;
  especialidades: Dict[] = [];

  // ── UI ─────────────────────────────────────────────────────
  cargando = false;
  filtrar = false;
  modalActivo = false;

  // ── Paginación limit+1 ─────────────────────────────────────
  readonly pageSize = 8;
  paginaActual = 1;
  hayPaginaSiguiente = false;

  get hayPaginaAnterior(): boolean { return this.paginaActual > 1; }
  get totalPaginas(): number { return this.hayPaginaSiguiente ? this.paginaActual + 1 : this.paginaActual; }

  get paginas(): number[] {
    const rango: number[] = [];
    const desde = Math.max(1, this.paginaActual - 2);
    const hasta = this.paginaActual + (this.hayPaginaSiguiente ? 1 : 0);
    for (let i = desde; i <= hasta; i++) rango.push(i);
    return rango;
  }

  // ── Filtros ────────────────────────────────────────────────
  filtros: any = {
    skip: 0, limit: this.pageSize + 1,
    activo: true,
    tipo_consulta: '', primer_nombre: '', segundo_nombre: '',
    primer_apellido: '', segundo_apellido: '',
    fecha: '', ciclo: '', especialidad: '', servicio: '', identificador: '',
  };

  rowActiva: number | null = null;

  // ══════════════════════════════════════════════════════════
  // MODAL RECIBIDO
  // ══════════════════════════════════════════════════════════
  modalRecibido = false;
  consultaRecibiendo: ConsultaOut | null = null;
  formRecibido = {
    comentario: '',
    servicio: '',
    guardando: false,
    error: ''
  };

  abrirModalRecibido(consulta: ConsultaOut): void {
    this.consultaRecibiendo = consulta;
    this.formRecibido = { comentario: '', servicio: consulta.servicio ?? '', guardando: false, error: '' };
    this.modalRecibido = true;
    this.modalActivo = true;
  }

  cerrarModalRecibido(): void {
    this.modalRecibido = false;
    this.modalActivo = false;
    this.consultaRecibiendo = null;
  }

  confirmarRecibido(): void {
    if (!this.consultaRecibiendo) return;
    this.formRecibido.guardando = true;
    this.formRecibido.error = '';

    const ciclo: CicloClinico = {
      estado: 'recepcion' as EstadoCiclo,
      servicio: this.formRecibido.servicio || undefined,
      comentario: this.formRecibido.comentario || undefined,
    };

    this.api.updateConsulta(this.consultaRecibiendo.id, { ciclo })
      .pipe(
        tap(() => {
          this.cerrarModalRecibido();
          this.cargarConsultas();
        }),
        catchError(err => {
          this.formRecibido.error = err?.error?.detail ?? 'Error al registrar recepción';
          this.formRecibido.guardando = false;
          return of(null);
        })
      )
      .subscribe();
  }

  // ══════════════════════════════════════════════════════════
  // MODAL ARCHIVAR
  // ══════════════════════════════════════════════════════════
  modalArchivar = false;
  consultaArchivando: ConsultaOut | null = null;
  formArchivar = {
    condicion: '',
    registro: '',
    referencia: '',     // referido a / hospital destino
    diagnosticos: [{ codigo: '', descripcion: '' }],    // diagnóstico libre (se guarda como Dx)
    medico: '',         // médico responsable del egreso
    comentario: '',     // observaciones adicionales
    guardando: false,
    error: ''
  };

  condicionesEgreso = [
    { value: 'recuperado', label: 'Recuperado' },
    { value: 'mismo_estado', label: 'Mismo estado' },
    { value: 'referido', label: 'Referido' },
    { value: 'fallecido', label: 'Fallecido' },
    { value: 'contraindicado', label: 'Contraindicado' },
    { value: 'fugado', label: 'Fugado' },
  ];

  abrirModalArchivar(consulta: ConsultaOut): void {
    this.consultaArchivando = consulta;
    this.formArchivar = {
      condicion: '',
      registro: '',
      referencia: '',
      diagnosticos: [{ codigo: '', descripcion: '' }],
      medico: '',
      comentario: '',
      guardando: false,
      error: ''
    };
    this.modalArchivar = true;
    this.modalActivo = true;
  }

  cerrarModalArchivar(): void {
    this.modalArchivar = false;
    this.modalActivo = false;
    this.consultaArchivando = null;
  }

  confirmarArchivar(): void {
    if (!this.consultaArchivando) return;
    this.formArchivar.guardando = true;
    this.formArchivar.error = '';

    const f = this.formArchivar;

    const egreso: Egreso = {
      registro: new Date().toISOString(),
      condicion: f.condicion || '',
      referencia: f.referencia || undefined,
      medico: f.medico || undefined,
      diagnosticos: f.diagnosticos?.length
        ? [{ codigo: '', descripcion: f.diagnosticos[0].descripcion } as Dx]
        : [],
    };

    const ciclo: CicloClinico = {
      estado: 'archivo',
      comentario: f.comentario || undefined
    };

    this.api.updateConsulta(this.consultaArchivando.id, { ciclo, egreso })
      .pipe(
        tap(() => {
          this.cerrarModalArchivar();
          this.cargarConsultas();
        }),
        catchError(err => {
          this.formArchivar.error = err?.error?.detail ?? 'Error al archivar';
          this.formArchivar.guardando = false;
          return of(null);
        })
      )
      .subscribe();
  }

  // ══════════════════════════════════════════════════════════
  // HELPERS DE ESTADO
  // ══════════════════════════════════════════════════════════
  ultimoEstado(consulta: ConsultaOut): string {
    if (!consulta.ciclo?.length) return '—';
    const ultimo = consulta.ciclo[consulta.ciclo.length - 1].estado;
    return this.ciclos.find(c => c.value === ultimo)?.label ?? ultimo;
  }

  ultimoEstadoValor(consulta: ConsultaOut): string {
    if (!consulta.ciclo?.length) return '';
    return consulta.ciclo[consulta.ciclo.length - 1].estado;
  }

  // true si el último ciclo ya es 'recepcion' (listo para archivar)
  estaEnRecepcion(consulta: ConsultaOut): boolean {
    return this.ultimoEstadoValor(consulta) === 'recepcion';
  }

  // true si puede recibirse (no está en recepcion ni archivado)
  puedeRecibirse(consulta: ConsultaOut): boolean {
    const estado = this.ultimoEstadoValor(consulta);
    return estado !== 'recepcion' && !ESTADOS_INACTIVOS.has(estado);
  }

  // ══════════════════════════════════════════════════════════
  // CARGA
  // ══════════════════════════════════════════════════════════
  ngOnInit(): void {
    this.valores();
    this.cargarConsultas();
  }

  cargarConsultas(): void {
    this.cargando = true;
    this.api.getConsultas(this.limpiarFiltrosVacios(this.filtros)).subscribe({
      next: (data: ConsultaOut[]) => {
        const filtradas = data.filter(c => this.esConsultaActiva(c));
        this.hayPaginaSiguiente = filtradas.length > this.pageSize;
        this.consultas = this.hayPaginaSiguiente ? filtradas.slice(0, this.pageSize) : filtradas;
      },
      error: err => { console.error(err); this.consultas = []; },
      complete: () => { this.cargando = false; }
    });
  }

  private esConsultaActiva(c: ConsultaOut): boolean {
    if (!c.ciclo?.length) return true;
    return !ESTADOS_INACTIVOS.has(c.ciclo[c.ciclo.length - 1].estado);
  }

  private limpiarFiltrosVacios(filtros: any): any {
    const limpio: any = {};
    for (const key in filtros) {
      const val = filtros[key];
      if (key === 'skip' || key === 'limit' || key === 'activo') { limpio[key] = val; continue; }
      if (val !== '' && val !== null && val !== undefined) limpio[key] = val;
    }
    return limpio;
  }

  // ── Paginación ─────────────────────────────────────────────
  cambiarPagina(paso: number): void {
    const nueva = this.paginaActual + paso;
    if (nueva < 1 || nueva > this.totalPaginas) return;
    this.irAPagina(nueva);
  }

  irAPagina(p: number): void {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaActual = p;
    this.filtros.skip = (p - 1) * this.pageSize;
    this.filtros.limit = this.pageSize + 1;
    this.cargarConsultas();
  }

  buscar(): void {
    this.paginaActual = 1; this.filtros.skip = 0;
    this.filtros.limit = this.pageSize + 1;
    this.cargarConsultas();
  }

  notamedica(consultaId: number): void {
    this.router.navigate(['/notaMedica', consultaId]);
  }

  historiaclinica(consultaId: number): void {
    this.router.navigate(['/historiaClinica', consultaId]);
  }

  private valores(): void {
    this.especialidades = especialidades.filter(e => e.ref !== 'sop');

  }

  limpiarFiltros(): void {
    this.filtros = {
      skip: 0, limit: this.pageSize + 1, activo: true,
      tipo_consulta: '', primer_nombre: '', segundo_nombre: '',
      primer_apellido: '', segundo_apellido: '',
      fecha: '', ciclo: '', especialidad: '', servicio: '', identificador: ''
    };
    this.paginaActual = 1; this.cargarConsultas();
  }

  toggleFiltrar(): void { this.filtrar = !this.filtrar; }
  activarFila(id: number): void { this.rowActiva = this.rowActiva === id ? null : id; }

  agregar(): void { this.router.navigate(['/pacientes']); }
  verDetalle(id: number): void { this.router.navigate(['/detalleAdmision', id]); }
  volver(): void { this.router.navigate(['/clinica']); }

  icons: { [key: string]: any } = (() => {
    const s = this.iconService;
    return {
      search: s.getIcon('searchIcon'),
      delete: s.getIcon('deletInput'),
      create: s.getIcon('createIcon'),
      find: s.getIcon('findIcon'),
      menu: s.getIcon('menuPuntos'),
      arrowDown: s.getIcon('arrowDown'),
      skipLeft: s.getIcon('skipLeft'),
      skipRight: s.getIcon('skipRight'),
      recibido: s.getIcon('recibidoIcon'),
      archivo: s.getIcon('archivIcon'),
      tabla: s.getIcon('tablaShanonIcon'),
      man: s.getIcon('manIcon'),
      woman: s.getIcon('womanIcon'),
    };
  })();
}
