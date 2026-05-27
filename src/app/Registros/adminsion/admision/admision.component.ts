import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { ApiService } from '../../../service/api.service';
import { ConsultaService } from '../../consultas/consultas.service';
import { Location } from '@angular/common';
import { Dict, ciclos, tipoConsulta, especialidades, servicios } from '../../../enum/diccionarios';
import { Paciente } from '../../../interface/interfaces';
import {
  ConsultaOut, ConsultaUpdate, RegistroConsultaCreate,
  CicloClinico, EstadoCiclo, Indicador
} from '../../../interface/consultas';

import { EdadPipe } from '../../../pipes/edad.pipe';
import { DatosExtraPipe } from '../../../pipes/datos-extra.pipe';
import { CuiPipe } from '../../../pipes/cui.pipe';
import { addIcon, removeIcon, saveIcon, cancelIcon, findIcon, manIcon, womanIcon } from '../../../shared/icons/svg-icon';
import { PacienteService } from '../../patient/paciente.service';

@Component({
  selector: 'app-admision',
  templateUrl: './admision.component.html',
  styleUrls: ['./admision.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, EdadPipe, DatosExtraPipe, CuiPipe]
})
export class AdmisionComponent implements OnInit {

  form: FormGroup = new FormGroup({});
  paciente: Paciente | null = null;
  consultaActual?: ConsultaOut;
  private consultaId?: number;
  historialCiclos: CicloClinico[] = [];

  tipoConsulta: Dict[] = tipoConsulta;
  ciclos: Dict[] = ciclos;
  especialidadesFiltradas: Dict[] = [];
  servicios: Dict[] = [];

  usuarioActual = '';
  enEdicion = false;
  esEmergencia = false;
  esCoesx = false;
  esIngreso = false;
  esConsulta = false;

  addIcon!: SafeHtml;
  removeIcon!: SafeHtml;
  saveIcon!: SafeHtml;
  cancelIcon!: SafeHtml;
  findIcon!: SafeHtml;
  womanIcon!: SafeHtml;
  manIcon!: SafeHtml;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private api: ConsultaService,
    private apis: ApiService,
    private apip: PacienteService,
    private sanitizer: DomSanitizer
  ) {
    this.inicializarFormulario();
    this.inicializarSVG();
  }

  ngOnInit(): void {
    this.usuarioActual = this.apis.getUsuarioActual().username;
    this.inicializarFlagsYCarga(this.route.snapshot.paramMap);
  }

  // ══════════════════════════════════════════════════════════
  // INICIALIZACIÓN
  // ══════════════════════════════════════════════════════════

  private inicializarFormulario(): void {
    this.form = this.fb.group({
      id: [{ value: null, disabled: true }],
      expediente: [{ value: '', disabled: true }],
      documento: [{ value: '', disabled: true }],
      fecha_consulta: [''],
      hora_consulta: [''],
      orden: [{ value: null, disabled: true }],
      paciente_id: [0],
      tipo_consulta: [{ value: null, disabled: true }],
      especialidad: [''],
      servicio: [''],
      indicadores: this.fb.group({
        estudiante_publico: [false],
        empleado_publico: [false],
        accidente_laboral: [false],
        discapacidad: [false],
        accidente_transito: [false],
        arma_fuego: [false],
        arma_blanca: [false],
        ambulancia: [false],
        embarazo: [false]
      }),
      nuevo_estado: [''],
      nuevo_servicio: [''],
      nuevo_comentario: [''],
      condicion: [''],
      referencia: [''],
      lactancia_materna: [''],
      medico: [''],
      diagnosticos: [''],
      registro: ['']
    });
  }

  private inicializarSVG(): void {
    const icons = { addIcon, removeIcon, saveIcon, cancelIcon, findIcon, womanIcon, manIcon };
    Object.entries(icons).forEach(([key, value]) => {
      (this as any)[key] = this.sanitizer.bypassSecurityTrustHtml(value);
    });
  }

  private inicializarFlagsYCarga(params: any): void {
    const origen = params.get('origen');
    const id = Number(params.get('id'));
    const pacienteId = Number(params.get('pacienteId'));

    this.esEmergencia = origen === 'emergencia';
    this.esCoesx = origen === 'coex';
    this.esIngreso = origen === 'ingreso';
    this.esConsulta = origen === 'consulta';
    this.consultaId = id === 0 ? undefined : id;

    if (this.esEmergencia) this.valoresEmergencia();
    else if (this.esCoesx) this.valoresCoex();
    else if (this.esIngreso) this.valoresIngreso();

    if (this.consultaId !== undefined) {
      this.enEdicion = true;
      this.cargarConsulta(this.consultaId);
    } else if (pacienteId && id === 0) {
      this.enEdicion = false;
      this.cargarPaciente(pacienteId);
    }
  }

  // ══════════════════════════════════════════════════════════
  // CARGA DE DATOS
  // ══════════════════════════════════════════════════════════

  cargarPaciente(idP: number): void {
    this.apip.getPaciente(idP)
      .pipe(catchError(err => { this.mostrarError('cargar paciente', err); return of(null); }))
      .subscribe(data => {
        if (!data) return;
        this.paciente = data;
        this.form.patchValue({
          paciente_id: idP,
          expediente: data.expediente || 'Se generará automáticamente'
        });
      });
  }

  cargarConsulta(id: number): void {
    this.api.getConsultaId(id)
      .pipe(catchError(err => { this.mostrarError('cargar consulta', err); return of(null); }))
      .subscribe(data => {
        if (!data) return;

        this.consultaActual = data;
        this.historialCiclos = data.ciclo || [];
        if (data.paciente) this.paciente = data.paciente as any;

        this.form.patchValue({
          id: data.id,
          expediente: data.expediente,
          documento: data.documento,
          paciente_id: data.paciente_id,
          tipo_consulta: data.tipo_consulta,
          especialidad: data.especialidad,
          servicio: data.servicio,
          fecha_consulta: data.fecha_consulta,
          hora_consulta: data.hora_consulta,
          orden: data.orden,
          indicadores: data.indicadores,
          ...(data.egreso && {
            condicion: data.egreso.condicion || '',
            referencia: data.egreso.referencia || '',
            lactancia_materna: data.egreso.lactancia_materna || false,
            medico: data.egreso.medico || '',
            diagnosticos: data.egreso.diagnosticos || '',
            registro: data.egreso.registro?.substring(0, 16) || ''
          })
        });

        this.filtrarPorTipo(Number(data.tipo_consulta));
      });
  }

  // ══════════════════════════════════════════════════════════
  // GUARDAR
  // ══════════════════════════════════════════════════════════

  guardar(): void {
    const tipo = Number(this.form.getRawValue().tipo_consulta);

    if (this.enEdicion) {
      this.actualizarConsulta().subscribe();
      return;
    }

    const v = this.form.getRawValue();
    const datos: RegistroConsultaCreate = {
      paciente_id: v.paciente_id,
      tipo_consulta: v.tipo_consulta,
      especialidad: v.especialidad,
      servicio: v.servicio,
      indicadores: v.indicadores,
      ciclo: []
    };

    this.api.registrarAdmision(datos)
      .pipe(
        tap(),
        catchError(err => { this.mostrarError('registrar admisión', err); return of(null); })
      )
      .subscribe(r => { if (r) this.navegarSegunTipo(tipo, r.id); });
  }

  // ══════════════════════════════════════════════════════════
  // ACTUALIZAR CONSULTA
  // El backend es responsable de proteger ultimo_estado si
  // la consulta está archivada. El frontend solo construye
  // el payload limpio.
  // ══════════════════════════════════════════════════════════

  private actualizarConsulta() {
    if (!this.consultaId) return of(null);

    const v = this.form.getRawValue();
    const payload: ConsultaUpdate = {
      especialidad: v.especialidad || undefined,
      servicio: v.servicio || undefined,
      indicadores: v.indicadores as Indicador,
    };

    // ── Egreso ──────────────────────────────────────────────
    const tieneDatosEgreso = v.condicion || v.referencia || v.medico || v.diagnosticos || v.registro;

    if (tieneDatosEgreso) {
      payload.egreso = {
        condicion: v.condicion || '',
        referencia: v.referencia || undefined,
        medico: v.medico || undefined,
        lactancia_materna: v.lactancia_materna || false,
        diagnosticos: v.diagnosticos || '',
        registro: v.registro ? `${v.registro}:00` : undefined
      };
    }

    // ── Ciclo ───────────────────────────────────────────────
    // El backend decide si actualiza ultimo_estado según el estado actual.
    // El frontend solo envía el estado solicitado y un comentario.
    if (v.nuevo_estado) {
      payload.ciclo = {
        estado: v.nuevo_estado as EstadoCiclo,
        especialidad: v.especialidad || undefined,
        servicio: v.nuevo_servicio || v.servicio || undefined,
        comentario: v.nuevo_comentario || undefined
      };
    } else if (tieneDatosEgreso) {
      // Sin cambio de estado explícito pero hay datos de egreso → registrar actualización
      payload.ciclo = {
        estado: 'actualizado',
        especialidad: v.especialidad || undefined,
        servicio: v.servicio || undefined,
        comentario: 'Actualización de datos de egreso'
      };
    }

    return this.api.updateConsulta(this.consultaId, payload).pipe(
      tap(() => {
        // this.mostrarExito('Consulta actualizada exitosamente');
        this.cargarConsulta(this.consultaId!);
        this.form.patchValue({ nuevo_estado: '', nuevo_servicio: '', nuevo_comentario: '' });
      }),
      catchError(err => { this.mostrarError('actualizar consulta', err); return of(null); })
    );
  }

  // ── Indicadores rápido ─────────────────────────────────────

  actualizarIndicadores(): void {
    if (!this.consultaId) return;
    const indicadores = this.form.get('indicadores')?.value as Indicador;
    this.api.updateConsulta(this.consultaId, { indicadores })
      .pipe(
        tap(),
        catchError(err => { this.mostrarError('actualizar indicadores', err); return of(null); })
      )
      .subscribe();
  }

  editarPaciente(id: number): void { this.router.navigate(['/pacienteEdit', id]); }

  // ══════════════════════════════════════════════════════════
  // VALORES POR TIPO
  // ══════════════════════════════════════════════════════════

  private filtrarPorTipo(tipo: number): void {
    switch (tipo) {
      case 1:
        this.especialidadesFiltradas = especialidades.filter(e => e.ref !== 'sop');
        this.servicios = servicios.filter(s => s.ref === 'coex');
        break;
      case 2:
        this.especialidadesFiltradas = especialidades.filter(e => e.ref === 'all');
        this.servicios = servicios.filter(s => s.ref === 'ingreso');
        break;
      case 3:
        this.especialidadesFiltradas = especialidades.filter(e => e.ref === 'all');
        this.servicios = servicios.filter(s => s.ref === 'emergencia');
        break;
      default:
        this.especialidadesFiltradas = especialidades;
        this.servicios = servicios;
    }
  }

  private valoresEmergencia(): void { this.filtrarPorTipo(3); this.form.patchValue({ tipo_consulta: 3, servicio: 'REME' }); }
  private valoresIngreso(): void { this.filtrarPorTipo(2); this.form.patchValue({ tipo_consulta: 2, servicio: 'HOSPITALIZACION' }); }
  private valoresCoex(): void { this.filtrarPorTipo(1); this.form.patchValue({ tipo_consulta: 1, servicio: 'COEX' }); }

  // ══════════════════════════════════════════════════════════
  // NAVEGACIÓN
  // ══════════════════════════════════════════════════════════

  private navegarSegunTipo(tipo: number, id?: number): void {
    const rutas: Record<number, string> = {
      1: '/coexHoja',
      2: '/ingreso',
      3: '/hojaEmergencia'
    };
    const base = rutas[tipo] ?? '/consultas';
    const destino = id ? [base, id] : [base];
    this.router.navigate(destino);
  }

  volver(): void { this.location.back(); }
  /*  volver(): void {
     const ruta = this.esEmergencia ? '/emergencias'
       : this.esCoesx ? '/coex'
         : this.esIngreso ? '/ingresos'
           : '/pacientes';
     this.router.navigate([ruta]);
   }
  */
  // ══════════════════════════════════════════════════════════
  // GETTERS TEMPLATE
  // ══════════════════════════════════════════════════════════

  get estadoActual(): string | null { return this.consultaActual?.ultimo_estado ?? null; }

  get ultimoCiclo(): CicloClinico | null {
    const ciclo = this.consultaActual?.ciclo;
    return ciclo?.length ? ciclo[ciclo.length - 1] : null;
  }

  // ══════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════

  private mostrarError(accion: string, error: any): void {
    console.error(`❌ Error al ${accion}:`, error);
    alert(`Error al ${accion}. ${error?.error?.detail || error?.message || 'Consulte la consola'}`);
  }

  //private mostrarExito(mensaje: string): void { console.log(`✅ ${mensaje}`); }
}
