import { createIcon, deletInput, searchIcon, editIcon, trashIcon, tablaShanonIcon, medicalServiceIcon } from './../../../shared/icons/svg-icon';
import { Component, OnInit, NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../service/api.service';
import { CommonModule } from '@angular/common';
import { Paciente } from '../../../interface/interfaces';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pacientes',
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PacientesComponent implements OnInit {

  pacientes: Paciente[] = [];
  public porcentajeDeCarga = 0;
  public totalDeRegistros = 0;
  public buscarIdentificador: string = '';
  public buscarNombre: string = '';
  public buscarSegundoNombre: string = '';
  public buscarApellido: string = '';
  public buscarSegundoApellido: string = '';
  public buscarFechaNacimiento: string = '';
  public buscarNombreCompleto: string = '';

  searchIcon: SafeHtml = searchIcon;
  deletInput: SafeHtml = deletInput;
  createIcon: SafeHtml = createIcon;
  editIcon: SafeHtml = editIcon;
  trashIcon: SafeHtml = trashIcon;
  tablaShanonIcon: SafeHtml = tablaShanonIcon;
  medicalServiceIcon: SafeHtml = medicalServiceIcon;

  constructor(
    private api: ApiService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {

    this.searchIcon = this.sanitizer.bypassSecurityTrustHtml(searchIcon);
    this.deletInput = this.sanitizer.bypassSecurityTrustHtml(deletInput);
    this.createIcon = this.sanitizer.bypassSecurityTrustHtml(createIcon);
    this.editIcon = this.sanitizer.bypassSecurityTrustHtml(editIcon);
    this.trashIcon = this.sanitizer.bypassSecurityTrustHtml(trashIcon);
    this.tablaShanonIcon = this.sanitizer.bypassSecurityTrustHtml(tablaShanonIcon);
    this.medicalServiceIcon = this.sanitizer.bypassSecurityTrustHtml(medicalServiceIcon);
  }

  ngOnInit() {
    this.ObtenerPacientes();
  }


  async ObtenerPacientes() {
    const filtros = {
      id: '',
      identificadores: this.buscarIdentificador,
      primer_nombre: this.buscarNombre,
      segundo_nombre: this.buscarSegundoNombre,
      primer_apellido: this.buscarApellido,
      segundo_apellido: this.buscarSegundoApellido,
      nombre_completo: this.buscarNombreCompleto,
      sexo: '',
      fecha_nacimiento: this.buscarFechaNacimiento,
      referencias: '',
      estado: '',
      skip: 0,
      limit: 10
    };
    try {
      this.porcentajeDeCarga = 0.1;
      const response = await this.api.getPacientes(filtros);
      this.pacientes = response;
      console.table(this.pacientes);
      this.porcentajeDeCarga = 0.5;
      this.totalDeRegistros = this.pacientes.length;
      if (this.totalDeRegistros > 0) {
        this.porcentajeDeCarga = 1;
      }
    } catch (error) {
      console.error('Error al obtener los pacientes:', error);
      this.porcentajeDeCarga = 0;
    }
  }

  editarPaciente(pacienteId: number) {
    this.router.navigate(['/paciente', pacienteId]);
  }

  eliminarPaciente(pacienteId: number) {
    if (confirm('¿Está seguro de que desea eliminar este paciente?')) {
      // llamada a la API para eliminarlo
    }
  }
  agregar() {
    this.router.navigate(['/paciente']);
  }
  verDetallesPaciente(pacienteId: number) {
    this.router.navigate(['/detalles-paciente', pacienteId]);
  }
  navegarARegistroMedico(pacienteId: number) {
    this.router.navigate(['/registro-medico', pacienteId]);
  }

  limpiarCampos() {
    this.buscarIdentificador = '';
    this.buscarNombre = '';
    this.buscarApellido = '';
    this.buscarFechaNacimiento = '';
    this.buscarNombreCompleto = '';
    this.ObtenerPacientes();
  }





}



