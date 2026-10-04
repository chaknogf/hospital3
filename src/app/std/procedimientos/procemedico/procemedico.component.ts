import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogoService } from '../../../service/catalogo.service';
import { EspecialidadesService } from '../../../service/especialidades.service';
import {
  AreaCuerpoIntervenida,
  CatalogoProcedimiento,
  GrupoEdad,
  GrupoEdadDetalle,
  GrupoEdadItem,
  ProceMedico,
  ProceMedicoCreate,
  ProceMedicoUpdate
} from '../../../interface/procedimientos';
import { StdService } from '../../std.service';
import { Dict, lugarServicios } from '../../../enum/diccionarios';

@Component({
  selector: 'app-procemedico',
  templateUrl: './procemedico.component.html',
  styleUrls: ['./procemedico.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
/** Registra procedimientos realizados por personal médico, con el desglose por grupo de edad/sexo y zona de intervención. */
export class ProcemedicoComponent implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  procedimientoId: number | null = null;
  mostrarAlerta = false;
  mensajeAlerta = '';
  procedimientoActual: ProceMedico | null = null;
  lugarServicios: Dict[] = lugarServicios;

  // ── Catálogos ──
  catalogo: CatalogoProcedimiento[] = [];
  areasCuerpo: AreaCuerpoIntervenida[] = [];
  especialidades: any[] = [];
  gruposEdad: GrupoEdadItem[] = [];

  cargando = false;
  guardando = false;
  enEdicion = false;

  form: FormGroup = this.fb.group({
    fecha: ['', Validators.required],
    lugar_servicio: [''],
    especialidad_id: [null],
    id_catalogo_procedimiento: [null, Validators.required],
    procedimiento: [''],
    id_area_cuerpo_intervenida: [null],
    responsable: ['']
  });

  /** Un control por cada grupo etario: { m: number, f: number }. */
  controlesEdad: FormGroup = this.fb.group({});

  /** Procedimiento del catálogo seleccionado. */
  get procedimientoSeleccionado(): CatalogoProcedimiento | null {
    const id = this.form.value.id_catalogo_procedimiento;
    return this.catalogo.find(c => c.id === id) ?? null;
  }

  /** El catálogo se acota a la especialidad elegida, si la tiene. */
  get catalogoFiltrado(): CatalogoProcedimiento[] {
    const espId = this.form.value.especialidad_id;
    if (espId == null) {
      return this.catalogo;
    }
    return this.catalogo.filter(c => c.especialidad_ref === espId);
  }

  /** Procedimientos del catálogo que casi no se usan, para localizarlos rápido. */
  busqueda: string = '';

  get catalogoVisible(): CatalogoProcedimiento[] {
    const texto = this.busqueda.trim().toLowerCase();
    const base = this.catalogoFiltrado;
    if (!texto) {
      return base;
    }
    return base.filter(c =>
      `${c.abreviatura ?? ''} ${c.nombre}`.toLowerCase().includes(texto)
    );
  }

  /** Anestesia que el backend calcula como catálogo × cantidad; solo es informative. */
  get anestesiaCalculada(): number {
    return (this.procedimientoSeleccionado?.anestesia ?? 0) * this.totalGeneral;
  }

  /** Total de cantidades capturadas, para mostrarlo junto al botón de guardar. */
  get totalGeneral(): number {
    return this.totalMasculino + this.totalFemenino;
  }

  get totalMasculino(): number {
    let total = 0;
    for (const codigo of Object.keys(this.controlesEdad.controls)) {
      total += Number(this.controlesEdad.get(codigo)?.value?.m) || 0;
    }
    return total;
  }

  get totalFemenino(): number {
    let total = 0;
    for (const codigo of Object.keys(this.controlesEdad.controls)) {
      total += Number(this.controlesEdad.get(codigo)?.value?.f) || 0;
    }
    return total;
  }

  /** Un grupo tiene cantidad capturada en M o en F. */
  tieneCantidad(codigo: string): boolean {
    const c = this.controlesEdad.get(codigo)?.value;
    return (Number(c?.m) || 0) > 0 || (Number(c?.f) || 0) > 0;
  }

  /** Grupos con cantidad, en el orden IMCI/OMS, para el resumen. */
  get gruposConCantidad(): { codigo: string; nombre: string; m: number; f: number }[] {
    return this.gruposEdad
      .filter(g => this.tieneCantidad(g.codigo))
      .map(g => {
        const c = this.controlesEdad.get(g.codigo)?.value;
        return {
          codigo: g.codigo,
          nombre: g.nombre,
          m: Number(c?.m) || 0,
          f: Number(c?.f) || 0
        };
      });
  }

  constructor(
    private api: StdService,
    private catalogoApi: CatalogoService,
    private especialidadesApi: EspecialidadesService
  ) {
    this.inicializarControlesEdad();
  }

  ngOnInit(): void {
    this.cargarCatalogos();

    this.procedimientoId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.procedimientoId) {
      this.enEdicion = true;
      this.cargarProcedimiento(this.procedimientoId);
    }
  }

  private inicializarControlesEdad(): void {
    const orden: GrupoEdad[] = ['NEO', 'LAC', 'PRI', 'SEG', 'ADO', 'ADU', 'ADM'];
    const grupo = this.fb.group({}) as FormGroup;
    for (const codigo of orden) {
      grupo.addControl(codigo, this.fb.group({
        m: [0, [Validators.min(0)]],
        f: [0, [Validators.min(0)]]
      }));
    }
    this.controlesEdad = grupo;
  }

  cargarCatalogos(): void {
    this.catalogoApi.getCatalogoProcedimientos({ activo: true, limit: 5000 }).subscribe({
      next: d => this.catalogo = d,
      error: err => console.error(err)
    });
    this.catalogoApi.getAreasCuerpo(true).subscribe({
      next: d => this.areasCuerpo = d,
      error: err => console.error(err)
    });
    this.especialidadesApi.getEspecialidades(true, true).subscribe({
      next: d => this.especialidades = d,
      error: err => console.error(err)
    });
    this.api.getGruposEdad().subscribe({
      next: d => {
        this.gruposEdad = d;
        this.inicializarControlesEdad();
      },
      error: err => console.error(err)
    });
  }

  cargarProcedimiento(id: number): void {
    this.cargando = true;
    this.api.getProcedimientoMedico(id).subscribe({
      next: (data: ProceMedico) => {
        this.procedimientoActual = data;
        this.form.patchValue({
          fecha: data.fecha,
          lugar_servicio: data.lugar_servicio,
          especialidad_id: data.especialidad_id ?? null,
          id_catalogo_procedimiento: data.id_catalogo_procedimiento ?? data.id_procedimiento ?? null,
          procedimiento: data.catalogo?.nombre ?? data.procedimiento?.nombre ?? '',
          id_area_cuerpo_intervenida: data.id_area_cuerpo_intervenida ?? null,
          responsable: data.responsable ?? ''
        });

        // Carga el desglose existente
        const orden: GrupoEdad[] = ['NEO', 'LAC', 'PRI', 'SEG', 'ADO', 'ADU', 'ADM'];
        for (const codigo of orden) {
          const valores = data.grupo_edad_detalle?.[codigo] || { m: 0, f: 0 };
          const ctrl = this.controlesEdad.get(codigo);
          if (ctrl) {
            ctrl.get('m')?.setValue(valores.m || 0);
            ctrl.get('f')?.setValue(valores.f || 0);
          }
        }
      },
      error: err => console.error(err),
      complete: () => { this.cargando = false; }
    });
  }

  onProcedimientoChange(id: number | null): void {
    if (id == null) {
      this.form.patchValue({ procedimiento: '' });
      return;
    }
    const p = this.catalogo.find(x => x.id === id);
    this.form.patchValue({ procedimiento: p?.nombre ?? '' });

    // El procedimiento trae su especialidad: se completa si el campo está vacío
    if (p?.especialidad_ref != null && this.form.value.especialidad_id == null) {
      this.form.patchValue({ especialidad_id: p.especialidad_ref });
    }
  }

  onEspecialidadChange(id: number | null): void {
    // Si el procedimiento elegido no pertenece a la especialidad, se limpia
    const procId = this.form.value.id_catalogo_procedimiento;
    if (id == null || procId == null) return;
    const proc = this.catalogo.find(p => p.id === procId);
    if (proc?.especialidad_ref != null && proc.especialidad_ref !== id) {
      this.form.patchValue({ id_catalogo_procedimiento: null, procedimiento: '' });
    }
  }

  guardar(): void {
    const detalle = this.construirDetalle();

    if (this.form.invalid || !detalle) {
      this.form.markAllAsTouched();
      this.controlesEdad.markAllAsTouched();
      if (!detalle) {
        this.mostrarMensaje('Debe registrar al menos un grupo de edad con cantidad.');
      }
      return;
    }

    this.guardando = true;
    const v = this.form.value;

    const base: any = {
      fecha: v.fecha,
      lugar_servicio: v.lugar_servicio || null,
      especialidad_id: v.especialidad_id ?? null,
      id_catalogo_procedimiento: v.id_catalogo_procedimiento,
      id_area_cuerpo_intervenida: v.id_area_cuerpo_intervenida ?? null,
      responsable: v.responsable || null,
      grupo_edad_detalle: detalle
    };

    if (this.enEdicion && this.procedimientoId) {
      this.api.updateProcedimientoMedico(this.procedimientoId, base as ProceMedicoUpdate).subscribe({
        next: () => {
          this.mostrarMensaje('Procedimiento actualizado correctamente');
          this.router.navigate(['/procedimientosmenores']);
        },
        error: err => { this.guardando = false; this.mostrarError(err); }
      });
      return;
    }

    this.api.createProcedimientoMedico(base as ProceMedicoCreate).subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarMensaje('Procedimiento guardado correctamente');
        this.limpiarForm();
      },
      error: err => { this.guardando = false; this.mostrarError(err); }
    });
  }

  /** Agrupa M/F de los 7 grupos, omitiendo los que no tienen cantidad. */
  private construirDetalle(): GrupoEdadDetalle | null {
    const detalle: GrupoEdadDetalle = {};
    const orden: GrupoEdad[] = ['NEO', 'LAC', 'PRI', 'SEG', 'ADO', 'ADU', 'ADM'];
    for (const codigo of orden) {
      const c = this.controlesEdad.get(codigo)?.value;
      const m = Number(c?.m) || 0;
      const f = Number(c?.f) || 0;
      if (m > 0 || f > 0) {
        detalle[codigo] = { m, f };
      }
    }
    return Object.keys(detalle).length ? detalle : null;
  }

  /** Muestra el detalle que devuelve el backend, o un mensaje genérico. */
  private mostrarError(err: any): void {
    const detalle = err?.error?.detail;
    if (typeof detalle === 'string') {
      this.mostrarMensaje(detalle);
    } else if (Array.isArray(detalle) && detalle.length) {
      this.mostrarMensaje(detalle.map((d: any) => d.msg ?? d).join(' · '));
    } else {
      console.error(err);
      this.mostrarMensaje('No se pudo guardar el procedimiento.');
    }
  }

  volver(): void {
    this.router.navigate(['/procedimientosmenores']);
  }

  get f() {
    return this.form.controls;
  }

  limpiarForm(): void {
    this.form.reset({
      fecha: '',
      lugar_servicio: '',
      especialidad_id: null,
      id_catalogo_procedimiento: null,
      procedimiento: '',
      id_area_cuerpo_intervenida: null,
      responsable: ''
    });
    this.busqueda = '';
    const orden: GrupoEdad[] = ['NEO', 'LAC', 'PRI', 'SEG', 'ADO', 'ADU', 'ADM'];
    for (const codigo of orden) {
      const ctrl = this.controlesEdad.get(codigo);
      if (ctrl) {
        ctrl.get('m')?.setValue(0);
        ctrl.get('f')?.setValue(0);
      }
    }
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.controlesEdad.markAsPristine();
    this.controlesEdad.markAsUntouched();
  }

  mostrarMensaje(mensaje: string, duracion: number = 5000): void {
    this.mensajeAlerta = mensaje;
    this.mostrarAlerta = true;
    setTimeout(() => { this.mostrarAlerta = false; }, duracion);
  }
}
