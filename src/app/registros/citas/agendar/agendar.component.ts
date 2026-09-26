import { ConteoCitas } from '../../../interface/citas';
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, signal, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CitaService } from '../cita.service';
import { PacienteService } from '../../patient/paciente.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder, FormGroup, ReactiveFormsModule, FormsModule
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { CitaCreate, Citas, CitaUpdate, DiaInhabil } from '../../../interface/citas';
import { Paciente, PacienteJoin } from '../../../interface/interfaces';
import { distinctUntilChanged } from 'rxjs/operators';
import { debounceTime } from 'rxjs/operators';
import { Dict, especialidades } from '../../../enum/diccionarios';
import { EdadPipe } from '../../../pipes/edad.pipe';
import { DatosExtraPipe } from '../../../pipes/datos-extra.pipe';
import { CitaConteoComponent } from '../citaConteo/citaConteo.component';
import { EspecialidadItem, MedicosService } from '../../../std/medicos/medicos.service';
import { MedicoOut } from '../../../interface/medicos.interface';
import { Location } from '@angular/common';

/** Agenda o modifica citas y valida disponibilidad según especialidad y fecha. */
@Component({
  selector: 'app-agendar',
  templateUrl: './agendar.component.html',
  styleUrls: ['./agendar.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, EdadPipe, DatosExtraPipe, CitaConteoComponent]
})


export class AgendarComponent implements OnInit, OnDestroy {

  // ======= INYECCIONES =======
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(CitaService);
  private pservice = inject(PacienteService);
  private medicosService = inject(MedicosService);
  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);
  private location = inject(Location);

  // ======= PROPIEDADES =======
  form: FormGroup;
  private destroy$ = new Subject<void>();
  especialidadSeleccionada: string | null = null;

  // Personal de atención disponible
  personal: MedicoOut[] = [];
  personalFiltrado: MedicoOut[] = [];
  especialidadesCatalogo: EspecialidadItem[] = [];
  private filtroPersonalVersion = 0;
  // Fechas deshabilitadas (feriados / asuetos) — 'YYYY-MM-DD'
  diasInhabiles = new Set<string>();
  diasInhabilesList: DiaInhabil[] = [];
  avisoFecha = signal<string | null>(null);

  // ======= BÚSQUEDA DE PACIENTE =======
  busquedaExpediente = '';
  pacienteEncontrado: PacienteJoin | null = null;
  buscandoPaciente = false;
  citas: Citas | null = null
  especialidades: Dict[] = [];

  // ======= ICONOS SVG =======
  addIcon!: SafeHtml;
  removeIcon!: SafeHtml;
  saveIcon!: SafeHtml;
  cancelIcon!: SafeHtml;
  findIcon!: SafeHtml;
  faceidicon!: SafeHtml;
  touchicon!: SafeHtml;

  // ======= SEÑALES =======
  enEdicion = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);
  mensaje = signal<{ texto: string; tipo: 'success' | 'info' | 'error' } | null>(null);
  campoError = signal<string | null>(null);

  // ======= CONSTRUCTOR =======
  constructor() {
    this.form = this.crearFormulario();

  }

  razonConsulta = [
    { ref: 'control', label: 'Control - Reconsulta' },
    { ref: 'preoperatorio', label: 'Preoperatorio' },
    { ref: 'ingreso', label: 'Ingreso SOP' },
    { ref: 'procedimiento', label: 'Procedimiento Menor' }
  ];

  ngOnInit(): void {
    this.valores();
    this.cargarCatalogoEspecialidades();
    this.cargarPersonalAtencion();
    this.cargarDiasInhabiles();

    const pacienteId = this.route.snapshot.paramMap.get('pacienteId');
    const citaId = this.route.snapshot.paramMap.get('citaId');

    if (pacienteId) {
      this.buscarPacientePorId(Number(pacienteId));
    } else if (citaId) {
      this.cargarCitaParaEdicion(Number(citaId));
    }

    this.form.get('especialidad')?.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(200), distinctUntilChanged())
      .subscribe((esp: string) => {
        this.especialidadSeleccionada = esp;
        this.filtrarPersonalAtencion(esp);
      });

    this.form.get('fecha_cita')?.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(100), distinctUntilChanged())
      .subscribe((fecha: string) => {
        if (!fecha) { this.avisoFecha.set(null); return; }
        const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const [y, m, d] = fecha.split('-').map(Number);
        // Se usa fecha local para evitar que la zona horaria desplace el día seleccionado.
        this.form.get('dia_semana')?.setValue(dias[new Date(y, m - 1, d).getDay()], { emitEvent: false });
        this.avisoFecha.set(this.validarFecha(fecha));
      });
  }

  /** Carga el catálogo de personal de atención (médicos y demás personal). */
  private cargarPersonalAtencion(): void {
    this.medicosService.getAllMedicos().pipe(takeUntil(this.destroy$)).subscribe({
      next: lista => {
        this.personal = lista;
        this.filtrarPersonalAtencion(this.form.get('especialidad')?.value);
      },
      error: () => { /* el select queda vacío; el registro sigue siendo posible sin asignar */ }
    });
  }

  private cargarCatalogoEspecialidades(): void {
    this.medicosService.getEspecialidades()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: catalogo => {
          this.especialidadesCatalogo = catalogo;
          this.filtrarPersonalAtencion(this.form.get('especialidad')?.value);
        },
        error: () => {
          this.especialidadesCatalogo = [];
          this.filtrarPersonalAtencion(this.form.get('especialidad')?.value);
        }
      });
  }

  private filtrarPersonalAtencion(especialidad: string | null | undefined): void {
    if (!especialidad) {
      this.personalFiltrado = [...this.personal];
      return;
    }

    const seleccion = this.especialidades.find(e => e.value === especialidad);
    const valor = this.normalizarTexto(String(seleccion?.value ?? especialidad));
    const etiqueta = this.normalizarTexto(seleccion?.label ?? '');
    const especialidadReal = this.especialidadesCatalogo.find(item =>
      this.normalizarTexto(item.codigo ?? '') === valor
      || this.normalizarTexto(item.abreviatura ?? '') === valor
      || this.normalizarTexto(item.nombre) === etiqueta
    );

    // Si todavía no existe el mapeo real, no mostrar personal de otra especialidad.
    if (!especialidadReal) {
      this.personalFiltrado = [];
      return;
    }

    // El filtro se resuelve en backend por FK exacta, no por coincidencia de texto.
    const version = ++this.filtroPersonalVersion;
    this.personalFiltrado = [];
    this.medicosService.getMedicos({
      activo: true,
      especialidad_id: especialidadReal.id,
      skip: 0,
      limit: 500,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        // Descarta respuestas anteriores si el usuario cambió de especialidad mientras cargaban.
        if (version !== this.filtroPersonalVersion) return;
        this.personalFiltrado = response.personal_atencion.filter(
          persona => persona.especialidad_id === especialidadReal.id
        );
        const asignado = this.form.get('personal_atencion_id')?.value;
        if (asignado && !this.personalFiltrado.some(persona => persona.id === asignado)) {
          this.form.get('personal_atencion_id')?.setValue(null, { emitEvent: false });
        }
      },
      error: () => {
        if (version === this.filtroPersonalVersion) this.personalFiltrado = [];
      }
    });
  }

  private normalizarTexto(valor: string): string {
    return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase();
  }

  /** Carga las fechas deshabilitadas por el administrador. */
  private cargarDiasInhabiles(): void {
    this.api.getDiasInhabiles().pipe(takeUntil(this.destroy$)).subscribe({
      next: lista => {
        this.diasInhabilesList = lista;
        this.diasInhabiles = new Set(lista.filter(d => d.activo).map(d => d.fecha));
      },
      error: () => {}
    });
  }

  /**
   * Valida que la fecha sea día hábil (lun–vie) y no esté deshabilitada.
   * Devuelve un mensaje de error o null si es válida.
   */
  private validarFecha(fecha: string): string | null {
    const [y, m, d] = fecha.split('-').map(Number);
    const local = new Date(y, m - 1, d);
    if (isNaN(local.getTime())) return null;
    const diaSemana = local.getDay();
    // Además del fin de semana, se respetan los cierres configurados por administración.
    if (diaSemana === 0 || diaSemana === 6) {
      return 'Las citas solo se agendan en días hábiles (lunes a viernes).';
    }
    if (this.diasInhabiles.has(fecha)) {
      const motivo = this.diasInhabilesList.find(di => di.fecha === fecha)?.motivo;
      return `Fecha deshabilitada para citas${motivo ? ` (${motivo})` : ''}.`;
    }
    return null;
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private valores(): void {
    this.especialidades = especialidades.filter(e => e.ref !== 'sop');

  }
  get tipoConsultaValue(): string {
    return this.form.get('datos_extra.razon_consulta')?.value;
  }

  // ======= FORMULARIO =======
  private crearFormulario(): FormGroup {

    return this.fb.group({
      id: [0],
      fecha_cita: [''],
      expediente: [''],
      paciente_id: [0],
      especialidad: [''],
      personal_atencion_id: [null],
      dia_semana: [{ value: '', disabled: true }],
      datos_extra: this.fb.group({
        notas: [''],
        razon_consulta: ['control'],

      })
    });
  }

  seleccionarRazonConsulta(valor: string): void {
    const actual = this.form.get('datos_extra.razon_consulta')?.value;

    // Toggle (opcional)
    const nuevo = actual === valor ? '' : valor;

    this.form.get('datos_extra.razon_consulta')?.setValue(nuevo);
  }



  actualizarDiaSemana(fecha: string) {
    if (!fecha) return;

    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const [y, m, d] = fecha.split('-').map(Number);
    const fechaLocal = new Date(y, m - 1, d);
    const dia = dias[fechaLocal.getDay()];

    this.form.patchValue({ dia_semana: dia });
  }


  // ✅ Recibe el id como parámetro, no lo lee del snapshot
  private cargarCitaParaEdicion(id: number): void {
    this.isLoading.set(true);

    this.api.getCita(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
        catchError(() => {
          this.buscarPacientePorId(id);
          return of(null);
        })
      )
      .subscribe((data: Citas | null) => {
        if (!data) return;
        this.enEdicion.set(true);
        this.pacienteEncontrado = data.paciente;
        this.form.patchValue(data, { emitEvent: false });
        this.especialidadSeleccionada = data.especialidad;
        this.filtrarPersonalAtencion(data.especialidad);
        if (data.fecha_cita) this.actualizarDiaSemana(data.fecha_cita);
        this.error.set(null);
      });
  }

  buscarPacientePorId(id: number): void {
    this.pservice.getPaciente(id)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.error.set('Paciente no encontrado');
          return of(null);
        })
      )
      .subscribe(data => {
        if (!data) return;
        this.pacienteEncontrado = data;
        this.form.patchValue({ paciente_id: data.id }, { emitEvent: false });
      });
  }



  quediaes(fecha: string): void {

  }



  // ======= UTILIDADES =======
  getNombrePaciente(): string {
    if (!this.pacienteEncontrado) return '';
    const n = this.pacienteEncontrado.nombre;
    return [
      n.primer_nombre,
      n.segundo_nombre,
      n.otro_nombre,
      n.primer_apellido,
      n.segundo_apellido,
      n.apellido_casada,
    ].filter(Boolean).join(' ').toUpperCase();
  }

  getTelefonoPaciente(): string {
    return this.pacienteEncontrado?.contacto?.telefonos ?? 'Sin teléfono registrado';
  }

  limpiarPaciente(): void {
    this.pacienteEncontrado = null;
    this.busquedaExpediente = '';
    this.form.patchValue({ paciente_id: 0, expediente: '' }, { emitEvent: false });
  }

  // ======= GUARDADO =======
  guardar(): void {
    this.mensaje.set(null);
    const valor = this.form.getRawValue();

    // Validación amigable: junta todos los motivos y resalta el primer campo.
    const motivos: string[] = [];
    let campo: string | null = null;

    if (!valor.fecha_cita) {
      motivos.push('Selecciona una fecha.');
      campo = campo ?? 'fecha_cita';
    } else {
      const aviso = this.validarFecha(valor.fecha_cita);
      if (aviso) {
        motivos.push(aviso);
        campo = campo ?? 'fecha_cita';
      }
    }

    if (!valor.paciente_id) {
      motivos.push('Selecciona un paciente.');
      campo = campo ?? 'paciente';
    }

    if (!valor.especialidad) {
      motivos.push('Selecciona una especialidad.');
      campo = campo ?? 'especialidad';
    }

    if (motivos.length > 0) {
      this.campoError.set(campo);
      this.mensaje.set({ texto: motivos.join(' '), tipo: 'error' });
      return;
    }

    this.campoError.set(null);

    const cita: CitaCreate = {
      fecha_cita: valor.fecha_cita,
      expediente: valor.expediente,
      paciente_id: valor.paciente_id,
      especialidad: valor.especialidad,
      personal_atencion_id: valor.personal_atencion_id ?? null,
      datos_extra: valor.datos_extra,
    };

    this.enEdicion()
      ? this.actualizar(valor.id, cita)
      : this.crear(cita);


  }

  private crear(cita: CitaCreate): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.api.crearCita(cita)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          console.error('Error al crear cita:', err);
          this.mensaje.set({ texto: 'No se pudo crear la cita. Verifica los datos e inténtalo de nuevo.', tipo: 'error' });
          return of(null);
        })
      )
      .subscribe(response => {
        if (!response) return;

        console.log('✅ Cita creada:', response);
        this.mensaje.set(response.queued
          ? { texto: 'Cita guardada localmente, se sincronizará cuando haya conexión.', tipo: 'info' }
          : { texto: 'Cita agendada correctamente.', tipo: 'success' });
        setTimeout(() => this.volver(), 1400);
      });
  }


  private actualizar(id: number, cita: CitaUpdate): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.api.updateCita(id, cita)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          console.error('Error al actualizar cita:', err);
          this.mensaje.set({ texto: 'No se pudo actualizar la cita. Verifica los datos e inténtalo de nuevo.', tipo: 'error' });
          return of(null);
        })
      )
      .subscribe(response => {
        if (!response) return;

        this.mensaje.set(response.queued
          ? { texto: 'Cita guardada localmente, se sincronizará cuando haya conexión.', tipo: 'info' }
          : { texto: 'Cita actualizada correctamente.', tipo: 'success' });
        setTimeout(() => this.volver(), 1400);
      });
  }

  // ======= NAVEGACIÓN =======
  /*  volver(): void {
     this.router.navigate(['/pacientes']);
   } */

  volver(): void {
    this.location.back();
  }

}
