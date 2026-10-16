import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, Input, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

import { CicloService } from '../../medica/ciclo.service';
import { PacienteService } from '../../registros/patient/paciente.service';
import { HistoriaClinicaResponse, CicloResumen, ConsultaHistoria } from '../../interface/ciclo';
import {
  ESTADOS_UISAU,
  SITUACIONES_UISAU,
  LUGARES_REFERENCIA,
} from '../uisau.model';
import { parentescos } from '../../enum/diccionarios';

/**
 * Historia de los registros UISAU de un paciente. Reutiliza el endpoint de
 * historia clínica agrupada y filtra los ciclos que traen datos `uisau`.
 *
 * Es un componente presentacional embebido en la pestaña "Historia" de
 * `NotaUisauComponent`: recibe el `pacienteId` por `@Input` y, si no lo recibe,
 * permite buscarlo por expediente.
 */
@Component({
  selector: 'app-historiaUisau',
  templateUrl: './historiaUisau.component.html',
  styleUrls: ['./historiaUisau.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
})
export class HistoriaUisauComponent implements OnDestroy {

  private cicloService = inject(CicloService);
  private pacienteService = inject(PacienteService);
  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  historia = signal<HistoriaClinicaResponse | null>(null);
  cargando = signal(false);
  error = signal<string | null>(null);
  consultasColapsadas = signal<Set<number>>(new Set());
  expedienteBusqueda = '';

  /** Muestra el buscador por expediente propio (se oculta cuando el padre ya busca). */
  @Input() mostrarBusqueda = true;

  /** Paciente cuya historia se muestra. Si es nulo se ofrece búsqueda por expediente. */
  @Input()
  set pacienteId(id: number | null | undefined) {
    if (id) {
      this.cargar(id);
    } else {
      this.historia.set(null);
      this.cargando.set(false);
      this.error.set(null);
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargar(pacienteId: number): void {
    this.cargando.set(true);
    this.error.set(null);
    this.cicloService.getHistoriaClinica(pacienteId).pipe(
      takeUntil(this.destroy$),
      catchError(() => {
        this.error.set('No se pudo cargar la historia UISAU.');
        return of(null);
      })
    ).subscribe(data => {
      this.historia.set(data);
      this.cargando.set(false);
      this.cdr.markForCheck();
    });
  }

  buscarPorExpediente(): void {
    const exp = this.expedienteBusqueda.trim();
    if (!exp) return;

    this.cargando.set(true);
    this.error.set(null);
    this.pacienteService.pacienteExpediente(exp).pipe(
      takeUntil(this.destroy$),
      catchError(() => {
        this.error.set('No se encontró paciente con ese expediente.');
        this.cargando.set(false);
        return of(null);
      })
    ).subscribe((paciente: any) => {
      if (!paciente?.id) return;
      this.cargar(paciente.id);
    });
  }

  /** Consultas que contienen al menos un registro UISAU. */
  consultasConUisau(): ConsultaHistoria[] {
    const data = this.historia();
    if (!data) return [];
    return data.consultas
      .map(c => ({ ...c, ciclos: c.ciclos.filter(this.tieneUisau) }))
      .filter(c => c.ciclos.length > 0);
  }

  private tieneUisau = (ciclo: CicloResumen): boolean => !!ciclo.uisau;

  toggleConsulta(consultaId: number): void {
    const actual = new Set(this.consultasColapsadas());
    if (actual.has(consultaId)) actual.delete(consultaId);
    else actual.add(consultaId);
    this.consultasColapsadas.set(actual);
  }

  estaColapsada(consultaId: number): boolean {
    return this.consultasColapsadas().has(consultaId);
  }

  /* ── Etiquetas legibles ────────────────────────────────── */
  private etiqueta(dict: { value: any; label: string }[], valor: any): string {
    if (valor === null || valor === undefined || valor === '') return '—';
    return dict.find(o => o.value === valor)?.label ?? String(valor);
  }

  etiquetaEstado(v: any): string { return this.etiqueta(ESTADOS_UISAU, v); }
  etiquetaSituacion(v: any): string { return this.etiqueta(SITUACIONES_UISAU, v); }
  etiquetaLugar(v: any): string { return this.etiqueta(LUGARES_REFERENCIA, v); }
  etiquetaParentesco(v: any): string { return this.etiqueta(parentescos, v); }

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return '—';
    return new Date(fecha + 'T12:00:00').toLocaleDateString('es-GT', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  formatearRegistro(registro: string | undefined): string {
    if (!registro) return '';
    return new Date(registro).toLocaleString('es-GT', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  get fechaFormateada(): string {
    return new Date().toLocaleString('es-GT', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  regresar(): void {
    this.location.back();
  }

  imprimir(): void {
    window.print();
  }
}
