// coexFiltrado.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, input, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatosExtraPipe } from '../../../../pipes/datos-extra.pipe';
import { CuiPipe } from '../../../../pipes/cui.pipe';
import { TimePipe } from '../../../../pipes/time.pipe';
import { ConsultaResponse, TotalesResponse, TotalesItem } from '../../../../interface/consultas';
import { ciclos, Dict } from '../../../../enum/diccionarios';
import { ConsultaService } from '../../consultas.service';
import { IconService } from '../../../../service/icon.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-coexFiltrado',
  templateUrl: './coexFiltrado.component.html',
  styleUrls: ['./coexFiltrado.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, DatosExtraPipe, CuiPipe, TimePipe]
})
export class CoexFiltradoComponent implements OnInit {

  private api = inject(ConsultaService);
  private router = inject(Router);
  private iconService = inject(IconService);
  private location = inject(Location);

  // ======= SIGNAL INPUTS =======
  // Requerido: siempre debe recibir una especialidad
  // <app-coexFiltrado especialidad="MEDI" />
  // <app-coexFiltrado [especialidad]="miSignal()" />
  readonly especialidad = input.required<string>();
  readonly tipoConsulta = input<number>(1);

  // ======= ESTADO =======
  consultas: ConsultaResponse[] = [];
  totales: TotalesItem[] = [];
  cargando = false;
  filtrar = false;
  rowActiva: number | null = null;
  pageSize = 40;
  paginaActual = 1;
  totalDeRegistros = 0;
  ciclos: Dict[] = ciclos;
  modalActivo = false;
  private yaInicializado = false;

  private fechaActual = new Date().toLocaleDateString('en-CA');

  filtros: any = {
    skip: 0,
    limit: this.pageSize,
    tipo_consulta: 1,
    especialidad: '',
    fecha: '',
    expediente: '',
    primer_nombre: '',
    primer_apellido: '',
  };

  icons: { [key: string]: any } = {};

  constructor() {
    this.icons = {
      search: this.iconService.getIcon('searchIcon'),
      delete: this.iconService.getIcon('deletInput'),
      edit: this.iconService.getIcon('editIcon'),
      trash: this.iconService.getIcon('trashIcon'),
      medical: this.iconService.getIcon('medicalServiceIcon'),
      find: this.iconService.getIcon('findIcon'),
      menu: this.iconService.getIcon('menuIcon'),
      arrowDown: this.iconService.getIcon('arrowDown'),
      skipLeft: this.iconService.getIcon('skipLeft'),
      skipRight: this.iconService.getIcon('skipRight'),
      print: this.iconService.getIcon('printIcon'),
      calendar: this.iconService.getIcon('calendarIcon'),
    };

    // ======= EFFECT =======
    // Cada vez que cambia el signal `especialidad` o `tipoConsulta`
    // desde el padre, recarga automáticamente con los nuevos valores
    effect(() => {
      const esp = this.especialidad();  // lectura reactiva
      const tipo = this.tipoConsulta();  // lectura reactiva

      // Ignorar la ejecución inicial del effect (ngOnInit ya lo maneja)
      if (!this.yaInicializado) return;

      this.filtros.especialidad = esp;
      this.filtros.tipo_consulta = tipo;
      this.filtros.skip = 0;
      this.paginaActual = 1;
      this.cargarConsultas();
    });

  }

  // ======= CICLO DE VIDA =======
  ngOnInit(): void {
    this.fechaActual = new Date().toLocaleDateString('en-CA');
    this.filtros.fecha = this.fechaActual;
    this.filtros.limit = this.pageSize;
    this.filtros.especialidad = this.especialidad();
    this.filtros.tipo_consulta = this.tipoConsulta();

    this.cargarTotales(this.fechaActual);
    this.cargarConsultas();

    this.yaInicializado = true;
  }

  // ======= CARGA DE DATOS =======
  private cargarTotales(fecha: string): void {
    this.api.getTotales(fecha).subscribe({
      next: (response: TotalesResponse) => {
        this.totales = response.totales;
        this.totalDeRegistros = this.totales
          .find(t => t.entidad.toLowerCase().includes('coex'))
          ?.total ?? 0;
      },
      error: () => {
        this.totales = [];
        this.totalDeRegistros = 0;
      }
    });
  }

  cargarConsultas(): void {
    this.cargando = true;
    const filtrosLimpios = this.filtrosValidos();

    this.api.getConsultas(filtrosLimpios).subscribe({
      next: resultado => { this.consultas = resultado.consultas; },
      error: () => { this.consultas = []; },
      complete: () => { this.cargando = false; }
    });
  }

  // Elimina claves vacías pero siempre conserva las estructurales
  private filtrosValidos(): any {
    const SIEMPRE = new Set(['skip', 'limit', 'tipo_consulta', 'especialidad', 'fecha']);

    const resultado = Object.fromEntries(
      Object.entries(this.filtros).filter(([key, val]) =>
        SIEMPRE.has(key) || (val !== '' && val !== null && val !== undefined)
      )
    );

    // ✅ Guard final: si por alguna razón especialidad quedó vacía, forzarla
    if (!resultado['especialidad']) {
      resultado['especialidad'] = this.especialidad();
    }

    return resultado;
  }

  // ======= ACCIONES DEL TEMPLATE =======
  buscar(): void {
    this.filtros.skip = 0;
    this.paginaActual = 1;
    // La especialidad NO se toca: siempre viene del signal
    this.cargarConsultas();
  }

  limpiarFiltros(): void {
    this.filtros = {
      skip: 0,
      limit: this.pageSize,
      tipo_consulta: this.tipoConsulta(),   // respeta el signal
      especialidad: this.especialidad(),   // respeta el signal
      fecha: this.fechaActual,
      expediente: '',
      primer_nombre: '',
      primer_apellido: '',
    };
    this.paginaActual = 1;
    this.cargarConsultas();
  }

  cambiarFecha(): void {
    this.filtros.skip = 0;
    this.paginaActual = 1;
    this.cargarTotales(this.filtros.fecha);
    this.cargarConsultas();
  }

  toggleFiltrar(): void {
    this.filtrar = !this.filtrar;
  }

  cita(id: number): void {
    this.router.navigate(['/agendar/paciente', id]);
  }

  // ======= NAVEGACIÓN =======
  editar(id: number): void {
    this.router.navigate(['/editarAdmision', id, 'coex']);
  }

  verDetalle(consultaId: number): void {
    this.router.navigate(
      ['/detalleAdmision', consultaId],
      { queryParams: { origen: 'coex' } }
    );
  }

  imprimir(consultaId: number): void {
    this.router.navigate(['/hojaCoex', consultaId]);
  }

  hoja(consultaId: number): void {
    this.router.navigate(['/coexHoja/', consultaId]);
  }

  volver(): void {
    this.location.back();
  }

  // ======= PAGINACIÓN =======
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
    this.cargarConsultas();
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.filtros.skip = (pagina - 1) * this.pageSize;
    this.cargarConsultas();
  }

  get paginas(): number[] {
    const delta = 2;
    const rango: number[] = [];
    for (
      let i = Math.max(1, this.paginaActual - delta);
      i <= Math.min(this.totalPaginas, this.paginaActual + delta);
      i++
    ) { rango.push(i); }
    return rango;
  }

  // ======= UTILIDADES =======
  activarFila(id: number): void {
    this.rowActiva = this.rowActiva === id ? null : id;
  }

  getCicloStatus(ciclo: Record<string, any>): 'activo' | 'inactivo' {
    if (!ciclo) return 'activo';
    const registros = Object.values(ciclo);
    if (!registros.length) return 'activo';
    registros.sort((a: any, b: any) =>
      new Date(b.registro).getTime() - new Date(a.registro).getTime()
    );
    return ciclos.find(c => c.value === registros[0].estado)?.ref === 'inactivo'
      ? 'inactivo'
      : 'activo';
  }

  formatHora(hora: string): string {
    if (!hora) return '';
    const [h, m, s] = hora.split(':');
    const d = new Date();
    d.setHours(+h, +m, +s);
    return d.toTimeString().slice(0, 5);
  }


}
