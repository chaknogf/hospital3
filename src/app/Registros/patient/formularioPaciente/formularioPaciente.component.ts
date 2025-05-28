import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Paciente, Nombres, Extras, Contacto, Referencias, Identificadores, Metadatos } from '../../../interface/interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../service/api.service';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-formularioPaciente',
  templateUrl: './formularioPaciente.component.html',
  styleUrls: ['./formularioPaciente.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class FormularioPacienteComponent implements OnInit {

  public enEdicion: boolean = false;

  nombres: Nombres = {
    primer: '',
    segundo: '',
    otro: '',
    apellido_primero: '',
    apellido_segundo: '',
    casada: ''
  }

  contacto: Contacto[] = [
    { clave: '', valor: '' }
  ];

  referencias: Referencias[] = [
    { nombre: '', telefono: '', parentesco: '' }
  ];

  identificadores: Identificadores[] = [
    { tipo: '', valor: '' }
  ];

  extras: Extras[] = [
    { tipo: '', valor: '' }
  ];

  metadatos: Metadatos[] = [
    { usuario: '', registro: '' }
  ];

  patient: Paciente = {
    id: 0,
    identificadores: this.identificadores,
    nombre: this.nombres, // Notar aquí el cambio: nombre singular y no array
    sexo: '',
    fecha_nacimiento: '',
    contacto: this.contacto,
    referencias: this.referencias,
    datos_extra: this.extras,
    estado: '',
    metadatos: this.metadatos
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService
  ) { }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      if (!isNaN(id)) {
        this.api.getPaciente(id)
          .then((data) => {
            this.patient = {
              ...data,
              nombre: data.nombre ?? this.nombres,
              contacto: data.contacto ?? [],
              referencias: data.referencias ?? [],
              datos_extra: data.datos_extra ?? [],
              metadatos: data.metadatos ?? []
            };
            this.enEdicion = true;
            console.log('👤 Paciente obtenido correctamente');
          })
          .catch((error) => {
            console.error('❌ Error al obtener paciente:', error);
            throw error;
          });
      } else {
        console.error('❌ ID de paciente inválido:', idParam);
      }
    }
  }

  volver() {
    this.router.navigate(['/pacientes']);
  }

  crear(): void {
    this.api.createPaciente(this.patient)
      .then(() => {
        console.log('👤 Paciente creado correctamente');
        this.volver();
      })
      .catch((error) => {
        console.error('❌ Error al crear paciente:', error);
        throw error;
      })
  }


  async actualizar() {
    try {
      await this.api.updatePaciente(this.patient.id, this.patient);
      console.log('👤 Paciente actualizado correctamente');
      this.volver();
    } catch (error) {
      console.error('❌ Error al actualizar paciente:', error);
      throw error;
    }
  }

  guardar() {
    if (this.enEdicion) {
      this.actualizar();
    } else {
      this.crear();
    }
  }





}
