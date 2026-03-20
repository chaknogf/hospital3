import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { ApiService } from '../../../../service/api.service';
import { Paciente } from '../../../../interface/interfaces';
import { Router, ActivatedRoute } from '@angular/router';
import { ConsultaBase } from '../../../../interface/consultas';
import { DatosExtraPipe } from '../../../../pipes/datos-extra.pipe';
import { EdadPipe } from '../../../../pipes/edad.pipe';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { CuiPipe } from '../../../../pipes/cui.pipe';
import { TimePipe } from '../../../../pipes/time.pipe';
import { IconService } from '../../../../service/icon.service';
import { Subject } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { DepartamentoPipe } from '../../../../pipes/lugar.pipe';

@Component({
  selector: 'app-hojaIngreso',
  templateUrl: './hojaIngreso.component.html',
  styleUrls: ['./hojaIngreso.component.css'],
  standalone: true,
  imports: [DatosExtraPipe, EdadPipe, DatePipe, CuiPipe, TimePipe, CommonModule, TitleCasePipe, DepartamentoPipe],
})
export class HojaIngresoComponent implements OnInit, OnDestroy {

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

  // ======= COMPUTED =======
  nombreCompleto = computed(() => {
    const p = this.paciente();
    if (!p?.nombre) return '';
    return [
      p.nombre.primer_nombre,
      p.nombre.segundo_nombre,
      p.nombre.otro_nombre,
      p.nombre.primer_apellido,
      p.nombre.segundo_apellido
    ].filter(Boolean).join(' ').trim();
  });

  direccionCompleta = computed(() => {
    const c = this.paciente()?.contacto;
    if (!c) return '';
    return [c.domicilio, c.municipio].filter(Boolean).join(', ');
  });

  responsable = computed(() => {
    const refs = this.paciente()?.referencias;
    if (!refs?.length) return null;
    return refs.find(r => r.responsable === true) ?? refs[0];
  });

  // ======= PROPIEDADES =======
  fechaActual: string = '';
  horaActual: string = '';
  private destroy$ = new Subject<void>();

  icons: { [key: string]: any } = {};

  constructor() {
    this.icons = {
      logo: this.iconService.getIcon('logoicon2'),
      back: this.iconService.getIcon('regresarIcon'),
      print: this.iconService.getIcon('printIcon'),
    };
  }

  // ======= CICLO DE VIDA =======
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
      hour: '2-digit', minute: '2-digit', hour12: false
    });
    this.fechaActual = new Date().toLocaleDateString('es-GT', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  // ======= CARGA DE DATOS =======
  private cargarDatos(consultaId: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.api.getConsultaId(consultaId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          console.error('❌ Error cargando consulta:', err);
          this.error.set('Error al cargar la consulta');
          return of(null);
        })
      )
      .subscribe(data => {
        if (!data) {
          this.error.set('Consulta no encontrada');
          this.detalleVisible.set(true);
          return;
        }

        this.consulta.set(data);

        // Intentar obtener paciente embebido o por id
        const pacienteId =
          (data as any).paciente?.id ??
          (data as any).paciente_id ??
          (data as any).idpaciente;

        if (pacienteId) {
          this.cargarPaciente(pacienteId);
        } else if ((data as any).paciente) {
          this.paciente.set((data as any).paciente);
          this.detalleVisible.set(true);
        } else {
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
        catchError(err => {
          console.error('❌ Error cargando paciente:', err);
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
  imprimir(): void { window.print(); }
  regresar(): void { this.router.navigate(['/ingresos']); }
}
