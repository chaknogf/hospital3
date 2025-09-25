import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EdadPipe } from '../../../../pipes/edad.pipe';
import { Paciente } from '../../../../interface/interfaces';
import { ApiService } from '../../../../service/api.service';
import { ConsultaService } from '../../../../service/consulta.service';
import { Router } from '@angular/router';
import { IconService } from '../../../../service/icon.service';
import { ConsultaResponse } from '../../../../interface/consultas';

@Component({
  selector: 'app-emergenciasList',
  templateUrl: './emergenciasList.component.html',
  styleUrls: ['./emergenciasList.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, EdadPipe]
})
export class EmergenciasListComponent implements OnInit {

  esEmergencia = true;
  consultas: ConsultaResponse[] = [];
  paciente: Paciente | null = null;
  cargando = false;
  filtrar = false;
  visible = false;
  modalActivo = false;
  espacio: string = ' ';
  pageSize: number = 8;
  finPagina: boolean = false;
  totalDeRegistros = 0;
  porcentajeDeCarga = 0;


  filtros: any = {
    skip: 0,
    limit: this.pageSize,
    tipo_consulta: 3
  };

  // iconos (ahora inyectados por servicio)
  icons: { [key: string]: any } = {};

  constructor(
    private pacienteData: ApiService,
    private api: ConsultaService,
    private router: Router,
    private iconService: IconService

  ) {
    this.icons = {
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

  ngOnInit() {
    this.cargarConsultas();
  }

  async cargarConsultas() {
    this.cargando = true;
    try {
      this.consultas = await this.api.getConsultas(this.filtros);
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
      limit: this.pageSize
    };
    this.cargarConsultas();
  }

  editar(id: number) {
    this.router.navigate(['/editarAdmision', id, 'emergencia']);
  }
  agregar() {
    this.router.navigate(['/admision', 'emergencia']);
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

  cambiarPagina(skip: any) {
    this.filtros.skip += skip;
    console.log(this.filtros);
    this.buscar();
    this.finPagina = Number(this.filtros.skip) <= this.totalDeRegistros;
    console.log(this.finPagina);
  }

  mostrar(): void {
    this.visible = !this.visible;
  }

  rowActiva: number | null = null;

  activarFila(id: number) {
    this.rowActiva = this.rowActiva === id ? null : id; // toggle
  }

  getLastCiclo(ciclo: any): any {
    if (!ciclo) return null;
    const registros = Object.values(ciclo);
    registros.sort((a: any, b: any) =>
      new Date(b.registro).getTime() - new Date(a.registro).getTime()
    );
    return registros[0];
  }

}
