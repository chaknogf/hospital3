import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatosExtraPipe } from '../../../../pipes/datos-extra.pipe';
import { CuiPipe } from '../../../../pipes/cui.pipe';
import { ConsultaResponse, TotalesResponse, TotalesItem } from '../../../../interface/consultas';
import { ciclos, Dict } from '../../../../enum/diccionarios';
import { ConsultaService } from '../../consultas.service';
import { Location } from '@angular/common';
import { CapitalizePipe } from '../../../../pipes/capitalize.pipe';

@Component({
  selector: 'app-imprimirCoex',
  templateUrl: './imprimirCoex.component.html',
  styleUrls: ['./imprimirCoex.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, DatosExtraPipe, CapitalizePipe],
})
export class ImprimirCoexComponent implements OnInit {

  private location = inject(Location);

  // ── Datos ──────────────────────────────────────────────────────────────────
  consultas: ConsultaResponse[] = [];
  medi: ConsultaResponse[] = [];
  pedia: ConsultaResponse[] = [];
  gine: ConsultaResponse[] = [];
  ciru: ConsultaResponse[] = [];
  trauma: ConsultaResponse[] = [];
  psico: ConsultaResponse[] = [];
  nutri: ConsultaResponse[] = [];
  odonto: ConsultaResponse[] = [];

  totales: TotalesItem[] = [];

  // ── Estado ─────────────────────────────────────────────────────────────────
  cargando = false;
  totalDeRegistros = 0;
  especialidadSeleccionada = '';
  ciclos: Dict[] = ciclos;

  private ahora = new Date();
  fechaActual = '';
  fechaImpresion = '';

  // ✅ Mismo pageSize que coexLista — el backend acepta máximo 40
  readonly pageSize = 40;

  filtros: any = {
    skip: 0,
    limit: this.pageSize,
    tipo_consulta: 1,
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    fecha: '',
    ciclo: '',
    especialidad: '',
    servicio: '',
    expediente: '',
  };

  especialidadesList: { value: string; label: string }[] = [
    { value: 'MEDI', label: 'Medicina General' },
    { value: 'PEDI', label: 'Pediatría' },
    { value: 'GINE', label: 'Ginecología' },
    { value: 'CIRU', label: 'Cirugía' },
    { value: 'TRAU', label: 'Traumatología' },
    { value: 'PSIC', label: 'Psicología' },
    { value: 'NUTR', label: 'Nutrición' },
    { value: 'ODON', label: 'Odontología' },
  ];

  constructor(
    private api: ConsultaService,
    private router: Router,
  ) { }

  // ── ngOnInit ───────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.fechaActual = this.ahora.toLocaleDateString('en-CA');
    this.filtros.fecha = this.fechaActual;
    this.filtros.limit = this.pageSize;

    this.fechaImpresion = this.ahora.toLocaleString('es-GT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    // 1️⃣ Totales
    this.api.getTotales(this.fechaActual).subscribe({
      next: (response: TotalesResponse) => {
        this.totales = response.totales;
        const coex = this.totales.find(t =>
          t.entidad.toLowerCase().includes('coex')
        );
        this.totalDeRegistros = coex?.total || 0;
      },
      error: () => {
        this.totales = [];
        this.totalDeRegistros = 0;
      }
    });

    // 2️⃣ Cargar TODAS las páginas
    this.cargarTodasLasPaginas();
  }

  // ── Carga paginada: trae todas las páginas y las acumula ──────────────────
  // El backend solo acepta limit=40, así que hacemos skip=0, 40, 80...
  // hasta que una página devuelva menos de `pageSize` registros.
  async cargarTodasLasPaginas(): Promise<void> {
    this.cargando = true;
    this.consultas = [];

    const filtrosBase = this.limpiarFiltrosVacios({
      ...this.filtros,
      skip: 0,
      limit: this.pageSize,
    });

    let skip = 0;
    let seguir = true;

    while (seguir) {
      const lote = await this.obtenerPagina({ ...filtrosBase, skip });

      if (lote.length === 0) {
        seguir = false;
      } else {
        this.consultas = [...this.consultas, ...lote];
        skip += this.pageSize;

        // Si el lote vino incompleto, ya llegamos al final
        if (lote.length < this.pageSize) {
          seguir = false;
        }
      }
    }

    this.filtrarPorEspecialidadLocal();
    this.cargando = false;
  }

  // Promesa que envuelve una petición individual al API
  private obtenerPagina(filtros: any): Promise<ConsultaResponse[]> {
    return new Promise((resolve) => {
      this.api.getConsultas(filtros).subscribe({
        next: resultado => resolve(resultado.consultas ?? []),
        error: () => resolve([]),
      });
    });
  }

  // ── limpiarFiltrosVacios: idéntico a coexLista ────────────────────────────
  private limpiarFiltrosVacios(filtros: any): any {
    const limpio: any = {};
    for (const key in filtros) {
      const valor = filtros[key];
      if (valor !== '' && valor !== null && valor !== undefined) {
        limpio[key] = valor;
      }
      if (key === 'skip' || key === 'limit' || key === 'tipo_consulta') {
        limpio[key] = valor;
      }
    }
    return limpio;
  }

  // ── filtrarPorEspecialidadLocal: idéntico a coexLista ─────────────────────
  private filtrarPorEspecialidadLocal(): void {
    this.medi = this.consultas.filter(c => c.especialidad === 'MEDI');
    this.pedia = this.consultas.filter(c => c.especialidad === 'PEDI');
    this.gine = this.consultas.filter(c => c.especialidad === 'GINE');
    this.ciru = this.consultas.filter(c => c.especialidad === 'CIRU');
    this.trauma = this.consultas.filter(c => c.especialidad === 'TRAU');
    this.psico = this.consultas.filter(c => c.especialidad === 'PSIC');
    this.nutri = this.consultas.filter(c => c.especialidad === 'NUTR');
    this.odonto = this.consultas.filter(c => c.especialidad === 'ODON');
  }

  // ── buscar ────────────────────────────────────────────────────────────────
  buscar(): void {
    this.filtros.skip = 0;
    this.especialidadSeleccionada = '';
    this.filtros.especialidad = '';
    if (!this.filtros.fecha) this.filtros.fecha = this.fechaActual;
    this.cargarTodasLasPaginas();
  }

  // ── limpiarFiltros ────────────────────────────────────────────────────────
  limpiarFiltros(): void {
    this.filtros = {
      skip: 0, limit: this.pageSize, tipo_consulta: 1,
      primer_nombre: '', segundo_nombre: '',
      primer_apellido: '', segundo_apellido: '',
      fecha: this.fechaActual, ciclo: '',
      especialidad: '', servicio: '', expediente: ''
    };
    this.especialidadSeleccionada = '';
    this.cargarTodasLasPaginas();
  }

  // ── cambiarFecha ──────────────────────────────────────────────────────────
  cambiarFecha(): void {
    this.filtros.skip = 0;
    this.especialidadSeleccionada = '';
    this.filtros.especialidad = '';

    this.api.getTotales(this.filtros.fecha).subscribe({
      next: (response: TotalesResponse) => {
        this.totales = response.totales;
        const coex = this.totales.find(t =>
          t.entidad.toLowerCase().includes('coex')
        );
        this.totalDeRegistros = coex?.total || 0;
      },
      error: () => { }
    });

    this.cargarTodasLasPaginas();
  }

  // ── seleccionarEspecialidad ───────────────────────────────────────────────
  seleccionarEspecialidad(especialidad: string): void {
    this.especialidadSeleccionada = especialidad;
    this.filtros.especialidad = especialidad;
    this.filtros.skip = 0;
    this.cargarTodasLasPaginas();
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  get consultasVista(): ConsultaResponse[] {
    if (!this.especialidadSeleccionada) return this.consultas;
    const map: Record<string, ConsultaResponse[]> = {
      MEDI: this.medi, PEDI: this.pedia, GINE: this.gine,
      CIRU: this.ciru, TRAU: this.trauma, PSIC: this.psico,
      NUTR: this.nutri, ODON: this.odonto,
    };
    return map[this.especialidadSeleccionada] ?? [];
  }

  get labelEspecialidad(): string {
    if (!this.especialidadSeleccionada) return 'Todas las Especialidades';
    return this.especialidadesList.find(e => e.value === this.especialidadSeleccionada)?.label
      ?? this.especialidadSeleccionada;
  }

  get totalCitas(): number { return this.consultasVista.length; }

  nombreCompleto(c: ConsultaResponse): string {
    return [
      c.paciente?.nombre?.primer_nombre,
      c.paciente?.nombre?.segundo_nombre,
      c.paciente?.nombre?.primer_apellido,
      c.paciente?.nombre?.segundo_apellido,
    ].filter(Boolean).join(' ');
  }

  trackById(_i: number, c: ConsultaResponse): number { return c.id; }

  getCicloStatus(ciclo: Record<string, any>): 'activo' | 'inactivo' {
    if (!ciclo) return 'activo';
    const registros = Object.values(ciclo);
    if (!registros.length) return 'activo';
    registros.sort((a: any, b: any) =>
      new Date(b.registro).getTime() - new Date(a.registro).getTime()
    );
    const ultimo = registros[0];
    const encontrado = ciclos.find(c => c.value === ultimo.estado);
    return encontrado?.ref === 'inactivo' ? 'inactivo' : 'activo';
  }

  imprimir(): void { window.print(); }
  volver(): void { this.location.back(); }
}
