import { heartIcon, createIcon, deletInput, searchIcon, editIcon, trashIcon, tablaShanonIcon, medicalServiceIcon, beatIcon, ghostIcon, huellitaIcon, manIcon, womanIcon } from './../../../shared/icons/svg-icon';
import { Component, OnInit, NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../service/api.service';
import { CommonModule } from '@angular/common';
import { Paciente } from '../../../interface/interfaces';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { DetallePacienteComponent } from '../detallePaciente/detallePaciente.component';
import { EdadPipe } from "../../../pipes/edad.pipe";


@Component({
  selector: 'app-pacientes',
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, DetallePacienteComponent, EdadPipe]
})
export class PacientesComponent implements OnInit {

  pacientes: Paciente[] = [];
  public porcentajeDeCarga = 0;
  public totalDeRegistros = 0;
  public buscarIdentificador: string = '';
  public buscarPrimerNombre: string = '';
  public buscarSegundoNombre: string = '';
  public buscarPrimerApellido: string = '';
  public buscarSegundoApellido: string = '';
  public buscarFechaNacimiento: string = '';
  public buscarNombreCompleto: string = '';
  public cargando: boolean = false;
  modalActivo = false;
  private sanitizarSvg(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  //iconos
  searchIcon: SafeHtml = searchIcon;
  deletInput: SafeHtml = deletInput;
  createIcon: SafeHtml = createIcon;
  editIcon: SafeHtml = editIcon;
  trashIcon: SafeHtml = trashIcon;
  tablaShanonIcon: SafeHtml = tablaShanonIcon;
  medicalServiceIcon: SafeHtml = medicalServiceIcon;
  manIcon: SafeHtml = manIcon;
  womanIcon: SafeHtml = womanIcon;
  beatIcon: SafeHtml = beatIcon;
  ghostIcon: SafeHtml = ghostIcon;
  heartIcon: SafeHtml = heartIcon;
  huellitaIcon: SafeHtml = huellitaIcon;



  //variables de detallePaciente Modal
  pacienteSeleccionadoId: number | null = null;
  mostrarDetallePaciente: boolean = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {

    this.searchIcon = this.sanitizarSvg(searchIcon);
    this.deletInput = this.sanitizarSvg(deletInput);
    this.createIcon = this.sanitizarSvg(createIcon);
    this.editIcon = this.sanitizarSvg(editIcon);
    this.trashIcon = this.sanitizarSvg(trashIcon);
    this.tablaShanonIcon = this.sanitizarSvg(tablaShanonIcon);
    this.medicalServiceIcon = this.sanitizarSvg(medicalServiceIcon);
    this.manIcon = this.sanitizarSvg(manIcon);
    this.womanIcon = this.sanitizarSvg(womanIcon);
    this.beatIcon = this.sanitizarSvg(beatIcon);
    this.ghostIcon = this.sanitizarSvg(ghostIcon);
    this.heartIcon = this.sanitizarSvg(heartIcon);
    this.huellitaIcon = this.sanitizarSvg(huellitaIcon);

  }

  ngOnInit() {
    this.ObtenerPacientes();
  }


  async ObtenerPacientes() {
    const filtros = {
      id: '',
      identificador: this.buscarIdentificador,
      primer_nombre: this.buscarPrimerNombre,
      segundo_nombre: this.buscarSegundoNombre,
      primer_apellido: this.buscarPrimerApellido,
      segundo_apellido: this.buscarSegundoApellido,
      nombre_completo: this.buscarNombreCompleto,
      sexo: '',
      fecha_nacimiento: this.buscarFechaNacimiento,
      referencias: '',
      estado: '',
      skip: 0,
      limit: 10
    };

    this.cargando = true;
    try {
      const response = await this.api.getPacientes(filtros);
      this.pacientes = response;
      this.totalDeRegistros = response.length;
    } catch (error) {
      console.error('Error:', error);
    } finally {
      this.cargando = false;
    }
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
  verDetallesPaciente(pacienteId: number): void {
    this.pacienteSeleccionadoId = pacienteId;
    this.mostrarDetallePaciente = true;
    this.modalActivo = true;
  }

  cerrarDetallePaciente(): void {
    this.mostrarDetallePaciente = false;
    this.pacienteSeleccionadoId = null;
    this.modalActivo = false;
  }
  navegarARegistroMedico(pacienteId: number) {
    this.router.navigate(['/registro-medico', pacienteId]);
  }

  limpiarCampos() {
    this.buscarIdentificador = '';
    this.buscarPrimerNombre = '';
    this.buscarPrimerApellido = '';
    this.buscarFechaNacimiento = '';
    this.buscarNombreCompleto = '';
    this.ObtenerPacientes();
  }


  volver() {
    this.router.navigate(['/registros']);
  }




}



