import { Component, OnInit, OnDestroy, inject, input, effect, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CitaResponse, Citas } from '../../../interface/citas';
import { CitaService } from '../cita.service';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Location } from '@angular/common';
import {
  addIcon, removeIcon, saveIcon, cancelIcon, findIcon, menuIcon,
  searchIcon, arrowDown, tablaShanonIcon, editIcon, skipRight, skipLeft, printIcon
} from '../../../shared/icons/svg-icon';
import { DatosExtraPipe } from '../../../pipes/datos-extra.pipe';
import { Especialidades, KeyValue } from '../../../enum/especialidades';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-citas-especialidad',
  templateUrl: './citasEspecialidad.component.html',
  styleUrls: ['./citasEspecialidad.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, DatosExtraPipe]
})
export class CitasEspecialidadComponent implements OnInit, OnDestroy {

  // ======= INYECCIONES =======
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(CitaService);
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private sanitizer = inject(DomSanitizer);

  private destroy$ = new Subject<void>();

  // ======= SIGNAL INPUT =======
  // Uso: <app-citas-especialidad [especialidad]="'CARDIOLOGIA'" />
  // Si no se pasa nada, muestra todas las especialidades
  readonly especialidad = input<string>('');

  private hoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  // ======= ESTADO =======
  citas: CitaResponse[] = [];
  citasFiltradas: CitaResponse[] = [];
  especialidadesList: KeyValue[] = Especialidades;
  citaSeleccionada: CitaResponse | null = null;
  cargando = false;
  filtrar = false;
  visible = false;
  modalActivo = false;
  finPagina: boolean = false;
  rowActiva: number | null = null;
  pageSize: number = 10;
  paginaActual: number = 1;
  totalDeRegistros = 0;

  // ======= FILTROS =======
  filtros: any = {
    expediente: '',
    especialidad: '',
    fecha_cita: this.hoy(),
    limit: this.pageSize,
    skip: 0,
  };

  // ======= ICONOS =======
  addIcon!: SafeHtml;
  removeIcon!: SafeHtml;
  saveIcon!: SafeHtml;
  cancelIcon!: SafeHtml;
  findIcon!: SafeHtml;
  searchIcon!: SafeHtml;
  arrowDown!: SafeHtml;
  tablaShanonIcon!: SafeHtml;
  editIcon!: SafeHtml;
  skipRight!: SafeHtml;
  skipLeft!: SafeHtml;
  printIcon!: SafeHtml;
  menuIcon!: SafeHtml;

  filtroForm: FormGroup = this.fb.group({
    expediente: [''],
    especialidad: [''],
    fecha: [''],
  });

  constructor() {
    this.inicializarIconos();

    // ======= EFFECT: reacciona cuando cambia el input de especialidad =======
    effect(() => {
      const esp = this.especialidad(); // lectura reactiva del signal

      // Sincroniza el filtro con el valor recibido por input
      // Si viene vacío, el usuario puede filtrar manualmente desde el select
      this.filtros.especialidad = esp;

      this.cargarCitas();
    });
  }

  // ======= CICLO DE VIDA =======
  ngOnInit(): void {
    this.api.citas$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.citas = data;
      this.citasFiltradas = data;
      this.cargando = false;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private inicializarIconos(): void {
    this.addIcon = this.sanitizer.bypassSecurityTrustHtml(addIcon);
    this.removeIcon = this.sanitizer.bypassSecurityTrustHtml(removeIcon);
    this.menuIcon = this.sanitizer.bypassSecurityTrustHtml(menuIcon);
    this.cancelIcon = this.sanitizer.bypassSecurityTrustHtml(cancelIcon);
    this.findIcon = this.sanitizer.bypassSecurityTrustHtml(findIcon);
    this.searchIcon = this.sanitizer.bypassSecurityTrustHtml(searchIcon);
    this.arrowDown = this.sanitizer.bypassSecurityTrustHtml(arrowDown);
    this.tablaShanonIcon = this.sanitizer.bypassSecurityTrustHtml(tablaShanonIcon);
    this.editIcon = this.sanitizer.bypassSecurityTrustHtml(editIcon);
    this.skipLeft = this.sanitizer.bypassSecurityTrustHtml(skipLeft);
    this.skipRight = this.sanitizer.bypassSecurityTrustHtml(skipRight);
    this.printIcon = this.sanitizer.bypassSecurityTrustHtml(printIcon);
  }

  // ======= CARGA DE DATOS =======
  cargarCitas(): void {
    this.cargando = false;
    // console.log(this.filtros)
    this.api.getCitas(this.filtros).pipe(takeUntil(this.destroy$)).subscribe({
      next: resultado => {
        this.totalDeRegistros = resultado.total;
        this.citas = resultado.citas;
        this.citasFiltradas = resultado.citas;
        this.cargando = false;
        // Ajustar página si el backend devolvió menos de lo esperado
        if (this.paginaActual > this.totalPaginas) {
          this.paginaActual = this.totalPaginas;
        }
      },
      error: error => {
        console.error('Error al cargar citas:', error);
        this.cargando = false;
      },
      complete: () => {
        this.cargando = false;
      }
    });


  }

  limpiarFiltros(): void {
    this.filtros = {
      expediente: '',
      // ⚠️ Respeta el input: si se pasó especialidad por input, no la limpia
      especialidad: this.especialidad(),
      fecha_cita: this.hoy(),
      limit: this.pageSize,
      skip: 0,
    };
    this.cargarCitas();
  }

  toggleFiltros(): void {
    this.filtrar = !this.filtrar;
  }

  // ======= SELECCIÓN / DETALLE =======
  verDetalle(id: number): void {
    this.visible = true;
  }

  cerrarDetalle(): void {
    this.citaSeleccionada = null;
    this.visible = false;
  }

  editarCita(id: number): void {
    this.router.navigate(['/reagendar/cita', id]);
  }

  // ======= UTILIDADES =======
  trackById(_index: number, cita: Citas): number {
    return cita.id;
  }

  get totalCitas(): number {
    return this.citasFiltradas.length;
  }

  volver() {
    this.location.back();
  }

  imprimirCitas(): void {
    this.router.navigate(['/imprimirCitas']);
  }

  // ======= GETTER útil para el template =======
  // Indica si la especialidad está bloqueada por el input padre
  get especialidadFijada(): boolean {
    return !!this.especialidad();
  }

  // ======= PAGINADOR =======


  activarFila(id: number): void {
    this.rowActiva = this.rowActiva === id ? null : id;
  }

  get totalPaginas(): number {
    return Math.ceil(this.totalDeRegistros / this.pageSize) || 1;
  }

  get hayPaginaAnterior(): boolean { return this.paginaActual > 1; }
  get hayPaginaSiguiente(): boolean { return this.paginaActual < this.totalPaginas; }


  cambiarPagina(paso: number): void {
    const nueva = this.paginaActual + paso;
    if (nueva < 1 || nueva > this.totalPaginas) return;

    this.paginaActual = nueva;
    this.filtros.skip = (this.paginaActual - 1) * this.pageSize;
    this.filtros.limit = this.pageSize;
    this.cargarCitas();
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.filtros.skip = (pagina - 1) * this.pageSize;
    this.filtros.limit = this.pageSize;
    this.cargarCitas();
  }

  get paginas(): number[] {
    const total = this.totalPaginas;
    const actual = this.paginaActual;
    const delta = 2; // páginas a cada lado de la actual

    const rango: number[] = [];
    for (let i = Math.max(1, actual - delta); i <= Math.min(total, actual + delta); i++) {
      rango.push(i);
    }
    return rango;
  }

}
