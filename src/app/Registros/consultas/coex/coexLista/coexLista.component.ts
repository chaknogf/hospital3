import { filter } from 'rxjs/operators';


import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EdadPipe } from '../../../../pipes/edad.pipe';
import { Paciente, Totales } from '../../../../interface/interfaces';
import { ApiService } from '../../../../service/api.service';
import { ConsultaService } from '../../../../service/consulta.service';
import { Router } from '@angular/router';
import { IconService } from '../../../../service/icon.service';
import { ConsultaResponse, Ciclo } from '../../../../interface/consultas';
import { ciclos } from '../../../../enum/diccionarios';
import { DatosExtraPipe } from '../../../../pipes/datos-extra.pipe';
import { CuiPipe } from '../../../../pipes/cui.pipe';


@Component({
  selector: 'app-coexLista',
  templateUrl: './coexLista.component.html',
  styleUrls: ['./coexLista.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, DatosExtraPipe, CuiPipe]
})
export class CoexListaComponent implements OnInit {

  esEmergencia = true;
  consultas: ConsultaResponse[] = [];
  medi: ConsultaResponse[] = [];
  pedia: ConsultaResponse[] = [];
  gine: ConsultaResponse[] = [];
  ciru: ConsultaResponse[] = [];
  trauma: ConsultaResponse[] = [];
  psico: ConsultaResponse[] = [];
  nutri: ConsultaResponse[] = [];
  odonto: ConsultaResponse[] = [];

  totales: Totales[] = [];
  paciente: Paciente | null = null;
  public status: 'activo' | 'inactivo' | 'none' = 'none';
  cargando = false;
  filtrar = false;
  visible = false;
  modalActivo = false;
  espacio: string = ' ';
  pageSize: number = 200;
  paginaActual: number = 1;
  finPagina: boolean = false;
  fechaActual: Date = new Date();
  totalDeRegistros = 0;
  porcentajeDeCarga = 0;
  especialidadSeleccionada: string = '';


  filtros: any = {
    skip: 0,
    limit: this.pageSize,
    tipo_consulta: 1,
    fecha_consulta: this.fechaActual
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
      odont: this.iconService.getIcon("odontoIcon"),
      nutri: this.iconService.getIcon("nutriIcon"),
      psico: this.iconService.getIcon("psicoIcon"),
      trauma: this.iconService.getIcon("traumaIcon"),
      ciru: this.iconService.getIcon("ciruIcon"),
      gine: this.iconService.getIcon("gineIcon"),
      pedia: this.iconService.getIcon("pediaIcon"),
      medicina: this.iconService.getIcon("medicinaIcon"),
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
    // Suscribirse a las consultas (observable único de la app)
    this.api.consultas$.subscribe((data) => {
      this.consultas = data;
    });

    // Totales
    this.api.getTotales().then((data) => {
      this.totales = data;
      this.totalDeRegistros = this.totales.find(t => t.entidad === 'consultas')?.total || 0;
    });

    // 👇 Aquí sí usamos filtros desde el inicio
    this.api.getConsultas(this.filtros);
  }

  async cargarConsultas() {
    this.cargando = true;
    try {
      this.consultas = await this.api.getConsultas(this.filtros);

      this.medi = await this.api.getConsultas({ ...this.filtros, especialidad: 'MEDI' });
      this.pedia = await this.api.getConsultas({ ...this.filtros, especialidad: 'PEDIA' });
      this.gine = await this.api.getConsultas({ ...this.filtros, especialidad: 'GINE' });
      this.ciru = await this.api.getConsultas({ ...this.filtros, especialidad: 'CIRU' });
      this.trauma = await this.api.getConsultas({ ...this.filtros, especialidad: 'TRAU' });
      this.psico = await this.api.getConsultas({ ...this.filtros, especialidad: 'PSIC' });
      this.nutri = await this.api.getConsultas({ ...this.filtros, especialidad: 'NUTR' });
      this.odonto = await this.api.getConsultas({ ...this.filtros, especialidad: 'ODON' });

      this.totalDeRegistros = this.consultas.length;
    } catch (error) {
      console.error("Error:", error);
    } finally {
      this.cargando = false;
    }
  }

  async filtrarPorEspecialidad(especialidad: string) {
    this.especialidadSeleccionada = especialidad; // 👉 marcar el botón activo
    this.cargando = true;
    try {
      const consultasFiltradas = await this.api.getConsultas({ ...this.filtros, especialidad });
      consultasFiltradas.sort((a: ConsultaResponse, b: ConsultaResponse) =>
        new Date(a.fecha_consulta).getTime() - new Date(b.fecha_consulta).getTime()
      );
      this.consultas = consultasFiltradas.map((c: ConsultaResponse, i: number) => ({
        ...c,
        orden: i + 1
      }));
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
      limit: this.pageSize
    };
    this.cargarConsultas();
  }

  editar(id: number) {
    this.router.navigate(['/editarAdmision', id, 'coex']);
  }
  agregar() {
    this.router.navigate(['/admision', 'coex']);
  }

  verDetalle(consultaId: number) {
    this.router.navigate(['/detalleAdmision', consultaId]);
  }

  imprimir(consultaId: number) {
    this.router.navigate(['/hojaCoex', consultaId]);
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
