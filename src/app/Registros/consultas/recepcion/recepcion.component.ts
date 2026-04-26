import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EdadPipe } from './../../../pipes/edad.pipe';
import { ConsultaOut, CicloClinico, EstadoCiclo, ConsultaUpdate, Egreso, Dx } from './../../../interface/consultas';
import { ConsultaService } from './../consultas.service';
import { Router } from '@angular/router';
import { IconService } from './../../../service/icon.service';
import { ciclos, Dict, tipoConsulta } from './../../../enum/diccionarios';
import { DatosExtraPipe } from './../../../pipes/datos-extra.pipe';
import { CuiPipe } from './../../../pipes/cui.pipe';
import { TimePipe } from '../../../pipes/time.pipe';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';



const ESTADOS_INACTIVOS = new Set(['archivo', 'descartado']);

@Component({
  selector: 'app-recepcion',
  templateUrl: './recepcion.component.html',
  styleUrls: ['./recepcion.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, DatosExtraPipe, CuiPipe, TimePipe]
})
export class RecepcionComponent implements OnInit {

  private api = inject(ConsultaService);
  private router = inject(Router);
  private iconService = inject(IconService);

  // ── Datos ──────────────────────────────────────────────────
  consultas: ConsultaOut[] = [];
  tipos: Dict[] = tipoConsulta;
  ciclos: Dict[] = ciclos;

  // ── UI ─────────────────────────────────────────────────────
  cargando = false;
  filtrar = false;
  modalActivo = false;


  // ── Paginación limit+1 ─────────────────────────────────────
  readonly pageSize = 6;
  totalDeRegistros = 0;
  paginaActual: number = 1;
  finPagina: boolean = false;


  // ── Filtros ────────────────────────────────────────────────
  filtros: any = {
    skip: 0, limit: this.pageSize + 1,
    activo: true,
    tipo_consulta: '', primer_nombre: '', segundo_nombre: '',
    primer_apellido: '', segundo_apellido: '',
    fecha: '', ciclo: '', especialidad: '', servicio: '', identificador: '',
  };


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
  // CARGA
  // ══════════════════════════════════════════════════════════
  ngOnInit(): void {
    // 1️⃣ Suscribirse al observable de consultas
    this.api.consultas$.subscribe(data => { this.consultas = data; });
    this.cargarConsultas();
    this.buscar();
  }


  cargarConsultas(): void {
    this.cargando = true;
    this.api.getConsultas(this.filtros).subscribe({
      next: resultado => {
        this.totalDeRegistros = resultado.total;
        this.consultas = resultado.consultas;

        // Ajustar página si el backend devolvió menos de lo esperado
        if (this.paginaActual > this.totalPaginas) {
          this.paginaActual = this.totalPaginas;
        }
      },
      error: err => {
        console.error('Error cargando consultas:', err);
        this.consultas = [];
        this.totalDeRegistros = 0;
      },
      complete: () => { this.cargando = false; }
    });
  }

  rowActiva: number | null = null;
  activarFila(id: number): void {
    this.rowActiva = this.rowActiva === id ? null : id;
  }

  get totalPaginas(): number {
    return Math.ceil(this.totalDeRegistros / this.pageSize) || 1;
  }

  get hayPaginaAnterior(): boolean { return this.paginaActual > 1; }
  get hayPaginaSiguiente(): boolean { return this.paginaActual < this.totalPaginas; }


  cambiarPagina(paso: number): void {
    const nueva = this.paginaActual + paso;
    if (nueva < 1 || nueva > this.totalPaginas) return;

    this.paginaActual = nueva;
    this.filtros.skip = (this.paginaActual - 1) * this.pageSize;
    this.filtros.limit = this.pageSize;
    this.cargarConsultas();
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.filtros.skip = (pagina - 1) * this.pageSize;
    this.filtros.limit = this.pageSize;
    this.cargarConsultas();
  }

  get paginas(): number[] {
    const total = this.totalPaginas;
    const actual = this.paginaActual;
    const delta = 2; // páginas a cada lado de la actual

    const rango: number[] = [];
    for (let i = Math.max(1, actual - delta); i <= Math.min(total, actual + delta); i++) {
      rango.push(i);
    }
    return rango;
  }

  private esConsultaActiva(c: ConsultaOut): boolean {
    return !ESTADOS_INACTIVOS.has(c.ultimo_estado ?? '');
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



  buscar(): void {
    this.paginaActual = 1; this.filtros.skip = 0;
    this.filtros.limit = this.pageSize + 1;
    this.cargarConsultas();
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

  agregar(): void { this.router.navigate(['/pacientes']); }
  verDetalle(id: number): void { this.router.navigate(['/detalleAdmision', id]); }
  volver(): void { this.router.navigate(['/registros']); }

  icons: { [key: string]: any } = (() => {
    const s = this.iconService;
    return {
      search: s.getIcon('searchIcon'),
      delete: s.getIcon('deletInput'),
      create: s.getIcon('createIcon'),
      find: s.getIcon('findIcon'),
      menu: s.getIcon('menuIcon'),
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
