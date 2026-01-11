import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { ApiService } from '../../../../service/api.service';
import { Paciente } from '../../../../interface/interfaces';
import { Router, ActivatedRoute } from '@angular/router';
import { ConsultaBase } from '../../../../interface/consultas';
import { DatosExtraPipe } from '../../../../pipes/datos-extra.pipe';
import { EdadPipe } from '../../../../pipes/edad.pipe';
import { CommonModule, DatePipe } from '@angular/common';
import { CuiPipe } from '../../../../pipes/cui.pipe';
import { TimePipe } from '../../../../pipes/time.pipe';
import { IconService } from '../../../../service/icon.service';
import { Subject } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-HojaCoex',
  templateUrl: './HojaCoex.component.html',
  styleUrls: ['./HojaCoex.component.css'],
  standalone: true,
  imports: [DatosExtraPipe, EdadPipe, DatePipe, CuiPipe, TimePipe, CommonModule],
})
export class HojaCoexComponent implements OnInit, OnDestroy {
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

  /**
   * Obtiene la referencia marcada como responsable
   */
  responsable = computed(() => {
    const referencias = this.paciente()?.referencias;
    if (!referencias || referencias.length === 0) return null;

    const respFound = referencias.find(ref => ref.responsable === true);
    return respFound || referencias[0];
  });

  // ======= PROPIEDADES =======
  fechaActual: string = '';
  horaActual: string = '';
  private destroy$ = new Subject<void>();

  icons: { [key: string]: any } = {};

  constructor() {
    this.icons = {
      logo: this.iconService.getIcon("logoicon2"),
      back: this.iconService.getIcon("regresarIcon"),
      print: this.iconService.getIcon("printIcon")
    };
  }

  ngOnInit(): void {
    this.inicializarFechas();

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

  // ======= INICIALIZACIÓN =======
  private inicializarFechas(): void {
    this.horaActual = new Date().toLocaleTimeString('es-GT', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    this.fechaActual = new Date().toLocaleDateString('es-GT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // ======= CARGA DE DATOS =======
  private cargarDatos(consultaId: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Cargar consulta
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
          this.detalleVisible.set(true);
          return;
        }

        this.consulta.set(data[0]);

        // Cargar paciente después de obtener la consulta
        if (data[0].paciente_id) {
          this.cargarPaciente(data[0].paciente_id);
        } else {
          this.error.set('ID de paciente no disponible en la consulta');
          this.detalleVisible.set(true);
        }
      });
  }

  private cargarPaciente(pacienteId: number): void {
    if (!pacienteId) {
      this.error.set('ID de paciente no válido');
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

  // ======= ACCIONES =======
  imprimir(): void {
    window.print();
  }

  regresar(): void {
    this.router.navigate(['/coex']);
  }
}
