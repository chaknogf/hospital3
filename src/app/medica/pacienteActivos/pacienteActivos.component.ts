import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConsultaService } from '../../registros/consultas/consultas.service';
import { ConsultaOut } from '../../interface/consultas';
import { DatosExtraPipe } from '../../pipes/datos-extra.pipe';

/** Estados que YA no cuentan como paciente activo. */
const ESTADOS_INACTIVOS = new Set(['egreso', 'archivo']);

/** Lista pacientes activos para iniciar o continuar su atención clínica. */
@Component({
  selector: 'app-pacienteActivos',
  templateUrl: './pacienteActivos.component.html',
  styleUrls: ['./pacienteActivos.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, DatosExtraPipe],
})
export class PacienteActivosComponent implements OnInit, OnDestroy {
  private api = inject(ConsultaService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  consultas: ConsultaOut[] = [];
  cargando = signal(false);
  error = signal<string | null>(null);
  especialidadSeleccionada = '';
  busqueda = '';

  readonly pageSize = 12;
  paginaActual = signal(1);

  readonly especialidades = [
    { code: '', label: 'Todos', icon: '🩺' },
    { code: 'MEDI', label: 'Medicina Interna', icon: '🫀' },
    { code: 'PEDI', label: 'Pediatría', icon: '🧒' },
    { code: 'GINE', label: 'Ginecología', icon: '🤰' },
    { code: 'CIRU', label: 'Cirugía', icon: '🔪' },
    { code: 'TRAU', label: 'Traumatología', icon: '🦴' },
    { code: 'PSIC', label: 'Psicología', icon: '🧠' },
    { code: 'NUTR', label: 'Nutrición', icon: '🥗' },
    { code: 'ODON', label: 'Odontología', icon: '🦷' },
  ];

  private filtros: any = { activo: true, especialidad: '', skip: 0, limit: 100 };

  ngOnInit(): void {
    this.cargar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.api.getConsultas(this.filtros).pipe(takeUntil(this.destroy$)).subscribe({
      next: (r) => {
        this.consultas = (r?.consultas ?? []).filter((c) => this.esActivo(c));
        if (this.paginaActual() > this.totalPaginas) this.paginaActual.set(1);
        this.cargando.set(false);
      },
      error: () => {
        this.consultas = [];
        this.error.set('No se pudieron cargar los pacientes activos.');
        this.cargando.set(false);
      },
    });
  }

  /** Un paciente está activo si su último estado no es egreso ni archivo. */
  esActivo(c: ConsultaOut): boolean {
    return !ESTADOS_INACTIVOS.has(this.ultimoEstado(c));
  }

  ultimoEstado(c: ConsultaOut): string {
    if (c.ciclo?.length) return c.ciclo[c.ciclo.length - 1].estado;
    return c.ultimo_estado ?? '';
  }

  seleccionarEspecialidad(code: string): void {
    this.especialidadSeleccionada = code;
    this.filtros.especialidad = code;
    this.filtros.skip = 0;
    this.paginaActual.set(1);
    this.cargar();
  }

  get visibles(): ConsultaOut[] {
    const q = this.busqueda.trim().toLowerCase();
    if (!q) return this.consultas;
    return this.consultas.filter((c) => `${this.nombre(c)} ${c.expediente ?? ''}`.toLowerCase().includes(q));
  }

  nombre(c: ConsultaOut): string {
    const n = c.paciente?.nombre as any;
    if (!n) return c.expediente ?? 'Paciente';
    return [n.primer_nombre, n.segundo_nombre, n.primer_apellido, n.segundo_apellido]
      .filter(Boolean)
      .join(' ') || (c.expediente ?? 'Paciente');
  }

  nota(c: ConsultaOut): void {
    this.router.navigate(['/notaMedica', c.id]);
  }

  historia(c: ConsultaOut): void {
    const pacienteId = c.paciente_id ?? c.paciente?.id;
    this.router.navigate(['/historiaClinica', pacienteId], { queryParams: { by: 'paciente' } });
  }

  // ── Paginación (sobre la lista ya filtrada) ──────────────
  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.visibles.length / this.pageSize));
  }

  get paginados(): ConsultaOut[] {
    const inicio = (this.paginaActual() - 1) * this.pageSize;
    return this.visibles.slice(inicio, inicio + this.pageSize);
  }

  get desde(): number {
    return this.visibles.length ? (this.paginaActual() - 1) * this.pageSize + 1 : 0;
  }

  get hasta(): number {
    return Math.min(this.paginaActual() * this.pageSize, this.visibles.length);
  }

  get paginas(): number[] {
    const total = this.totalPaginas;
    const actual = this.paginaActual();
    const delta = 2;
    const rango: number[] = [];
    for (let i = Math.max(1, actual - delta); i <= Math.min(total, actual + delta); i++) {
      rango.push(i);
    }
    return rango;
  }

  anterior(): void {
    if (this.paginaActual() > 1) this.paginaActual.update((p) => p - 1);
  }

  siguiente(): void {
    if (this.paginaActual() < this.totalPaginas) this.paginaActual.update((p) => p + 1);
  }

  irA(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) this.paginaActual.set(pagina);
  }

  alBuscar(): void {
    this.paginaActual.set(1);
  }

  volver(): void {
    this.router.navigate(['/clinica']);
  }
}
