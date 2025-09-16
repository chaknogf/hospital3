// paciente-util.service.ts
import { Injectable } from '@angular/core';
import { Paciente, Metadata } from '../interface/interfaces';

@Injectable({ providedIn: 'root' })
export class PacienteUtilService {

  constructor() { }

  // 🔹 Normalización completa para backend y formulario
  normalizarPaciente(raw: any): Paciente {
    // Adaptar referencias: si viene como objeto {r0, r1...} → convertir en array
    let referencias: any;
    if (raw.referencias) {
      if (Array.isArray(raw.referencias)) {
        referencias = raw.referencias;
      } else {
        referencias = Object.values(raw.referencias); // 👈 convierte {r0:{},r1:{}} → [{},{}]
      }
    } else {
      referencias = [
        { nombre: '', telefono: '', parentesco: '' }
      ];
    }

    // metadatos → array
    const metadatos: Metadata[] = raw.metadatos
      ? Array.isArray(raw.metadatos)
        ? raw.metadatos
        : Object.values(raw.metadatos)
      : [];

    return {
      id: raw.id ?? 0,
      unidad: raw.unidad ?? 287,
      cui: raw.cui ?? '',
      expediente: raw.expediente ?? '',
      pasaporte: raw.pasaporte ?? '',
      otro: raw.otro_id ?? '',
      nombre: {
        primer_nombre: raw.nombre?.primer_nombre ?? '',
        segundo_nombre: raw.nombre?.segundo_nombre ?? '',
        otro_nombre: raw.nombre?.otro_nombre ?? '',
        primer_apellido: raw.nombre?.primer_apellido ?? '',
        segundo_apellido: raw.nombre?.segundo_apellido ?? '',
        apellido_casada: raw.nombre?.apellido_casada ?? '',
      },
      sexo: raw.sexo ?? '',
      fecha_nacimiento: raw.fecha_nacimiento ?? '',
      contacto: raw.contacto ?? {
        telefono: '', telefono2: '', telefono3: '',
        direccion: '', localidad: '', departamento: '', municipio: ''
      },
      referencias, // 👈 ya normalizado como array
      datos_extra: raw.datos_extra ?? {},
      estado: raw.estado ?? 'V',
      metadatos: raw.metadatos ?? {},
    };
  }

  // 🔹 Calcular edad desde fecha
  calcularEdad(fechaStr: string): { anios: number, meses: number, dias: number } {
    if (!fechaStr) return { anios: 0, meses: 0, dias: 0 };
    const hoy = new Date();
    const nacimiento = new Date(fechaStr);
    let anios = hoy.getFullYear() - nacimiento.getFullYear();
    let meses = hoy.getMonth() - nacimiento.getMonth();
    let dias = hoy.getDate() - nacimiento.getDate();

    if (dias < 0) {
      meses--;
      dias += new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
    }
    if (meses < 0) {
      anios--;
      meses += 12;
    }
    return { anios, meses, dias };
  }

  validarRecienNacido(fechaStr: string): { recienNacido: boolean } {
    if (!fechaStr) return { recienNacido: false };
    const nacimiento = new Date(fechaStr);
    if (isNaN(nacimiento.getTime())) return { recienNacido: false };

    const hoy = new Date();
    let anios = hoy.getFullYear() - nacimiento.getFullYear();
    let meses = hoy.getMonth() - nacimiento.getMonth();
    let dias = hoy.getDate() - nacimiento.getDate();

    if (dias < 0) {
      meses--;
      dias += new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
    }
    if (meses < 0) {
      anios--;
      meses += 12;
    }

    const recienNacido = anios === 0 && meses === 0 && dias >= 0 && dias <= 28;
    return { recienNacido };
  }

  calcularFechaDesdeEdad(edad: { anios: number, meses: number, dias: number }): string {
    const hoy = new Date();
    const fecha = new Date(
      hoy.getFullYear() - (edad.anios || 0),
      hoy.getMonth() - (edad.meses || 0),
      hoy.getDate() - (edad.dias || 0)
    );
    return fecha.toISOString().substring(0, 10);
  }

  agregarMetadato(metadatos: any, usuario: string): any {
    const timestamp = new Date().toISOString();
    const total = Object.keys(metadatos).length;
    metadatos[`r${total}`] = { usuario, registro: timestamp };
    return metadatos;
  }
}
