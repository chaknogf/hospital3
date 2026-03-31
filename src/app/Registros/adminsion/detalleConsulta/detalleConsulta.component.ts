import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { ApiService } from './../../../service/api.service';
import { IconService } from './../../../service/icon.service';
import { Paciente } from './../../../interface/interfaces';
import { Router, ActivatedRoute } from '@angular/router';
import { ConsultaResponse, CicloClinico } from './../../../interface/consultas';
import { DatosExtraPipe } from './../../../pipes/datos-extra.pipe';
import { EdadPipe } from './../../../pipes/edad.pipe';
import { CommonModule, DatePipe } from '@angular/common';
import { CuiPipe } from './../../../pipes/cui.pipe';
import { TimePipe } from './../../../pipes/time.pipe';
import { Subject } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Dict, especialidades, OpcionBoolean, opcionesIngreso } from './../../../enum/diccionarios';

@Component({
  selector: 'app-detalleConsulta',
  templateUrl: './detalleConsulta.component.html',
  styleUrls: ['./detalleConsulta.component.css'],
  standalone: true,
  imports: [DatosExtraPipe, EdadPipe, DatePipe, CuiPipe, CommonModule, TimePipe],
})
export class DetalleConsultaComponent implements OnInit, OnDestroy {

  // ======= INYECCIONES =======
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private iconService = inject(IconService);

  // ======= SIGNALS =======
  paciente = signal<Paciente | undefined>(undefined);
  consulta = signal<ConsultaResponse | undefined>(undefined);
  isLoading = signal(false);
  error = signal<string | null>(null);
  detalleVisible = signal(false);

  // ======= FLAGS DE ORIGEN =======
  esEmergencia = false;
  esCoex = false;
  esIngreso = false;

  // ======= HISTORIAL DEL CICLO =======
  // Ordenado más reciente primero para el template
  historialCiclos: CicloClinico[] = [];
  mostrarHistorial = signal(false);

  toggleHistorial(): void { this.mostrarHistorial.update(v => !v); }

  // Solo lectura — enEdicion siempre false en este componente
  // Se mantiene para que el template no lance error si usa la propiedad
  enEdicion = false;

  // ======= COMPUTED =======
  responsable = computed(() => {
    const refs = this.paciente()?.referencias;
    if (!refs?.length) return null;
    return refs.find(r => r.responsable === true) ?? refs[0];
  });

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

  estadoActual = computed(() => {
    const ciclos = this.consulta()?.ciclo;
    if (!ciclos?.length) return null;
    return ciclos[ciclos.length - 1].estado;
  });

  ultimoCiclo = computed(() => {
    const ciclos = this.consulta()?.ciclo;
    if (!ciclos?.length) return null;
    console.log('Ciclos encontrados:', ciclos);
    return ciclos[ciclos.length - 1];
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
      back: this.iconService.getIcon('regresarIcon'),
      print: this.iconService.getIcon('printIcon'),
      logo: this.iconService.getIcon('logoicon2'),
      cuadroBlanco: this.iconService.getIcon('cuadroBlanco'),
      cuadroNegro: this.iconService.getIcon('cuadroNegro'),
      edit: this.iconService.getIcon("editIcon"),
    };
  }

  // ======= CICLO DE VIDA =======
  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const origen = params['origen'] ?? '';
        this.esEmergencia = origen === 'emergencia';
        this.esCoex = origen === 'coex';
        this.esIngreso = origen === 'ingreso';
      });

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

  // ======= CARGA =======
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
      .subscribe((data: ConsultaResponse | null) => {
        if (!data) {
          this.error.set('Consulta no encontrada');
          return;
        }
        this.consulta.set(data);
        this.paciente.set(data.paciente);
        // Invertir para mostrar más reciente primero en el historial
        this.historialCiclos = [...(data.ciclo ?? [])].reverse();
        this.detalleVisible.set(true);
      });
  }

  // ======= INDICADORES =======
  getIndicador(field: string): boolean {
    const ind = this.consulta()?.indicadores;
    if (!ind) return false;
    return (ind as unknown as Record<string, boolean>)[field] ?? false;
  }
  editar(id: number) {
    this.router.navigate(['/formConsulta', id]);
  }

  // ======= ACCIONES =======
  imprimir(): void { window.print(); }

  regresar(): void {
    if (this.esEmergencia) this.router.navigate(['/emergencias']);
    else if (this.esCoex) this.router.navigate(['/coex']);
    else if (this.esIngreso) this.router.navigate(['/ingresos']);
    else this.router.navigate(['/consultas']);
  }
}
