import { Injectable } from '@angular/core';
import { Paciente, Metadata } from '../interface/interfaces';

@Injectable({ providedIn: 'root' })
export class PacienteUtilService {

  constructor() { }

  // 🔹 Normalización completa para backend
  // paciente-util.service.ts
  normalizarPaciente(raw: any): Paciente {
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
      referencias: raw.referencias ?? {
        r0: { nombre: '', telefono: '', parentesco: '' }
      },
      datos_extra: {
        r0: { tipo: 'nacionalidad', valor: raw.nacionalidad ?? '' },
        r1: { tipo: 'estado_civil', valor: raw.estado_civil ?? '' },
        r2: { tipo: 'pueblo', valor: raw.pueblo ?? '' },
        r3: { tipo: 'idioma', valor: raw.idioma ?? '' },
        r4: { tipo: 'ocupacion', valor: raw.ocupacion ?? '' },
        r5: { tipo: 'nivel_educativo', valor: raw.nivel_educativo ?? '' },
        r6: { tipo: 'peso_nacimiento', valor: raw.peso_nacimiento ?? '3.0' },
        r7: { tipo: 'edad_gestacional', valor: raw.edad_gestacional ?? '40' },
        r8: { tipo: 'parto', valor: raw.parto ?? '0' },
        r9: { tipo: 'gemelo', valor: raw.gemelo ?? '1' },
        r10: { tipo: 'expediente_madre', valor: raw.expediente_madre ?? '' },
        r11: { tipo: 'municipio_nacimiento', valor: raw.municipio_nacimiento ?? '' },
        r12: { tipo: 'departamento_nacimiento', valor: raw.departamento_nacimiento ?? '' },
      },
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

  // 🔹 Calcular fecha desde edad
  calcularFechaDesdeEdad(edad: { anios: number, meses: number, dias: number }): string {
    const hoy = new Date();
    const fecha = new Date(
      hoy.getFullYear() - (edad.anios || 0),
      hoy.getMonth() - (edad.meses || 0),
      hoy.getDate() - (edad.dias || 0)
    );
    return fecha.toISOString().substring(0, 10);
  }

  // 🔹 Normalizar datos_extra antes de enviar
  normalizarDatosExtra(datosExtra: any): any {
    return Object.entries(datosExtra || {}).reduce((acc, [key, valor]: any) => {
      acc[key] = {
        tipo: valor.tipo || '',
        valor: valor.valor || (valor.tipo === 'gemelo' ? 'n' : '0')
      };
      return acc;
    }, {} as any);
  }

  // 🔹 Agregar metadato
  agregarMetadato(metadatos: any, usuario: string): any {
    const timestamp = new Date().toISOString();
    const total = Object.keys(metadatos).length;
    metadatos[`r${total}`] = { usuario, registro: timestamp };
    return metadatos;
  }

}
