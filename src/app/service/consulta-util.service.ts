// consulta-util.service.ts
import { Injectable } from '@angular/core';
import {
  ConsultaBase, Ciclo, Datos, Sistema, SignosVitales, Antecedentes,
  Nota, ExamenFisico, Enfermeria, PresaQuirurgica, Egreso,
  ConsultaOut
} from '../interface/consultas';

@Injectable({ providedIn: 'root' })
export class ConsultaUtilService {

  constructor() { }

  // 🔹 Normalización completa para backend y formulario
  normalizarConsulta(raw: any): ConsultaOut {
    return {
      id: raw.id ?? 0,
      expediente: raw.expediente ?? '',
      paciente_id: raw.paciente_id ?? 0,
      tipo_consulta: raw.tipo_consulta ?? null,
      especialidad: raw.especialidad ?? null,
      servicio: raw.servicio ?? null,
      documento: raw.documento ?? '',
      fecha_consulta: raw.fecha_consulta ?? '',
      hora_consulta: raw.hora_consulta ?? '',
      indicadores: raw.indicadores ?? {
        estudiante_publico: false,
        empleado_publico: false,
        accidente_laboral: false,
        discapacidad: false,
        accidente_transito: false,
        arma_fuego: false,
        arma_blanca: false,
        embarazo: false,
        ambulancia: false
      },
      ciclo: this.limpiarCiclos(raw.ciclo ?? {})
    };

  }

  // 🔹 Limpieza de ciclos (quita `additionalPropX`)
  private limpiarCiclos(ciclos: any): { [key: string]: Ciclo } {
    const limpio: { [key: string]: Ciclo } = {};
    if (!ciclos || typeof ciclos !== 'object') return limpio;

    Object.entries(ciclos).forEach(([key, value]) => {
      if (value && typeof value === 'object') {
        limpio[key] = this.normalizarCiclo(value);
      }
    });

    return limpio;
  }

  normalizarCiclo(raw: any): Ciclo {
    return {
      estado: raw.estado ?? '',
      registro: raw.registro ?? '',
      usuario: raw.usuario ?? '',
      especialidad: raw.especialidad ?? '',
      servicio: raw.servicio ?? '',
      detalle_clinico: raw.detalle_clinico ?? {},
      sistema: raw.sistema ?? {},
      signos_vitales: raw.signos_vitales ?? {},
      antecedentes: raw.antecedentes ?? {},
      ordenes: raw.ordenes ?? {},
      estudios: raw.estudios ?? {},
      comentario: raw.comentario ?? {},
      impresion_clinica: raw.impresion_clinica ?? {},
      tratamiento: raw.tratamiento ?? {},
      examen_fisico: raw.examen_fisico ?? {},
      nota_enfermeria: raw.nota_enfermeria ?? {},
      contraindicado: raw.contraindicado ?? '',
      presa_quirurgica: raw.presa_quirurgica ?? {},
      egreso: raw.egreso ?? {},
    };
  }

  // 🔹 Calcular edad desde fecha
  calcularEdad(fechaStr?: string): { anios: number, meses: number, dias: number } {
    if (!fechaStr) return { anios: 0, meses: 0, dias: 0 };

    const hoy = new Date();
    const nacimiento = new Date(fechaStr);

    let anios = hoy.getFullYear() - nacimiento.getFullYear();
    let meses = hoy.getMonth() - nacimiento.getMonth();
    let dias = hoy.getDate() - nacimiento.getDate();

    if (dias < 0) {
      meses--;
      const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
      dias += ultimoDiaMesAnterior;
    }

    if (meses < 0) {
      anios--;
      meses += 12;
    }

    return { anios, meses, dias };
  }

  validarRecienNacido(fechaStr: any): { recienNacido: boolean } {
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

  agregarSistema(sistema: any, usuario: string): any {
    if (!sistema || typeof sistema !== 'object') {
      sistema = {};
    }

    const timestamp = new Date().toISOString();
    const total = Object.keys(sistema).length;

    sistema[`r${total}`] = { usuario, fecha: timestamp };

    return sistema;
  }
}
