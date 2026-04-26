
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EdadPipe } from './../../../pipes/edad.pipe';
import { Paciente, Totales } from './../../../interface/interfaces';
import { ConsultaService } from './../consultas.service';
import { Router } from '@angular/router';
import { IconService } from './../../../service/icon.service';
import { ConsultaResponse, Ciclo } from './../../../interface/consultas';
import { ciclos, Dict, tipoConsulta } from './../../../enum/diccionarios';
import { DatosExtraPipe } from './../../../pipes/datos-extra.pipe';
import { CuiPipe } from './../../../pipes/cui.pipe';
import { TimePipe } from '../../../pipes/time.pipe';


@Component({
  selector: 'app-consultas',
  templateUrl: './consultas.component.html',
  styleUrls: ['./consultas.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, DatosExtraPipe, CuiPipe, TimePipe, EdadPipe]
})
export class ConsultasComponent implements OnInit {

  consultas: ConsultaResponse[] = [];
  totales: Totales[] = [];
  paciente: Paciente | null = null;
  tipos: Dict[] = tipoConsulta;
  cargando = false;
  filtrar = false;
  visible = false;
  modalActivo = false;
  espacio: string = ' ';
  pageSize: number = 8;
  paginaActual: number = 1;
  finPagina: boolean = false;
  totalDeRegistros = 0;
  porcentajeDeCarga = 0;
  ciclos: Dict[] = ciclos;


  filtros: any = {
    skip: 0,
    limit: this.pageSize,
    tipo_consulta: '',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    fecha_consulta: '',
    ciclo: '',
    especialidad: '',
    servicio: '',
    identificador: '',
  };

  // iconos (ahora inyectados por servicio)
  icons: { [key: string]: any } = {};

  constructor(

    private api: ConsultaService,
    private router: Router,
    private iconService: IconService

  ) {
    this.icons = {
      docuento: this.iconService.getIcon("documentoIcon"),
      activo: this.iconService.getIcon("activoIcon"),
      search: this.iconService.getIcon("searchIcon"),
      delete: this.iconService.getIcon("deletInput"),
      create: this.iconService.getIcon("createIcon"),
      edit: this.iconService.getIcon("editIcon"),
      trash: this.iconService.getIcon("trashIcon"),
      tabla: this.iconService.getIcon("tablaShanonIcon"),
      medical: this.iconService.getIcon("medicalServiceIcon"),
      man: this.iconService.getIcon("manIcon"),
      woman: this.iconService.getIcon("womanIcon"),
      paw: this.iconService.getIcon("huellitaIcon"),
      find: this.iconService.getIcon("findIcon"),
      menu: this.iconService.getIcon("menuIcon"),
      arrowDown: this.iconService.getIcon("arrowDown"),
      skipLeft: this.iconService.getIcon("skipLeft"),
      skipRight: this.iconService.getIcon("skipRight"),
      print: this.iconService.getIcon("printIcon"),
    };
  }

  ngOnInit(): void {
    // 1️⃣ Suscribirse al observable de consultas
    this.api.consultas$.subscribe(data => { this.consultas = data; });
    this.cargarConsultas();
    this.buscar();
  }


  cargarConsultas(): void {
    this.cargando = true;
    this.api.getConsultas(this.filtros).subscribe({
      next: resultado => {
        this.totalDeRegistros = resultado.total;
        this.consultas = resultado.consultas;

        // Ajustar página si el backend devolvió menos de lo esperado
        if (this.paginaActual > this.totalPaginas) {
          this.paginaActual = this.totalPaginas;
        }
      },
      error: err => {
        console.error('Error cargando consultas:', err);
        this.consultas = [];
        this.totalDeRegistros = 0;
      },
      complete: () => { this.cargando = false; }
    });
  }

  rowActiva: number | null = null;
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
    this.cargarConsultas();
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.filtros.skip = (pagina - 1) * this.pageSize;
    this.filtros.limit = this.pageSize;
    this.cargarConsultas();
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

  buscar() {
    this.filtros
    this.cargarConsultas();
  }

  toggleFiltrar() {
    this.filtrar = !this.filtrar;
  }

  limpiarFiltros() {
    this.filtros = {
      skip: 0,
      limit: this.pageSize,
      tipo_consulta: '',
      primer_nombre: '',
      segundo_nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      fecha_consulta: '',
      ciclo: '',
      identificador: ''
    };
    this.cargarConsultas();
  }

  editar(id: number) {
    this.router.navigate(['/editarAdmision', id, 'consulta']);
  }
  agregar() {
    this.router.navigate(['/pacientes']);
  }

  verDetalle(consultaId: number) {
    this.router.navigate(['/detalleAdmision', consultaId]);
  }

  imprimir(consultaId: number) {
    this.router.navigate(['/hojaEmergencia', consultaId]);
  }

  volver() {
    this.router.navigate(['/registros']);
  }



  mostrar(): void {
    this.visible = !this.visible;
  }


  getCicloStatus(ciclo: Record<string, any>): 'activo' | 'inactivo' {
    if (!ciclo) return 'activo'; // si no hay ciclos, asumimos activo

    const registros = Object.values(ciclo);
    if (registros.length === 0) return 'activo';

    // Orden descendente por fecha
    registros.sort((a: any, b: any) =>
      new Date(b.registro).getTime() - new Date(a.registro).getTime()
    );

    const ultimo = registros[0];
    const encontrado = ciclos.find(c => c.value === ultimo.estado);

    // Retornamos inactivo solo si el ref del ciclo es 'inactivo'
    return encontrado?.ref === 'inactivo' ? 'inactivo' : 'activo';
  }

}
