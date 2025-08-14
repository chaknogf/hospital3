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
  public filtrar: boolean = false;
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

    this.searchIcon = this.sanitizer.bypassSecurityTrustHtml(searchIcon);
    this.deletInput = this.sanitizer.bypassSecurityTrustHtml(deletInput);
    this.createIcon = this.sanitizer.bypassSecurityTrustHtml(createIcon);
    this.editIcon = this.sanitizer.bypassSecurityTrustHtml(editIcon);
    this.trashIcon = this.sanitizer.bypassSecurityTrustHtml(trashIcon);
    this.tablaShanonIcon = this.sanitizer.bypassSecurityTrustHtml(tablaShanonIcon);
    this.medicalServiceIcon = this.sanitizer.bypassSecurityTrustHtml(medicalServiceIcon);
    this.manIcon = this.sanitizer.bypassSecurityTrustHtml(manIcon);
    this.womanIcon = this.sanitizer.bypassSecurityTrustHtml(womanIcon);
    this.beatIcon = this.sanitizer.bypassSecurityTrustHtml(beatIcon);
    this.ghostIcon = this.sanitizer.bypassSecurityTrustHtml(ghostIcon);
    this.heartIcon = this.sanitizer.bypassSecurityTrustHtml(heartIcon);
    this.huellitaIcon = this.sanitizer.bypassSecurityTrustHtml(huellitaIcon);

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
    console.log('Paciente seleccionado ID:', this.pacienteSeleccionadoId);
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


  // Métodos
  public toggleFiltrar() {
    this.filtrar = !this.filtrar;
  }

}



