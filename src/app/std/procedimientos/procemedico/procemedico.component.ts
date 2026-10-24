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
  CategoriaEdad,
  CategoriaEdadItem,
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
  gruposEdad: CategoriaEdadItem[] = [];

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

  /** Catálogo maestro completo: cualquier especialidad puede seleccionar cualquier procedimiento. */
  get catalogoFiltrado(): CatalogoProcedimiento[] {
    return this.catalogo;
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

  /** Una categoría tiene cantidad capturada en M o en F. */
  tieneCantidad(codigo: string): boolean {
    const c = this.controlesEdad.get(codigo)?.value;
    return (Number(c?.m) || 0) > 0 || (Number(c?.f) || 0) > 0;
  }

  /** Categorías con cantidad (niño, adulto y no especificado), para el resumen. */
  get gruposConCantidad(): { codigo: string; nombre: string; m: number; f: number }[] {
    const categorias: { codigo: CategoriaEdad; nombre: string }[] = [
      ...this.gruposEdad.map(g => ({ codigo: g.codigo, nombre: g.nombre })),
      { codigo: 'sin_edad', nombre: 'No especificado' }
    ];
    return categorias
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

  /** Etiqueta legible de una categoría etaria (o de los históricos sin edad). */
  nombreCategoria(codigo: string): string {
    return this.gruposEdad.find(g => g.codigo === codigo)?.nombre
      ?? (codigo === 'sin_edad' ? 'No especificado' : codigo);
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
    const orden: CategoriaEdad[] = ['nino', 'adulto', 'sin_edad'];
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
    this.catalogoApi.getCatalogoProcedimientos({ activo: true, limit: 500 }).subscribe({
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
        // Si el registro ya se cargó, reinicializar los controles borró su
        // desglose; volvemos a aplicarlo.
        if (this.procedimientoActual) {
          this.aplicarDesglose(this.procedimientoActual);
        }
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
          id_catalogo_procedimiento: data.id_catalogo_procedimiento ?? null,
          procedimiento: data.catalogo?.nombre ?? '',
          id_area_cuerpo_intervenida: data.id_area_cuerpo_intervenida ?? null,
          responsable: data.responsable ?? ''
        });

        this.aplicarDesglose(data);
      },
      error: err => console.error(err),
      complete: () => { this.cargando = false; }
    });
  }

  /** Aplica el desglose (niño/adulto/no especificado) × sexo al formulario reactivo. */
  private aplicarDesglose(data: ProceMedico): void {
    const valores: Record<CategoriaEdad, { m: number; f: number }> = {
      nino: { m: data.nino_m || 0, f: data.nino_f || 0 },
      adulto: { m: data.adulto_m || 0, f: data.adulto_f || 0 },
      sin_edad: { m: data.sin_edad_m || 0, f: data.sin_edad_f || 0 }
    };
    for (const codigo of Object.keys(valores) as CategoriaEdad[]) {
      const ctrl = this.controlesEdad.get(codigo);
      if (ctrl) {
        ctrl.get('m')?.setValue(valores[codigo].m);
        ctrl.get('f')?.setValue(valores[codigo].f);
      }
    }
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

  guardar(): void {
    const detalle = this.construirDetalle();

    if (this.form.invalid || !detalle) {
      this.form.markAllAsTouched();
      this.controlesEdad.markAllAsTouched();
      if (!detalle) {
        this.mostrarMensaje('Debe registrar al menos una categoría de edad con cantidad.');
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
      nino_m: detalle.nino_m,
      nino_f: detalle.nino_f,
      adulto_m: detalle.adulto_m,
      adulto_f: detalle.adulto_f,
      sin_edad_m: detalle.sin_edad_m,
      sin_edad_f: detalle.sin_edad_f
    };

    if (this.enEdicion && this.procedimientoId) {
      this.api.updateProcedimientoMedico(this.procedimientoId, base as ProceMedicoUpdate).subscribe({
        next: () => {
          this.mostrarMensaje('Procedimiento actualizado correctamente');
          this.router.navigate(['/estadistica/procedimientos']);
        },
        error: err => { this.guardando = false; this.mostrarError(err); }
      });
      return;
    }

    this.api.createProcedimientoMedico(base as ProceMedicoCreate).subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarMensaje('Procedimiento guardado correctamente');
        // Conservar especialidad, lugar y fecha para encadenar el siguiente registro
        const preservar = {
          especialidad_id: this.form.value.especialidad_id,
          lugar_servicio: this.form.value.lugar_servicio,
          fecha: this.form.value.fecha
        };
        this.limpiarForm(preservar);
      },
      error: err => { this.guardando = false; this.mostrarError(err); }
    });
  }

  /** Cantidades por categoría (niño/adulto/no especificado) y sexo, omitiendo los ceros. */
  private construirDetalle(): { nino_m: number; nino_f: number; adulto_m: number; adulto_f: number; sin_edad_m: number; sin_edad_f: number } | null {
    const nino = this.controlesEdad.get('nino')?.value;
    const adulto = this.controlesEdad.get('adulto')?.value;
    const sinEdad = this.controlesEdad.get('sin_edad')?.value;
    const detalle = {
      nino_m: Number(nino?.m) || 0,
      nino_f: Number(nino?.f) || 0,
      adulto_m: Number(adulto?.m) || 0,
      adulto_f: Number(adulto?.f) || 0,
      sin_edad_m: Number(sinEdad?.m) || 0,
      sin_edad_f: Number(sinEdad?.f) || 0
    };
    return (detalle.nino_m + detalle.nino_f + detalle.adulto_m + detalle.adulto_f
      + detalle.sin_edad_m + detalle.sin_edad_f) > 0
      ? detalle
      : null;
  }

  /** Muestra el detalle que devuelve el backend, o un mensaje genérico. */
  private mostrarError(err: any): void {
    const httpStatus = err?.status;
    const detalle = err?.error?.detail;
    // Validación del lado del servidor (422)
    if (httpStatus === 422 && Array.isArray(detalle)) {
      const mensajes = detalle.map((d: any) => d.msg ?? d.path?.join(' ') ?? '').filter(Boolean);
      this.mostrarMensaje(mensajes.length ? mensajes.join(' · ') : 'Error de validación');
      return;
    }
    // Conflicto de integridad (409): unique constraint, check constraint, etc.
    if (httpStatus === 409 && typeof detalle === 'string') {
      this.mostrarMensaje(detalle);
      return;
    }
    // Error de longitud de campo (PostgreSQL DataError suele venir con "length")
    if (typeof detalle === 'string' && detalle.toLowerCase().includes('length')) {
      this.mostrarMensaje('El valor supera la longitud permitida para ese campo (máx. 10 caracteres en Especialidad/Lugar/Responsable).');
      return;
    }
    // Cualquier otro error: mostramos el detail o un mensaje genérico
    if (typeof detalle === 'string') {
      this.mostrarMensaje(detalle);
    } else {
      console.error(err);
      this.mostrarMensaje('No se pudo guardar el procedimiento.');
    }
  }

  get f() { return this.form.controls; }
  volver(): void { this.location.back(); }
  private limpiarForm(preservar: any = {}): void {
    this.form.reset({ fecha: preservar.fecha ?? '', lugar_servicio: preservar.lugar_servicio ?? '', especialidad_id: preservar.especialidad_id ?? null, id_catalogo_procedimiento: null, procedimiento: '', id_area_cuerpo_intervenida: null, responsable: '' });
    this.controlesEdad.get('nino')?.reset({ m: 0, f: 0 });
    this.controlesEdad.get('adulto')?.reset({ m: 0, f: 0 });
  }
  private mostrarMensaje(mensaje: string, duracion: number = 5000): void {
    this.mensajeAlerta = mensaje;
    this.mostrarAlerta = true;
    setTimeout(() => { this.mostrarAlerta = false; }, duracion);
  }

  eliminar(): void {
    if (!this.procedimientoId) return;
    if (!confirm('¿Eliminar este procedimiento registrado?')) return;
    this.guardando = true;
    this.api.deleteProcedimientoMedico(this.procedimientoId).subscribe({
      next: () => {
        this.mostrarMensaje('Procedimiento eliminado correctamente');
        this.router.navigate(['/estadistica/procedimientos']);
      },
      error: err => { this.guardando = false; this.mostrarError(err); }
    });
  }
}
