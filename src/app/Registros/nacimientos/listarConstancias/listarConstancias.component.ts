import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ConstanciaNacimientoOut } from '../../../interface/consNac';
import { ApiService } from './../../../service/api.service';
import { Router } from '@angular/router';
import { IconService } from './../../../service/icon.service';

@Component({
  selector: 'app-listarConstancias',
  templateUrl: './listarConstancias.component.html',
  styleUrls: ['./listarConstancias.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ListarConstanciasComponent implements OnInit {

  datos: ConstanciaNacimientoOut[] = [];
  cargando = false;
  filtrar = false;
  visible = false;
  modalActivo = false;
  error: string | null = null;
  pageSize: number = 8;
  paginaActual: number = 1;
  finPagina: boolean = false;

  filtros: any = {
    id_usuario: '',
    id_constancia: '',
    nombre_madre: '',
    fecha: '',
    documento: '',
    limit: this.pageSize,
    offser: 0
  }

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
      edit: this.iconService.getIcon("editIcon"),
      trash: this.iconService.getIcon("trashIcon"),
      find: this.iconService.getIcon("findIcon"),
      menu: this.iconService.getIcon("menuPuntos"),
      arrowDown: this.iconService.getIcon("arrowDown"),
      skipLeft: this.iconService.getIcon("skipLeft"),
      skipRight: this.iconService.getIcon("skipRight"),
      print: this.iconService.getIcon("printIcon"),
    };
  }

  ngOnInit() {
    this.api.constanciasNac$.subscribe((data) => {
      this.datos = data;
    });

  }

  async cargarDatos() {
    this.cargando = true;
    try {
      this.api.getConstanciasNacimiento(this.filtros).subscribe((data) => {
        this.datos = data;
      });
    } catch (error) {
      this.error = 'Error al cargar los datos';
    } finally {
      this.cargando = false;
    }
  }

  toggleFiltrar() {
    this.filtrar = !this.filtrar;
  }

  buscar() {
    this.filtros = {
      nombre_madre: this.filtros.nombre_madre,
      fecha: this.filtros.fecha,
      documento: this.filtros.documento,
    }
  }

  limpiarFiltros() {
    this.filtros = {
      id_usuario: '',
      id_constancia: '',
      nombre_madre: '',
      fecha: '',
      documento: '',
      limit: this.pageSize,
      offser: 0
    };
    this.cargarDatos();
  }

  editar(id: number) {
    this.router.navigate(['/consnacEdit', id, 'nacimiento']);
  }

  pacientes() {
    this.router.navigate(['/pacientes']);
  }

}
