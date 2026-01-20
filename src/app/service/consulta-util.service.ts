// consulta-util.service.ts
import { Injectable } from '@angular/core';
import {
  ConsultaBase, Ciclo, Datos, Sistema, SignosVitales, Antecedentes,
  Nota, ExamenFisico, Enfermeria, PresaQuirurgica, Egreso,
  ConsultaOut,
  RegistroConsultaCreate,
  Indicador,
  ConsultaUpdate,
  EstadoCiclo,
  CicloPatch
} from '../interface/consultas';

@Injectable({ providedIn: 'root' })
export class ConsultaUtilService {

  constructor() { }

  // 🔹 Normalización completa para backend y formulario
  normalizarConsulta(raw: any): ConsultaOut {
    return {
      id: raw.id,
      expediente: raw.expediente ?? '',
      paciente_id: raw.paciente_id,
      tipo_consulta: raw.tipo_consulta,
      especialidad: raw.especialidad,
      servicio: raw.servicio,
      documento: raw.documento ?? '',
      fecha_consulta: raw.fecha_consulta ?? '',
      hora_consulta: raw.hora_consulta ?? '',
      indicadores: raw.indicadores,
      orden: raw.orden,
      ciclo: this.normalizarCicloArray(raw.ciclo),
      paciente: raw.paciente
    };
  }

  private normalizarCicloArray(raw: any): Ciclo[] {
    if (!raw) return [];

    // Ya viene como array
    if (Array.isArray(raw)) {
      return raw.map(c => this.normalizarCiclo(c));
    }

    // Viene como dict legacy
    if (typeof raw === 'object') {
      return Object.values(raw).map(c => this.normalizarCiclo(c));
    }

    return [];
  }



  normalizarCiclo(raw: any): Ciclo {
    return {
      estado: raw.estado,
      registro: raw.registro,
      usuario: raw.usuario,
      especialidad: raw.especialidad,
      servicio: raw.servicio,
      detalle_clinicos: this.limpiarDict(raw.detalle_clinicos),
      signos_vitales: this.limpiarDict(raw.signos_vitales),
      antecedentes: this.limpiarDict(raw.antecedentes),
      ordenes: this.limpiarDict(raw.ordenes),
      estudios: this.limpiarDict(raw.estudios),
      comentario: raw.comentario,
      impresion_clinica: this.limpiarDict(raw.impresion_clinica),
      tratamiento: this.limpiarDict(raw.tratamiento),
      examen_fisico: this.limpiarDict(raw.examen_fisico),
      nota_enfermeria: this.limpiarDict(raw.nota_enfermeria),
      contraindicado: raw.contraindicado,
      presa_quirurgica: this.limpiarDict(raw.presa_quirurgica),
      egreso: this.limpiarDict(raw.egreso)
    };
  }

  private limpiarDict(value: any): any {
    if (!value || typeof value !== 'object') return undefined;
    return Object.fromEntries(
      Object.entries(value).filter(([k]) => !k.startsWith('additionalProp'))
    );
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

  construirRegistroConsulta(
    paciente_id: number,
    tipo_consulta: number,
    especialidad: string,
    servicio: string,
    indicadores: Indicador,
    usuario: string
  ): RegistroConsultaCreate {
    return {
      paciente_id,
      tipo_consulta,
      especialidad,
      servicio,
      indicadores,
      ciclo: [
        {
          estado: 'iniciado',
          registro: new Date().toISOString(),
          usuario
        }
      ]
    };
  }

  construirPatchCiclo(
    estado: EstadoCiclo,
    datos?: Partial<CicloPatch>
  ): ConsultaUpdate {
    return {
      ciclo: {
        estado,
        ...datos
      }
    };
  }
  construirConsultaPatch(data: Partial<ConsultaUpdate>): ConsultaUpdate {
    const patch: ConsultaUpdate = {};

    if (data.expediente) patch.expediente = data.expediente;
    if (data.tipo_consulta !== undefined) patch.tipo_consulta = data.tipo_consulta;
    if (data.especialidad) patch.especialidad = data.especialidad;
    if (data.servicio) patch.servicio = data.servicio;
    if (data.documento) patch.documento = data.documento;
    if (data.fecha_consulta) patch.fecha_consulta = data.fecha_consulta;
    if (data.hora_consulta) patch.hora_consulta = data.hora_consulta;
    if (data.indicadores) patch.indicadores = data.indicadores;
    if (data.orden !== undefined) patch.orden = data.orden;

    if (data.ciclo) {
      patch.ciclo = this.normalizarCiclo(data.ciclo);
    }

    return patch;
  }
}
