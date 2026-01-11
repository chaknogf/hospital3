import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EdadPipe } from '../../../../pipes/edad.pipe';
import { Paciente, Totales } from '../../../../interface/interfaces';
import { ApiService } from '../../../../service/api.service';
import { Router } from '@angular/router';
import { IconService } from '../../../../service/icon.service';
import { ConsultaResponse, Ciclo } from '../../../../interface/consultas';
import { ciclos, Dict } from '../../../../enum/diccionarios';
import { DatosExtraPipe } from '../../../../pipes/datos-extra.pipe';
import { CuiPipe } from '../../../../pipes/cui.pipe';
import { TimePipe } from '../../../../pipes/time.pipe';


@Component({
  selector: 'app-ingresos',
  templateUrl: './ingresos.component.html',
  styleUrls: ['./ingresos.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, DatosExtraPipe, CuiPipe, TimePipe]
})
export class IngresosComponent implements OnInit {

  esEmergencia = true;
  consultas: ConsultaResponse[] = [];
  totales: Totales[] = [];
  paciente: Paciente | null = null;
  public status: 'activo' | 'inactivo' | 'none' = 'none';
  cargando = false;
  filtrar = false;
  visible = false;
  modalActivo = false;
  espacio: string = ' ';
  pageSize: number = 8;
  skip: number = 0;
  tipoConsultas: number = 2;
  paginaActual: number = 1;
  finPagina: boolean = false;
  totalDeRegistros = 0;
  porcentajeDeCarga = 0;
  ciclos: Dict[] = ciclos;


  filtros: any = {
    skip: 0,
    limit: this.pageSize,
    tipo_consulta: 2,
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
    private pacienteData: ApiService,
    private api: ApiService,
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
      beat: this.iconService.getIcon("beatIcon"),
      ghost: this.iconService.getIcon("ghostIcon"),
      heart: this.iconService.getIcon("heartIcon"),
      paw: this.iconService.getIcon("huellitaIcon"),
      find: this.iconService.getIcon("findIcon"),
      menu: this.iconService.getIcon("menuPuntos"),
      arrowDown: this.iconService.getIcon("arrowDown"),
      skipLeft: this.iconService.getIcon("skipLeft"),
      skipRight: this.iconService.getIcon("skipRight"),
      print: this.iconService.getIcon("printIcon"),
    };
  }

  ngOnInit(): void {
    // 1️⃣ Suscribirse al observable de consultas
    this.api.consultas$.subscribe((data) => {
      this.consultas = data;
    });

    // 2️⃣ Obtener totales
    this.api.getTotales().subscribe((data) => {
      this.totales = data;
      this.totalDeRegistros = this.totales.find(t => t.entidad === 'consultas')?.total || 0;
    });

    // 3️⃣ Llamar getConsultas con filtros iniciales
    const filtrosIniciales = {
      skip: 0,
      limit: 6,
      tipo_consulta: 2
    };

    this.api.getConsultas(filtrosIniciales);
  }

  async cargarConsultas() {
    this.cargando = true;
    try {
      this.api.getConsultas(this.filtros).subscribe((data) => {
        this.consultas = data;
      });
      this.totalDeRegistros = this.consultas.length;
    } catch (error) {
      console.error("Error:", error);
    } finally {
      this.cargando = false;
    }
  }

  buscar() {
    this.filtros.skip = 0;
    this.cargarConsultas();

  }
  toggleFiltrar() {
    this.filtrar = !this.filtrar;
  }

  limpiarFiltros() {
    this.filtros = {
      skip: 0,
      limit: this.pageSize,
      tipo_consulta: 2,
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
    this.router.navigate(['/editarAdmision', id, 'ingreso']);
  }
  agregar() {
    this.router.navigate(['/pacientes']);
  }

  verDetalle(consultaId: number) {
    this.router.navigate(['/detalleAdmision', consultaId]);
  }

  imprimir(consultaId: number) {
    this.router.navigate(['/ingreso', consultaId]);
  }

  volver() {
    this.router.navigate(['/registros']);
  }

  get totalPaginas(): number {
    return Math.ceil(this.totalDeRegistros / this.pageSize) || 1;
  }

  cambiarPagina(paso: number) {
    this.paginaActual += paso;

    if (this.paginaActual < 1) this.paginaActual = 1;
    if (this.paginaActual > this.totalPaginas) this.paginaActual = this.totalPaginas;

    this.filtros.skip = (this.paginaActual - 1) * this.pageSize;
    this.filtros.limit = this.pageSize;

    // console.log("🔄 Filtros:", this.filtros);

    this.buscar();
  }

  mostrar(): void {
    this.visible = !this.visible;
  }

  rowActiva: number | null = null;

  activarFila(id: number) {
    this.rowActiva = this.rowActiva === id ? null : id; // toggle
  }

  estadoUltimoCiclo(ciclo: Record<string, Ciclo> | null): string | null {
    if (!ciclo) return null;

    // Convertimos los valores del objeto ciclo en un array
    const registros: Ciclo[] = Object.values(ciclo);

    if (registros.length === 0) return null;

    // Ordenamos por fecha de registro descendente
    registros.sort((a, b) => new Date(b.registro).getTime() - new Date(a.registro).getTime());

    const ultimo = registros[0];

    // Buscamos el label abreviado en tu diccionario ciclos según el estado
    const encontrado = ciclos.find(c => c.value === ultimo.estado);

    return encontrado ? encontrado.label : ultimo.estado;
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
