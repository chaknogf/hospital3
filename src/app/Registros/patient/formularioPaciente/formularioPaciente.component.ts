import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Paciente, Nombres, Extras, Contacto, Referencias, Identificadores, Metadatos } from '../../../interface/interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../service/api.service';
import { Meta } from '@angular/platform-browser';
import { DpiValidadorDirective } from '../../../directives/dpi-validador.directive';
import { UnaPalabraDirective } from '../../../directives/unaPalabra.directive';

@Component({
  selector: 'app-formularioPaciente',
  templateUrl: './formularioPaciente.component.html',
  styleUrls: ['./formularioPaciente.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DpiValidadorDirective, UnaPalabraDirective]
})
export class FormularioPacienteComponent implements OnInit {

  public enEdicion: boolean = false;
  public usuarioActual: string = '';
  edadAnios: number = 0;
  edadMeses: number = 0;
  edadDias: number = 0;

  nombres: Nombres = {
    primer: '',
    segundo: '',
    otro: '',
    apellido_primero: '',
    apellido_segundo: '',
    casada: ''
  }

  contacto: Contacto[] = [
    { clave: 'telefono', valor: '' },
    { clave: 'telefono', valor: '' },
    { clave: 'telefono', valor: '' },
    { clave: 'municipio', valor: '' },
    { clave: 'dirección domicilio', valor: '' }
  ];

  referencias: Referencias[] = [
    { nombre: '', telefono: '', parentesco: '' }
  ];

  identificadores: Identificadores[] = [
    {
      tipo: 'CUI',
      valor: ''
    },
    {
      tipo: 'expediente',
      valor: ''
    },
    {
      tipo: 'pasaporte',
      valor: ''
    }
  ];

  extras: Extras[] = [
    { tipo: 'estado civil', valor: '' },
    { tipo: 'pueblo', valor: '' },
    { tipo: 'nacionalidad', valor: '' },
    { tipo: 'idioma', valor: '' },
    { tipo: 'ocupación', valor: '' },
    { tipo: 'nivel educativo', valor: '' }


  ];

  metadatos: Metadatos[] = [
    { usuario: '', registro: '' }
  ];

  patient: Paciente = {
    id: 0,
    identificadores: this.identificadores,
    nombre: this.nombres, // Notar aquí el cambio: nombre singular y no array
    sexo: 'V',
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

    this.usuarioActual = localStorage.getItem('username') || '';

  }

  volver() {
    this.router.navigate(['/pacientes']);
  }

  esTelefono(clave: string): boolean {
    return clave.toLowerCase().includes('telefono');
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
    const nuevoMetadato = {
      usuario: this.usuarioActual, // Puedes obtenerlo del token o sesión
      registro: new Date().toISOString()
    };

    // Aseguramos que el array metadatos existe
    if (!this.patient.metadatos) {
      this.patient.metadatos = [];
    }

    this.patient.metadatos.push(nuevoMetadato);

    if (this.enEdicion) {
      this.actualizar();
    } else {
      this.crear();
    }
  }

  calcularFechaDesdeEdad() {
    const hoy = new Date();
    const fecha = new Date(
      hoy.getFullYear() - (this.edadAnios || 0),
      hoy.getMonth() - (this.edadMeses || 0),
      hoy.getDate() - (this.edadDias || 0)
    );

    this.patient.fecha_nacimiento = fecha.toISOString().substring(0, 10);
  }

  calcularEdadDesdeFecha() {
    if (!this.patient.fecha_nacimiento) return;

    const hoy = new Date();
    const nacimiento = new Date(this.patient.fecha_nacimiento);

    let edadAnios = hoy.getFullYear() - nacimiento.getFullYear();
    let edadMeses = hoy.getMonth() - nacimiento.getMonth();
    let edadDias = hoy.getDate() - nacimiento.getDate();

    if (edadDias < 0) {
      edadMeses--;
      edadDias += new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
    }

    if (edadMeses < 0) {
      edadAnios--;
      edadMeses += 12;
    }

    this.edadAnios = edadAnios;
    this.edadMeses = edadMeses;
    this.edadDias = edadDias;
  }





}
