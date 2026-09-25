import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';

import { CicloService } from '../ciclo.service';
import { PacienteService } from '../../registros/patient/paciente.service';
import { ConsultaService } from '../../registros/consultas/consultas.service';
import {
  HistoriaClinicaResponse,
  ConsultaHistoria,
  CicloResumen,
} from '../../interface/ciclo';

@Component({
  selector: 'app-historia-clinica',
  templateUrl: './historiaClinica.component.html',
  styleUrls: ['./historiaClinica.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class HistoriaClinicaComponent implements OnInit, OnDestroy {

  private cicloService = inject(CicloService);
  private pacienteService = inject(PacienteService);
  private consultaService = inject(ConsultaService);
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private destroy$ = new Subject<void>();

  historia = signal<HistoriaClinicaResponse | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  consultasColapsadas = signal<Set<number>>(new Set());
  expedienteBusqueda = '';

  get fechaFormateada(): string {
    return new Date().toLocaleString('es-GT', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const by = this.route.snapshot.queryParamMap.get('by');

    if (by === 'paciente' && id) {
      this.cargarHistoriaPorPaciente(id);
    } else if (id) {
      this.cargarHistoriaPorConsulta(id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Carga por paciente (endpoint optimizado) ──────────────
  private cargarHistoriaPorPaciente(pacienteId: number): void {
    this.cargando.set(true);
    this.error.set(null);

    this.cicloService.getHistoriaClinica(pacienteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.historia.set(data);
          this.cargando.set(false);
        },
        error: (err) => {
          this.error.set('Error al cargar historia clínica');
          this.cargando.set(false);
        }
      });
  }

  // ── Carga por consulta (modo legacy) ──────────────────────
  private cargarHistoriaPorConsulta(consultaId: number): void {
    this.cargando.set(true);
    this.error.set(null);

    this.cicloService.getCiclosDeConsulta(consultaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ciclos) => {
          if (ciclos.length > 0 && ciclos[0].consulta) {
            const c = ciclos[0].consulta as any;
            this.historia.set({
              paciente_id: c.paciente?.id || 0,
              paciente_nombre: c.paciente?.nombre_completo,
              paciente_expediente: c.paciente?.expediente,
              consultas: [{
                consulta: {
                  id: consultaId,
                  tipo_consulta: c.tipo_consulta,
                  especialidad: c.especialidad,
                  fecha_consulta: c.fecha_consulta,
                  hora_consulta: c.hora_consulta,
                  ultimo_estado: c.ultimo_estado,
                },
                ciclos: ciclos.map(ciclo => this.mapearCiclo({
                  ...ciclo,
                  especialidad: ciclo.especialidad ?? c.especialidad,
                })),
                total_ciclos: ciclos.length,
              }],
              total_consultas: 1,
              total_ciclos: ciclos.length,
            });
          } else {
            this.historia.set({
              paciente_id: 0,
              consultas: [],
              total_consultas: 0,
              total_ciclos: 0,
            });
          }
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('Error al cargar ciclos');
          this.cargando.set(false);
        }
      });
  }

  // ── Búsqueda por expediente ───────────────────────────────
  buscarPorExpediente(): void {
    const exp = this.expedienteBusqueda.trim();
    if (!exp) return;

    this.cargando.set(true);
    this.error.set(null);

    this.pacienteService.pacienteExpediente(exp)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (paciente: any) => {
          if (paciente?.id) {
            this.cargarHistoriaPorPaciente(paciente.id);
          } else {
            this.error.set('No se encontró paciente con ese expediente');
            this.cargando.set(false);
          }
        },
        error: () => {
          this.error.set('Error al buscar paciente');
          this.cargando.set(false);
        }
      });
  }

  // ── Utilidades ────────────────────────────────────────────
  toggleConsulta(consultaId: number): void {
    const actual = new Set(this.consultasColapsadas());
    if (actual.has(consultaId)) {
      actual.delete(consultaId);
    } else {
      actual.add(consultaId);
    }
    this.consultasColapsadas.set(actual);
  }

  estaColapsada(consultaId: number): boolean {
    return this.consultasColapsadas().has(consultaId);
  }

  nombreTipoConsulta(tipo: number | undefined): string {
    const map: Record<number, string> = { 1: 'COEX', 2: 'Hospitalización', 3: 'Emergencia' };
    return map[tipo || 0] || 'Consulta';
  }

  colorTipoConsulta(tipo: number | undefined): string {
    const map: Record<number, string> = { 1: '#22d3ee', 2: '#f97316', 3: '#ef4444' };
    return map[tipo || 0] || '#64748b';
  }

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return '';
    return new Date(fecha + 'T12:00:00').toLocaleDateString('es-GT', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  formatearHora(hora: string | undefined): string {
    if (!hora) return '';
    return hora.substring(0, 5);
  }

  formatearRegistro(registro: string | undefined): string {
    if (!registro) return '';
    const d = new Date(registro);
    return d.toLocaleString('es-GT', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  resumenCiclo(ciclo: CicloResumen): string {
    if (ciclo.resumen) return ciclo.resumen;
    if (ciclo.impresion_clinica) return ciclo.impresion_clinica.substring(0, 120);
    return 'Sin resumen';
  }

  signosVitalesCompactos(ciclo: CicloResumen): string {
    if (!ciclo.signos_vitales) return '';
    const partes: string[] = [];
    const sv = ciclo.signos_vitales;
    for (const [key, val] of Object.entries(sv)) {
      if (val) partes.push(`${key}:${val}`);
    }
    return partes.join(' | ');
  }

  badgeEgreso(ciclo: CicloResumen): string {
    if (!ciclo.egreso?.condicion) return '';
    return ciclo.egreso.condicion;
  }

  irANota(cicloId: number): void {
    this.router.navigate(['/verNota', cicloId]);
  }

  imprimir(): void {
    window.print();
  }

  private mapearCiclo(ciclo: any): CicloResumen {
    const dm = ciclo.datos_medicos || {};
    const odonto = dm.odontologia ?? (this.esEspecialidadOdontologica(ciclo.especialidad) ? {
      motivo_consulta: dm.detalle_clinicos,
      diagnostico: dm.impresion_clinica,
      plan_tratamiento: dm.tratamiento,
      procedimientos: dm.ordenes,
    } : undefined);
    const dientes = odonto?.odontograma?.dientes ?? {};
    return {
      id: ciclo.id,
      numero: ciclo.numero,
      registro: ciclo.registro,
      usuario: ciclo.usuario,
      usuario_nombre: ciclo.usuario_nombre,
      especialidad: ciclo.especialidad,
      servicio: ciclo.servicio,
      resumen: dm.impresion_clinica || dm.detalle_clinicos || dm.tratamiento || ciclo.contenido,
      signos_vitales: dm.signos_vitales,
      impresion_clinica: dm.impresion_clinica,
      egreso: dm.egreso,
      odontologia: odonto ? {
        motivo_consulta: odonto.motivo_consulta,
        diagnostico: odonto.diagnostico,
        plan_tratamiento: odonto.plan_tratamiento,
        procedimientos: odonto.procedimientos,
        piezas_afectadas: Object.entries(dientes)
          .filter(([, pieza]: [string, any]) => pieza?.estado || Object.keys(pieza?.superficies ?? {}).length)
          .map(([numero]) => numero),
      } : undefined,
    };
  }

  esNotaOdontologica(ciclo: CicloResumen): boolean {
    return !!ciclo.odontologia;
  }

  resumenOdontologico(ciclo: CicloResumen): string {
    const odonto = ciclo.odontologia;
    if (!odonto) return '';
    const partes = [odonto.diagnostico, odonto.motivo_consulta, odonto.plan_tratamiento]
      .filter((parte): parte is string => !!parte?.trim());
    if (odonto.piezas_afectadas?.length) partes.push(`Piezas: ${odonto.piezas_afectadas.join(', ')}`);
    return partes.join(' · ') || 'Nota odontológica registrada';
  }

  private esEspecialidadOdontologica(especialidad?: string): boolean {
    const normalizada = (especialidad ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    return normalizada === 'ODON' || normalizada.includes('ODONTO');
  }
}
