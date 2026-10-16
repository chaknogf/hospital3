import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy, inject, signal, ElementRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';

import { CicloService } from '../../medica/ciclo.service';
import { ConsultaService } from '../../registros/consultas/consultas.service';
import { PacienteService } from '../../registros/patient/paciente.service';
import { CicloConsulta } from '../../interface/ciclo';
import { ConsultasIdPaciente } from '../../interface/consultas';
import { PacienteJoin, PacienteResumen } from '../../interface/interfaces';
import { parentescos, especialidadesConsulta, servicios, Dict } from '../../enum/diccionarios';
import { HistoriaUisauComponent } from '../historiaUisau/historiaUisau.component';
import {
  DatosUisau,
  UisauArticulo,
  UisauDiagnostico,
  UisauEstadoPaciente,
  UisauInformacionContacto,
  UisauNotaClinica,
  crearDatosUisauVacios,
  ESTADOS_UISAU,
  SITUACIONES_UISAU,
  LUGARES_REFERENCIA,
} from '../uisau.model';

/**
 * Página UISAU unificada. Un único buscador (expediente o nombre) resuelve al
 * paciente, muestra su historia UISAU y siempre permite agregar una nota. La
 * nota (formulario) se abre en `/notaUisau/:consultaId` y persiste los datos
 * exclusivos del rol en el campo `uisau` (JSONB) vía el servicio de ciclos.
 */
@Component({
  selector: 'app-notaUisau',
  templateUrl: './notaUisau.component.html',
  styleUrls: ['./notaUisau.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, HistoriaUisauComponent],
})
export class NotaUisauComponent implements OnInit, OnDestroy {

  private api = inject(CicloService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private elementRef = inject(ElementRef);
  private consultasApi = inject(ConsultaService);
  private pacientesApi = inject(PacienteService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  private consultaId: number | null = null;
  pacienteId = signal<number | null>(null);

  /* ── Catálogos ─────────────────────────────────────────── */
  estados = ESTADOS_UISAU;
  situaciones = SITUACIONES_UISAU;
  lugaresReferencia = LUGARES_REFERENCIA;
  parentescos = parentescos;
  especialidades: Dict[] = especialidadesConsulta;
  servicios: Dict[] = servicios;

  /* ── Búsqueda de paciente ──────────────────────────────── */
  busquedaExpediente = '';
  busquedaNombre = '';
  pacienteBuscado = signal<PacienteJoin | null>(null);
  pacientesEncontrados = signal<PacienteResumen[]>([]);
  consultasPaciente = signal<ConsultasIdPaciente[]>([]);
  buscandoPaciente = signal(false);
  cargandoConsultas = signal(false);

  /* ── Estado ────────────────────────────────────────────── */
  cargando = signal(false);
  guardando = signal(false);
  tieneConsulta = signal(false);
  error = signal<string | null>(null);
  mensaje = signal<{ texto: string; tipo: 'success' | 'error' } | null>(null);

  datosUisau: DatosUisau = crearDatosUisauVacios();

  tabActivo: 'estado' | 'contacto' | 'nota' = 'estado';
  setTab(tab: 'estado' | 'contacto' | 'nota'): void {
    this.tabActivo = tab;
    this.cdr.markForCheck();
  }

  /* ── Accesos a los grupos (para el template) ───────────── */
  get ep(): UisauEstadoPaciente { return this.datosUisau.estado_paciente!; }
  get ic(): UisauInformacionContacto { return this.datosUisau.informacion_contacto!; }
  get nc(): UisauNotaClinica { return this.datosUisau.nota_clinica!; }

  ngOnInit(): void {
    const consultaId = Number(this.route.snapshot.paramMap.get('consultaId'));
    const pacienteId = Number(this.route.snapshot.paramMap.get('pacienteId'));
    if (consultaId) {
      this.tieneConsulta.set(true);
      this.cargarConsulta(consultaId);
    } else if (pacienteId) {
      this.pacienteId.set(pacienteId);
      this.cargarPacientePorId(pacienteId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* ── Carga de la consulta ──────────────────────────────── */
  private cargarConsulta(consultaId: number): void {
    this.consultaId = consultaId;
    this.cargando.set(true);

    this.consultasApi.getConsultaId(consultaId).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.cargando.set(false)),
      catchError(() => {
        this.error.set('No se pudo cargar la consulta.');
        return of(null);
      })
    ).subscribe(consulta => {
      if (!consulta) return;
      const pacienteId = (consulta as any).paciente_id ?? null;
      this.pacienteId.set(pacienteId);
      const expediente = (consulta as any).expediente;
      if (expediente) {
        this.pacientesApi.pacienteExpediente(expediente).pipe(
          takeUntil(this.destroy$),
          catchError(() => of(null))
        ).subscribe(paciente => {
          if (paciente) { this.pacienteBuscado.set(paciente); this.cdr.markForCheck(); }
        });
      }
      if (pacienteId) {
        this.cargarConsultasNoArchivadas(pacienteId);
      }
      this.datosUisau.estado_paciente!.especialidad = consulta.especialidad ?? '';
      this.datosUisau.estado_paciente!.servicio = consulta.servicio ?? '';
      this.cdr.markForCheck();
    });
  }

  /* ── Búsqueda por expediente o nombre ──────────────────── */
  buscarPaciente(): void {
    const expediente = this.busquedaExpediente.trim();
    const nombre = this.busquedaNombre.trim();
    if (!expediente && !nombre) {
      this.error.set('Escribe un expediente o un nombre para buscar.');
      return;
    }

    this.error.set(null);
    this.pacienteBuscado.set(null);
    this.pacientesEncontrados.set([]);
    this.consultasPaciente.set([]);
    this.pacienteId.set(null);
    this.buscandoPaciente.set(true);

    if (expediente) {
      this.pacientesApi.pacienteExpediente(expediente).pipe(
        takeUntil(this.destroy$),
        finalize(() => this.buscandoPaciente.set(false)),
        catchError(() => {
          this.error.set('No se encontró el paciente.');
          return of(null);
        })
      ).subscribe(paciente => {
        if (!paciente) return;
        this.pacienteBuscado.set(paciente);
        const id = (paciente as any).id ?? null;
        this.pacienteId.set(id);
        if (id) this.cargarConsultasNoArchivadas(id);
      });
      return;
    }

    // Filtro por nombre: lista de coincidencias para elegir.
    this.pacientesApi.getPacientes({ nombre, limit: 20 }).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.buscandoPaciente.set(false)),
      catchError(() => {
        this.error.set('No se pudo buscar por nombre.');
        return of({ total: 0, pacientes: [] });
      })
    ).subscribe(resp => {
      const lista = (resp as any)?.pacientes ?? [];
      this.pacientesEncontrados.set(lista);
      if (!lista.length) this.error.set('No se encontraron pacientes con ese nombre.');
      this.cdr.markForCheck();
    });
  }

  /** Selecciona un paciente de la lista de resultados por nombre. */
  seleccionarPaciente(p: PacienteResumen): void {
    this.pacienteBuscado.set(p as unknown as PacienteJoin);
    this.pacienteId.set(p.id);
    this.pacientesEncontrados.set([]);
    this.busquedaExpediente = p.expediente ?? '';
    this.error.set(null);
    this.cargarConsultasNoArchivadas(p.id);
  }

  /** Carga el paciente por id (ruta directa `/notaUisau/paciente/:id`). */
  private cargarPacientePorId(id: number): void {
    this.pacientesApi.getPaciente(id).pipe(
      takeUntil(this.destroy$),
      catchError(() => of(null))
    ).subscribe(p => {
      if (p) this.pacienteBuscado.set(p as unknown as PacienteJoin);
      this.cargarConsultasNoArchivadas(id);
      this.cdr.markForCheck();
    });
  }

  limpiarBusqueda(): void {
    this.busquedaExpediente = '';
    this.busquedaNombre = '';
    this.pacienteBuscado.set(null);
    this.pacientesEncontrados.set([]);
    this.consultasPaciente.set([]);
    this.pacienteId.set(null);
    this.error.set(null);
    this.cdr.markForCheck();
  }

  private cargarConsultasNoArchivadas(pacienteId: number): void {
    this.cargandoConsultas.set(true);
    this.consultasApi.getConsultasPorPaciente(pacienteId).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.cargandoConsultas.set(false)),
      catchError(() => {
        this.error.set('No se pudieron cargar las consultas del paciente.');
        return of([] as ConsultasIdPaciente[]);
      })
    ).subscribe(consultas => {
      this.consultasPaciente.set(consultas.filter(this.esNoArchivada));
      this.cdr.markForCheck();
    });
  }

  /** Una consulta está disponible si no fue archivada. */
  private esNoArchivada = (c: ConsultasIdPaciente): boolean => c.ultimo_estado !== 'archivo';

  seleccionarConsulta(consulta: ConsultasIdPaciente): void {
    this.router.navigate(['/notaUisau', consulta.id]);
  }

  /* ── Diagnósticos / artículos ──────────────────────────── */
  agregarDiagnostico(): void {
    const nc = this.datosUisau.nota_clinica!;
    if (!nc.diagnosticos) nc.diagnosticos = [];
    nc.diagnosticos.push({ codigo: '', descripcion: '' } as UisauDiagnostico);
  }

  eliminarDiagnostico(index: number): void {
    this.datosUisau.nota_clinica?.diagnosticos?.splice(index, 1);
  }

  agregarArticulo(): void {
    const nc = this.datosUisau.nota_clinica!;
    if (!nc.articulos) nc.articulos = [];
    nc.articulos.push({ descripcion: '', cantidad: null } as UisauArticulo);
  }

  eliminarArticulo(index: number): void {
    this.datosUisau.nota_clinica?.articulos?.splice(index, 1);
  }

  /* ── Guardar ───────────────────────────────────────────── */
  guardar(): void {
    if (!this.consultaId || this.guardando()) {
      if (!this.consultaId) this.mostrarMensaje('No se puede guardar: falta la consulta asociada.', 'error');
      return;
    }

    const ahora = new Date().toISOString();
    const ec = this.ep;
    const ic = this.ic;
    const nc = this.nc;

    const uisau: DatosUisau = {
      estado_paciente: { ...ec },
      informacion_contacto: { ...ic },
      nota_clinica: {
        ...nc,
        diagnosticos: (nc.diagnosticos ?? []).filter(d => d.codigo?.trim() || d.descripcion?.trim()),
        articulos: (nc.articulos ?? []).filter(a => a.descripcion?.trim()),
      },
      registro: ahora,
    };

    this.guardando.set(true);
    this.error.set(null);
    this.api.iniciarClico({
      consulta_id: this.consultaId,
      numero: 0,
      activo: true,
      registro: ahora,
      usuario: '',
      especialidad: ec.especialidad,
      servicio: ec.servicio,
      contenido: nc.nota?.trim() || 'Registro UISAU',
      uisau,
    } as CicloConsulta).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.guardando.set(false)),
      catchError(err => {
        this.mostrarMensaje(err?.error?.detail ?? 'No se pudo guardar el registro UISAU.', 'error');
        return of(null);
      })
    ).subscribe(ciclo => {
      if (!ciclo) return;
      this.mostrarMensaje('Registro UISAU guardado correctamente.', 'success');
    });
  }

  private mostrarMensaje(texto: string, tipo: 'success' | 'error'): void {
    this.mensaje.set({ texto, tipo });
    this.cdr.markForCheck();
    setTimeout(() => { this.mensaje.set(null); this.cdr.markForCheck(); }, 4500);
  }

  /** Dictado de voz via Web Speech API */
  dictar(campo: 'nota' | 'informacion' | 'evolucion'): void {
    const recognition = new (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!recognition) {
      this.mostrarMensaje('El navegador no soporta reconocimiento de voz.', 'error');
      return;
    }

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'es-GT';

    const textarea = this.elementRef.nativeElement.querySelector(`textarea[name='${campo}']`);
    if (!textarea) return;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      textarea.value = transcript;
      textarea.dispatchEvent(new Event('input'));
    };

    recognition.onerror = (event: any) => {
      this.mostrarMensaje('Error en el reconocimiento de voz.', 'error');
    };

    recognition.start();
  }

  /* ── Helpers ───────────────────────────────────────────── */
  nombreCompleto(paciente: PacienteJoin | PacienteResumen | null): string {
    if (!paciente?.nombre) return '';
    const n = paciente.nombre;
    return [n.primer_nombre, n.segundo_nombre, n.primer_apellido, n.segundo_apellido]
      .filter(Boolean).join(' ');
  }

  regresar(): void {
    this.location.back();
  }
}