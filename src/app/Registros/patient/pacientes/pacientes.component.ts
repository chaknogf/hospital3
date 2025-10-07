// pacientes.component.ts
import { Component, OnInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../service/api.service';
import { Paciente, Renap, Totales } from '../../../interface/interfaces';
import { IconService } from '../../../service/icon.service';
import { PacienteFiltros } from '../../../interface/paciente-filtros.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EdadPipe } from "../../../pipes/edad.pipe";
import { DatosExtraPipe } from '../../../pipes/datos-extra.pipe';
import { CuiPipe } from '../../../pipes/cui.pipe';
import { addExpediente, addPerson } from '../../../shared/icons/svg-icon';


@Component({
  selector: 'app-pacientes',
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, EdadPipe, DatosExtraPipe, CuiPipe]
})
export class PacientesComponent implements OnInit {
  options: { nombre: string; descripcion: string; ruta: string; icon: string }[] = [];

  // iconos
  icons: { [key: string]: any } = {};

  pacientes: Paciente[] = [];
  enRenap: Renap[] = [];
  totales: Totales[] = [];
  existePaciente: boolean = false;
  cargando = false;
  filtrar = false;
  visible = false;
  modalActivo = false;
  espacio: string = ' ';
  pageSize: number = 6;
  paginaActual: number = 1;
  finPagina: boolean = false;
  totalDeRegistros = 0;
  porcentajeDeCarga = 0;
  pacienteSeleccionado: number = 0;
  @ViewChild('dialogAdmision') dialog!: ElementRef<HTMLDialogElement>;
  filtros: PacienteFiltros = {
    skip: 0,
    limit: this.pageSize,
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    nombre_completo: '',
    sexo: '',
    fecha_nacimiento: '',
    referencias: '',
    estado: ''
  };

  // busquedas


  public cui: string = '';

  pacienteSeleccionadoId: number | null = null;
  mostrarDetallePaciente = false;

  // iconos (ahora inyectados por servicio)
  constructor(
    private api: ApiService,
    private router: Router,
    private iconService: IconService
  ) {
    this.icons = {
      editPerson: this.iconService.getIcon("editPerson"),
      addExpediente: this.iconService.getIcon("addExpediente"),
      addPerson: this.iconService.getIcon("addPerson"),
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

  ngOnInit(): void {
    // Suscripción pacientes
    this.api.pacientes$.subscribe((data) => {
      this.pacientes = data;
    });

    // Cargar totales
    this.api.getTotales().then((data) => {
      this.totales = data;
      // 👇 si la vista devuelve en orden pacientes, consultas
      this.totalDeRegistros = this.totales.find(t => t.entidad === 'pacientes')?.total || 0;

      // Primera carga de pacientes con paginación
      this.api.getPacientes({ skip: 0, limit: this.pageSize });
    });
  }

  async cargarPacientes() {
    this.cargando = true;
    try {
      this.pacientes = await this.api.getPacientes(this.filtros);


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
    this.filtros = { skip: 0, limit: this.pageSize };
    this.cargarPacientes();
  }

  editarPaciente(pacienteId: number) {
    this.router.navigate(['/pacienteEdit', pacienteId]);
  }

  eliminarPaciente(pacienteId: number) {
    if (confirm('¿Está seguro de que desea eliminar este paciente?')) {
      this.api.deletePaciente(pacienteId);
    }
  }

  agregar() {
    this.router.navigate(['/paciente']);
  }

  agregarConExpediente() {
    this.router.navigate(['/paciente', true]);
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

  optionsTipoConsulta = [
    { nombre: 'Coex', valor: 1 },
    { nombre: 'Emergencia', valor: 2 }, // Cambiado para ser consistente
    { nombre: 'Ingreso', valor: 3 }
  ];


  abrirModalAdmision(id: number) {
    this.pacienteSeleccionado = id;
    this.dialog.nativeElement.showModal();
  }

  admision(opt: number, id: number) {
    if (opt === 1) {
      this.router.navigate(
        ['/admisionPaciente', 'coex', id],
        { queryParams: { esCoex: true } }
      );
    } else if (opt === 3) {
      this.router.navigate(
        ['/admisionPaciente', 'ingreso', id],
        { queryParams: { esIngreso: true } }
      );
    } else if (opt === 2) {
      this.router.navigate(
        ['/admisionPaciente', 'emergencia', id],
        { queryParams: { esEmergencia: true } }
      );
    }

    this.dialog.nativeElement.close();
  }

}
