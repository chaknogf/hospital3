import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ConstanciaNacimientoOut } from '../../../interface/consNac';
import { ConstanciaNacimiento } from '../constancias.inteface';
import { ApiService } from '../../../service/api.service';
import { ConstanciasService } from '../constancias.service';
import { Router } from '@angular/router';
import { IconService } from '../../../service/icon.service';
import { FormsModule } from '@angular/forms';
import { CapitalizePipe } from '../../../pipes/capitalize.pipe';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-listarConstancias',
  templateUrl: './listarConstancias.component.html',
  styleUrls: ['./listarConstancias.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CapitalizePipe]
})
export class ListarConstanciasComponent implements OnInit, OnDestroy {

  datos: ConstanciaNacimiento[] = [];
  cargando = false;
  filtrar = false;
  visible = false;
  modalActivo = false;
  error: string | null = null;
  finPagina: boolean = false;
  rowActiva: number | null = null;
  pageSize: number = 10;
  paginaActual: number = 1;
  totalDeRegistros = 0;

  filtros: any = {
    id_usuario: '',
    id_constancia: '',
    nombre_madre: '',
    fecha: '',
    documento: '',
    expediente: '',
    limit: this.pageSize,
    offser: 0
  }

  // iconos (ahora inyectados por servicio)
  icons: { [key: string]: any } = {};


  constructor(
    private pacienteData: ApiService,
    private api: ConstanciasService,
    private router: Router,
    private iconService: IconService

  ) {
    this.icons = {
      docuento: this.iconService.getIcon("documentoIcon"),
      edit: this.iconService.getIcon("editIcon"),
      trash: this.iconService.getIcon("trashIcon"),
      find: this.iconService.getIcon("findIcon"),
      menu: this.iconService.getIcon("menuIcon"),
      arrowDown: this.iconService.getIcon("arrowDown"),
      skipLeft: this.iconService.getIcon("skipLeft"),
      skipRight: this.iconService.getIcon("skipRight"),
      print: this.iconService.getIcon("printIcon"),
    };
  }

  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.api.constancias$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.datos = data;
    });
    console.log(this.datos);
    this.cargarDatos();

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarDatos() {
    this.cargando = true;

    this.api.getConstancias(this.filtros).pipe(takeUntil(this.destroy$)).subscribe({
      next: resultado => {
        this.totalDeRegistros = resultado.total;
        this.datos = resultado.constancias;
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


  toggleFiltrar() {
    this.filtrar = !this.filtrar;
  }



  limpiarFiltros() {
    this.filtros = {
      id_usuario: '',
      id_constancia: '',
      nombre_madre: '',
      fecha: '',
      documento: '',
      expediente: '',
      limit: this.pageSize,
      offser: 0
    };
    this.cargarDatos();
  }

  editar(id: number) {
    this.router.navigate(['/cons-nac', id]);
  }

  imprimir(id: number) {
    this.router.navigate(['/cnprint', id])
  }

  pacientes() {
    this.router.navigate(['/pacientes']);
  }

  volver() {
    this.router.navigate(['/registros']);
  }

  agregar() {
    this.router.navigate(['/nueva-cons-nac']);
  }

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
    this.filtros.offset = (this.paginaActual - 1) * this.pageSize;
    this.filtros.limit = this.pageSize;
    this.cargarDatos();
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.filtros.offset = (pagina - 1) * this.pageSize;
    this.filtros.limit = this.pageSize;
    this.cargarDatos();
  }

  trackById(index: number, item: any): any {
    return item.id ?? index;
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
