import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { ApiService } from '../../../../service/api.service';
import { Paciente } from '../../../../interface/interfaces';
import { Router, ActivatedRoute } from '@angular/router';
import { ConsultaBase } from '../../../../interface/consultas';
import { DatosExtraPipe } from '../../../../pipes/datos-extra.pipe';
import { EdadPipe } from '../../../../pipes/edad.pipe';
import { CommonModule, DatePipe } from '@angular/common';
import { CuiPipe } from '../../../../pipes/cui.pipe';
import { IconService } from '../../../../service/icon.service';
import { TimePipe } from '../../../../pipes/time.pipe';
import { Subject } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  Dict,
  especialidades,
  OpcionBoolean,
  opcionesIngreso
} from './../../../../enum/diccionarios';

@Component({
  selector: 'app-hoja',
  templateUrl: './hoja.component.html',
  styleUrls: ['./hoja.component.css'],
  standalone: true,
  imports: [
    DatosExtraPipe,
    EdadPipe,
    DatePipe,
    CuiPipe,
    CommonModule,
    TimePipe
  ],
})
export class HojaComponent implements OnInit, OnDestroy {
  // ======= INYECCIONES =======
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private iconService = inject(IconService);

  // ======= SIGNALS =======
  paciente = signal<Paciente | undefined>(undefined);
  consulta = signal<ConsultaBase | undefined>(undefined);
  isLoading = signal(false);
  error = signal<string | null>(null);
  detalleVisible = signal(false);

  // ======= COMPUTED SIGNALS =======
  /**
   * Obtiene la referencia marcada como responsable
   */
  responsable = computed(() => {
    const referencias = this.paciente()?.referencias;
    if (!referencias || referencias.length === 0) return null;

    // Buscar el responsable (el que tenga responsable === true)
    const respFound = referencias.find(ref => ref.responsable === true);
    return respFound || referencias[0]; // Fallback al primero
  });

  /**
   * Nombre completo del paciente
   */
  nombreCompleto = computed(() => {
    const p = this.paciente();
    if (!p?.nombre) return '';

    return [
      p.nombre.primer_nombre,
      p.nombre.segundo_nombre,
      p.nombre.otro_nombre,
      p.nombre.primer_apellido,
      p.nombre.segundo_apellido
    ]
      .filter(Boolean)
      .join(' ')
      .trim();
  });

  /**
   * Dirección completa del paciente
   */
  direccionCompleta = computed(() => {
    const contacto = this.paciente()?.contacto;
    if (!contacto) return '';

    return [contacto.domicilio, contacto.municipio]
      .filter(Boolean)
      .join(', ');
  });

  // ======= PROPIEDADES =======
  fechaActual: string = new Date().toLocaleDateString('es-GT');
  horaActual: string = new Date().toLocaleTimeString('es-GT');
  especialidades: Dict[] = especialidades;
  opcionesIngreso: OpcionBoolean[] = opcionesIngreso;

  private destroy$ = new Subject<void>();

  icons: { [key: string]: any } = {};

  constructor() {
    this.icons = {
      back: this.iconService.getIcon("regresarIcon"),
      print: this.iconService.getIcon("printIcon"),
      logo: this.iconService.getIcon("logoicon2"),
      cuadroBlanco: this.iconService.getIcon("cuadroBlanco"),
      cuadroNegro: this.iconService.getIcon("cuadroNegro")
    };
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id && !isNaN(id)) {
      this.cargarDatos(id);
    } else {
      this.error.set('ID de consulta inválido');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ======= CARGA DE DATOS =======
  private cargarDatos(consultaId: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.api.getConsultaId(consultaId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
        catchError(error => {
          console.error('❌ Error cargando consulta:', error);
          this.error.set('Error al cargar la consulta');
          return of(null);
        })
      )
      .subscribe(data => {
        if (!data || !data[0]) {
          this.error.set('Consulta no encontrada');
          return;
        }

        this.consulta.set(data[0]);
        this.cargarPaciente(data[0].paciente_id);
      });
  }

  private cargarPaciente(pacienteId: number): void {
    if (!pacienteId) {
      this.error.set('ID de paciente no disponible');
      this.detalleVisible.set(true);
      return;
    }

    this.api.getPaciente(pacienteId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.detalleVisible.set(true)),
        catchError(error => {
          console.error('❌ Error cargando paciente:', error);
          this.error.set('Error al cargar el paciente');
          return of(null);
        })
      )
      .subscribe(pacienteData => {
        if (pacienteData) {
          this.paciente.set(pacienteData);
        } else {
          this.error.set('Paciente no encontrado');
        }
      });
  }

  // ======= INDICADORES =======
  /**
   * Obtiene el valor de un indicador
   */
  getIndicador(field: string): boolean {
    const indicadores = this.consulta()?.indicadores;
    if (!indicadores) return false;

    return (indicadores as unknown as Record<string, boolean>)[field] ?? false;
  }

  /**
   * Verifica si debe mostrar cuadro lleno o vacío
   */
  mostrarCuadroLleno(condicion: boolean): boolean {
    return condicion;
  }

  // ======= ACCIONES =======
  imprimir(): void {
    window.print();
  }

  regresar(): void {
    this.router.navigate(['/emergencias']);
  }
}
