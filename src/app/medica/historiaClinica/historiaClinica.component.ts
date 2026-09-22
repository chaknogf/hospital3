import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, finalize, map, switchMap, takeUntil } from 'rxjs/operators';
import { CicloConsulta } from '../../interface/ciclo';
import { CicloService } from '../ciclo.service';
import { ConsultaService } from '../../registros/consultas/consultas.service';
import { PacienteService } from '../../registros/patient/paciente.service';
import { PacienteJoin } from '../../interface/interfaces';
import { ConsultasIdPaciente } from '../../interface/consultas';

@Component({
  selector: 'app-historiaClinica',
  templateUrl: './historiaClinica.component.html',
  styleUrls: ['./historiaClinica.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
})
export class HistoriaClinicaComponent implements OnInit, OnDestroy {
  private api = inject(CicloService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private consultasApi = inject(ConsultaService);
  private pacientesApi = inject(PacienteService);
  private destroy$ = new Subject<void>();

  ciclos = signal<CicloConsulta[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);
  busquedaExpediente = '';
  pacienteBuscado = signal<PacienteJoin | null>(null);
  consultasPaciente = signal<ConsultasIdPaciente[]>([]);
  buscandoPaciente = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const by = this.route.snapshot.queryParamMap.get('by');
    if (!id) return;

    if (by === 'paciente') {
      this.cargarHistoriaPaciente(id);
    } else {
      this.cargarHistoriaConsulta(id);
    }
  }

  /** Historia de una sola consulta. */
  private cargarHistoriaConsulta(consultaId: number): void {
    this.cargando.set(true);
    this.api.getCiclosDeConsulta(consultaId).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.cargando.set(false)),
      catchError(error => {
        this.error.set(error?.error?.detail ?? 'No se pudo cargar la historia clínica.');
        return of([] as CicloConsulta[]);
      })
    ).subscribe(ciclos => this.ciclos.set(this.ordenar(ciclos)));
  }

  /** Historia completa del expediente: ciclos de todas las consultas del paciente. */
  private cargarHistoriaPaciente(pacienteId: number): void {
    this.cargando.set(true);
    this.error.set(null);
    forkJoin({
      paciente: this.pacientesApi.getPaciente(pacienteId),
      consultas: this.consultasApi.getConsultasPorPaciente(pacienteId),
    }).pipe(
      takeUntil(this.destroy$),
      switchMap(({ paciente, consultas }) => {
        this.pacienteBuscado.set(paciente as unknown as PacienteJoin);
        this.consultasPaciente.set(consultas);
        if (!consultas.length) return of([] as CicloConsulta[]);
        return forkJoin(consultas.map(c => this.api.getCiclosDeConsulta(c.id))).pipe(
          map(listas => listas.flat())
        );
      }),
      finalize(() => this.cargando.set(false)),
      catchError(error => {
        this.error.set(error?.error?.detail ?? 'No se pudo cargar la historia del paciente.');
        return of([] as CicloConsulta[]);
      })
    ).subscribe(ciclos => this.ciclos.set(this.ordenar(ciclos)));
  }

  /** Orden cronológico descendente por fecha de registro. */
  private ordenar(ciclos: CicloConsulta[]): CicloConsulta[] {
    return [...ciclos].sort((a, b) => (b.registro ?? '').localeCompare(a.registro ?? ''));
  }

  buscarPaciente(): void {
    const expediente = this.busquedaExpediente.trim();
    if (!expediente) {
      this.error.set('Escribe un expediente para buscar el paciente.');
      return;
    }

    this.buscandoPaciente.set(true);
    this.error.set(null);
    this.ciclos.set([]);
    this.pacientesApi.pacienteExpediente(expediente).pipe(
      takeUntil(this.destroy$),
      switchMap(paciente => {
        this.pacienteBuscado.set(paciente);
        return this.consultasApi.getConsultasPorPaciente(paciente.id).pipe(
          switchMap(consultas => {
            this.consultasPaciente.set(consultas);
            if (!consultas.length) return of([] as CicloConsulta[]);
            return forkJoin(consultas.map(consulta => this.api.getCiclosDeConsulta(consulta.id))).pipe(
              map(listas => listas.flat())
            );
          })
        );
      }),
      finalize(() => this.buscandoPaciente.set(false)),
      catchError(error => {
        this.error.set(error?.error?.detail ?? 'No se pudo cargar la historia del paciente.');
        return of([] as CicloConsulta[]);
      })
    ).subscribe(ciclos => this.ciclos.set(this.ordenar(ciclos)));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  abrirNota(ciclo: CicloConsulta): void {
    this.router.navigate(['/verNota', ciclo.id]);
  }

  resumen(ciclo: CicloConsulta): string {
    const datos = ciclo.datos_medicos;
    return datos?.impresion_clinica
      || datos?.detalle_clinicos
      || datos?.tratamiento
      || ciclo.contenido
      || 'Sin resumen clínico registrado.';
  }

  regresar(): void {
    this.router.navigate(['/pacientesActivos']);
  }
}
