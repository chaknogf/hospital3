// pacientes.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../service/api.service';
import { Paciente, Renap } from '../../../interface/interfaces';
import { IconService } from '../../../service/icon.service';
import { PacienteFiltros } from '../../../interface/paciente-filtros.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DetallePacienteComponent } from '../detallePaciente/detallePaciente.component';
import { EdadPipe } from "../../../pipes/edad.pipe";
import { DatosExtraPipe } from '../../../pipes/datos-extra.pipe';
import { arrowDown, skipLeft, skipRight } from '../../../shared/icons/svg-icon';
import { skip } from 'rxjs';

@Component({
  selector: 'app-pacientes',
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, EdadPipe, DatosExtraPipe]
})
export class PacientesComponent implements OnInit {

  pacientes: Paciente[] = [];
  enRenap: Renap[] = [];
  existePaciente: boolean = false;
  cargando = false;
  filtrar = false;
  visible = false;
  modalActivo = false;
  espacio: string = ' ';
  page: number = 1;
  pageSize: number = 10;
  totalDeRegistros = 0;
  porcentajeDeCarga = 0;

  filtros: PacienteFiltros = {
    skip: 0,
    limit: 10
  };

  pacienteSeleccionadoId: number | null = null;
  mostrarDetallePaciente = false;

  // iconos (ahora inyectados por servicio)
  icons: { [key: string]: any } = {};

  constructor(
    private api: ApiService,
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
    };
  }

  ngOnInit() {
    this.cargarPacientes();
  }

  async cargarPacientes() {
    this.cargando = true;
    try {
      if (this.existePaciente) {
        this.enRenap = await this.api.getRenapITD(this.filtros);
        this.totalDeRegistros = this.enRenap.length;
      } else {
        this.pacientes = await this.api.getPacientes(this.filtros);
        this.totalDeRegistros = this.pacientes.length;
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      this.cargando = false;
    }
  }

  buscar() {
    this.cargarPacientes();
  }

  limpiarFiltros() {
    this.filtros = { skip: 0, limit: 10 };
    this.cargarPacientes();
  }

  editarPaciente(pacienteId: number) {
    this.router.navigate(['/paciente', pacienteId]);
  }

  eliminarPaciente(pacienteId: number) {
    if (confirm('¿Está seguro de que desea eliminar este paciente?')) {
      this.api.deletePaciente(pacienteId);
    }
  }

  agregar() {
    this.router.navigate(['/paciente']);
  }

  verDetallesPaciente(pacienteId: number) {
    // this.pacienteSeleccionadoId = pacienteId;
    // this.mostrarDetallePaciente = true;
    // this.modalActivo = true;
    this.router.navigate(['/detallePaciente', pacienteId]);
  }

  cerrarDetallePaciente() {
    this.mostrarDetallePaciente = false;
    this.pacienteSeleccionadoId = null;
    this.modalActivo = false;
  }

  volver() {
    this.router.navigate(['/registros']);
  }

  toggleFiltrar() {
    this.filtrar = !this.filtrar;
  }
  get totalPaginas(): number {
    return Math.ceil(this.totalDeRegistros / this.pageSize) || 1;
  }

  cambiarPagina(direccion: number) {
    const nuevaPagina = this.page + direccion;
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.page = nuevaPagina;
      this.filtros.skip = (this.page - 1) * this.pageSize;
      this.cargarPacientes();
    }
  }

  mostrar(): void {
    this.visible = !this.visible;
  }

  rowActiva: number | null = null;

  activarFila(id: number) {
    this.rowActiva = this.rowActiva === id ? null : id; // toggle
  }
}
