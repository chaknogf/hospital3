import { Injectable } from '@angular/core';
import { Paciente, DatosExtra, Demograficos, Socioeconomicos, Neonatales, Contacto } from '../interface/interfaces';

@Injectable({ providedIn: 'root' })
export class PacienteUtilService {

  constructor() { }

  // ========== CONVERSIÓN BACKEND ↔ FORMULARIO (MÉTODOS PÚBLICOS) ==========

  /**
   * Convierte el paciente del BACKEND al formato del FORMULARIO
   */
  convertirPacienteDesdeBackend(paciente: any): any {
    return {
      ...paciente,
      contacto: this.convertirContactoDesdeBackend(paciente.contacto),
      datos_extra: this.convertirDatosExtraDesdeBackend(paciente.datos_extra)
    };
  }

  /**
   * Convierte el paciente del FORMULARIO al formato del BACKEND
   */
  convertirPacienteParaBackend(paciente: any): any {
    return {
      ...paciente,
      contacto: this.convertirContactoParaBackend(paciente.contacto),
      referencias: this.convertirReferenciasParaBackend(paciente.referencias),
      datos_extra: this.convertirDatosExtraParaBackend(paciente.datos_extra)
    };
  }

  // ========== CONVERSIÓN CONTACTO ==========

  /**
   * Convierte contacto del BACKEND al FORMULARIO
   */
  private convertirContactoDesdeBackend(contacto: Contacto | undefined): any {
    if (!contacto) {
      return this.crearContactoFormVacio();
    }

    return {
      domicilio: contacto.domicilio || '',
      municipio: contacto.municipio || '',
      telefonos: contacto.telefonos || '',
      email: contacto.email || ''
    };
  }

  /**
   * Convierte contacto del FORMULARIO al BACKEND
   */
  private convertirContactoParaBackend(contacto: any): Contacto {
    return {
      domicilio: contacto?.domicilio || null,
      municipio: contacto?.municipio || null,
      telefonos: this.limpiarTelefono(contacto?.telefonos) || null,
      email: contacto?.email || null
    };
  }

  /**
   * Crea un objeto contacto vacío para formulario
   */
  private crearContactoFormVacio(): any {
    return {
      domicilio: '',
      municipio: '',
      telefonos: '',
      email: ''
    };
  }

  // ========== HELPERS CONTACTO (PÚBLICOS) ==========

  /**
   * Limpia y normaliza un número de teléfono (solo dígitos)
   */
  limpiarTelefono(telefono: string | undefined): string | null {
    if (!telefono) return null;
    const limpio = telefono.replace(/[^\d]/g, '');
    return limpio.length > 0 ? limpio : null;
  }

  /**
   * Extrae un teléfono específico de una cadena separada por comas
   */
  extraerTelefono(telefonos: string | null | undefined, index: number): string {
    if (!telefonos) return '';
    const lista = telefonos.split(',').map(t => t.trim());
    return lista[index] || '';
  }

  // ========== CONVERSIÓN REFERENCIAS ==========

  /**
   * Convierte referencias para enviar al backend
   */
  convertirReferenciasParaBackend(referencias: unknown): any[] | null {
    if (!Array.isArray(referencias)) return null;

    const resultado = referencias
      .filter(ref => typeof ref === 'object' && ref !== null)
      .filter((ref: any) => ref.nombre && ref.nombre.trim())
      .map((ref: any) => ({
        nombre: ref.nombre.trim(),
        parentesco: ref.parentesco || null,
        telefono: this.limpiarTelefono(ref.telefono), // ✅ CORRECTO
        expediente: ref.expediente || null,
        idpersona: ref.idpersona || null,
        responsable: ref.responsable === true
      }));

    return resultado.length ? resultado : null;
  }

  convertirReferenciasDesdeBackend(referencias: any): any[] {
    if (!Array.isArray(referencias)) return [];

    return referencias.map(ref => ({
      nombre: ref.nombre || '',
      parentesco: ref.parentesco || '',
      telefonos: ref.telefono || '', // ✅ AQUÍ
      expediente: ref.expediente || null,
      idpersona: ref.idpersona || null,
      responsable: ref.responsable === true
    }));
  }

  // ========== CONVERSIÓN DATOS EXTRA ==========

  /**
   * Convierte datos_extra del BACKEND al FORMULARIO
   */
  convertirDatosExtraDesdeBackend(datosExtra: DatosExtra | undefined): any {
    if (!datosExtra) {
      return this.crearDatosExtraFormularioVacio();
    }

    return this.convertirDatosExtraBackendAFormulario(datosExtra);
  }

  /**
   * Convierte datos_extra del FORMULARIO al BACKEND
   */
  convertirDatosExtraParaBackend(datosExtra: any): DatosExtra {
    if (!datosExtra) {
      return this.crearDatosExtraBackendVacio();
    }

    const demo: any = datosExtra.demograficos || {};
    const socio: any = datosExtra.socioeconomicos || {};
    const neo: any = datosExtra.neonatales || {};

    return {
      defuncion: datosExtra.defuncion || null,
      personaid: datosExtra.personaid || null,
      demograficos: {
        idioma: demo.idioma ? Number(demo.idioma) : null,
        pueblo: demo.pueblo ? Number(demo.pueblo) : null,
        nacionalidad: demo.nacionalidad || 'GTM',
        lugar_nacimiento: demo.lugar_nacimiento || null,
        vecindad: demo.vecindad || null
      },
      socioeconomicos: {
        estado_civil: socio.estado_civil ? Number(socio.estado_civil) : null,
        ocupacion: socio.ocupacion || null,
        educacion: socio.educacion ? Number(socio.educacion) : null,
        estudiante_publico: socio.estudiante_publico === 'SI' ? 'S' : 'N',
        empleado_publico: socio.empleado_publico === 'SI' ? 'S' : 'N',
        discapacidad: socio.discapacidad === 'SI' ? 'S' : 'N'
      },
      neonatales: {
        peso_nacimiento: neo.peso_nacimiento || null,
        edad_gestacional: neo.edad_gestacional || null,
        parto: neo.parto || null,
        gemelo: neo.gemelo || null,
        expediente_madre: neo.expediente_madre || null
      }
    };
  }

  /**
   * Convierte estructura de BACKEND a estructura de FORMULARIO
   */
  private convertirDatosExtraBackendAFormulario(datosExtra: DatosExtra): any {
    const demo: Demograficos = datosExtra.demograficos || {};
    const socio: Socioeconomicos = datosExtra.socioeconomicos || {};
    const neo: Neonatales = datosExtra.neonatales || {};

    return {
      defuncion: datosExtra.defuncion || '',
      personaid: datosExtra.personaid || '',
      demograficos: {
        idioma: demo.idioma ? String(demo.idioma) : '24',
        pueblo: demo.pueblo ? String(demo.pueblo) : '',
        nacionalidad: demo.nacionalidad || 'GTM',
        departamento_nacimiento: '',
        lugar_nacimiento: demo.lugar_nacimiento || '',
        vecindad: demo.vecindad || ''
      },
      socioeconomicos: {
        estado_civil: socio.estado_civil ? String(socio.estado_civil) : '',
        ocupacion: socio.ocupacion || '',
        educacion: socio.educacion ? String(socio.educacion) : '',
        estudiante_publico: socio.estudiante_publico === 'S' ? 'SI' : 'NO',
        empleado_publico: socio.empleado_publico === 'S' ? 'SI' : 'NO',
        discapacidad: socio.discapacidad === 'S' ? 'SI' : 'NO'
      },
      neonatales: {
        peso_nacimiento: neo.peso_nacimiento || '',
        edad_gestacional: neo.edad_gestacional || '',
        parto: neo.parto || '',
        gemelo: neo.gemelo || '',
        expediente_madre: neo.expediente_madre || ''
      }
    };
  }

  /**
   * Crea un objeto datos_extra vacío para formulario
   */
  private crearDatosExtraFormularioVacio(): any {
    return {
      defuncion: '',
      personaid: '',
      demograficos: {
        idioma: '24',
        pueblo: '',
        nacionalidad: 'GTM',
        departamento_nacimiento: '',
        lugar_nacimiento: '',
        vecindad: ''
      },
      socioeconomicos: {
        estado_civil: '',
        ocupacion: '',
        educacion: '',
        estudiante_publico: 'NO',
        empleado_publico: 'NO',
        discapacidad: 'NO'
      },
      neonatales: {
        peso_nacimiento: '',
        edad_gestacional: '',
        parto: '',
        gemelo: '',
        expediente_madre: ''
      }
    };
  }

  /**
   * Crea un objeto datos_extra vacío para backend
   */
  private crearDatosExtraBackendVacio(): DatosExtra {
    return {
      defuncion: null,
      personaid: null,
      demograficos: {
        idioma: null,
        pueblo: null,
        nacionalidad: 'GTM',
        lugar_nacimiento: null,
        vecindad: null
      },
      socioeconomicos: {
        estado_civil: null,
        ocupacion: null,
        educacion: null,
        estudiante_publico: 'N',
        empleado_publico: 'N',
        discapacidad: 'N'
      },
      neonatales: {
        peso_nacimiento: null,
        edad_gestacional: null,
        parto: null,
        gemelo: null,
        expediente_madre: null
      }
    };
  }

  // ========== MÉTODOS DE UTILIDAD (PÚBLICOS) ==========

  /**
   * Crea un paciente vacío con estructura completa
   */
  crearPacienteVacio(): Paciente {
    return {
      id: 0,
      cui: null,
      expediente: null,
      pasaporte: null,
      nombre: {
        primer_nombre: '',
        segundo_nombre: '',
        otro_nombre: '',
        primer_apellido: '',
        segundo_apellido: '',
        apellido_casada: ''
      },
      sexo: 'O',
      fecha_nacimiento: null,
      contacto: this.crearContactoFormVacio(),
      referencias: [],
      datos_extra: this.crearDatosExtraFormularioVacio(),
      estado: 'V',

    };
  }

  /**
   * Normalización completa del paciente desde cualquier fuente
   */
  normalizarPaciente(raw: any): Paciente {
    if (!raw) return this.crearPacienteVacio();

    let referencias: any[] = [];

    if (raw.referencias) {
      if (Array.isArray(raw.referencias)) {
        referencias = raw.referencias;
      } else {
        referencias = Object.values(raw.referencias).filter((ref: any) => ref?.nombre);
      }
    }

    return {
      id: raw.id ?? 0,
      cui: raw.cui ?? null,
      expediente: raw.expediente ?? null,
      pasaporte: raw.pasaporte ?? null,
      nombre: {
        primer_nombre: raw.nombre?.primer_nombre ?? '',
        segundo_nombre: raw.nombre?.segundo_nombre ?? null,
        otro_nombre: raw.nombre?.otro_nombre ?? null,
        primer_apellido: raw.nombre?.primer_apellido ?? '',
        segundo_apellido: raw.nombre?.segundo_apellido ?? null,
        apellido_casada: raw.nombre?.apellido_casada ?? null
      },
      sexo: raw.sexo ?? null,
      fecha_nacimiento: raw.fecha_nacimiento ?? null,
      contacto: this.convertirContactoDesdeBackend(raw.contacto),
      referencias,
      datos_extra: this.convertirDatosExtraDesdeBackend(raw.datos_extra),
      estado: raw.estado ?? 'V',

    };
  }

  /**
   * Obtiene el nombre completo del paciente
   */
  obtenerNombreCompleto(nombre: any): string {
    const partes = [
      nombre?.primer_nombre,
      nombre?.segundo_nombre,
      nombre?.otro_nombre,
      nombre?.primer_apellido,
      nombre?.segundo_apellido
    ].filter(p => p && p.trim());

    return partes.join(' ').trim();
  }

  /**
   * Calcula edad desde fecha de nacimiento
   */
  calcularEdad(fechaStr: string): { anios: number, meses: number, dias: number } {
    if (!fechaStr) return { anios: 0, meses: 0, dias: 0 };

    const hoy = new Date();
    const nacimiento = new Date(fechaStr);

    if (isNaN(nacimiento.getTime())) {
      return { anios: 0, meses: 0, dias: 0 };
    }

    let anios = hoy.getFullYear() - nacimiento.getFullYear();
    let meses = hoy.getMonth() - nacimiento.getMonth();
    let dias = hoy.getDate() - nacimiento.getDate();

    if (dias < 0) {
      meses--;
      const ultimoDiaDelMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
      dias += ultimoDiaDelMesAnterior;
    }

    if (meses < 0) {
      anios--;
      meses += 12;
    }

    return { anios, meses, dias };
  }

  /**
   * Valida si es recién nacido (menor de 28 días)
   */
  esRecienNacido(fechaStr: string): boolean {
    if (!fechaStr) return false;

    const nacimiento = new Date(fechaStr);
    if (isNaN(nacimiento.getTime())) return false;

    const edad = this.calcularEdad(fechaStr);
    return edad.anios === 0 && edad.meses === 0 && edad.dias >= 0 && edad.dias <= 28;
  }

  /**
   * Calcula la fecha de nacimiento desde edad (años, meses, días)
   */
  calcularFechaDesdeEdad(edad: { anios: number, meses: number, dias: number }): string {
    const hoy = new Date();
    const fecha = new Date(
      hoy.getFullYear() - (edad.anios || 0),
      hoy.getMonth() - (edad.meses || 0),
      hoy.getDate() - (edad.dias || 0)
    );
    return fecha.toISOString().substring(0, 10);
  }

  /**
   * Valida si es recién nacido (menor de 28 días)
   */
  validarRecienNacido(fechaStr: string): { recienNacido: boolean } {
    if (!fechaStr) return { recienNacido: false };

    const nacimiento = new Date(fechaStr);
    if (isNaN(nacimiento.getTime())) return { recienNacido: false };

    const edad = this.calcularEdad(fechaStr);
    const recienNacido = edad.anios === 0 && edad.meses === 0 && edad.dias >= 0 && edad.dias <= 28;

    return { recienNacido };
  }

  /**
   * Valida si un paciente tiene datos mínimos para ser guardado
   */
  validarPacienteMinimo(paciente: any): { valido: boolean, errores: string[] } {
    const errores: string[] = [];

    if (!paciente.nombre?.primer_nombre?.trim()) {
      errores.push('El primer nombre es obligatorio');
    }

    if (!paciente.nombre?.primer_apellido?.trim()) {
      errores.push('El primer apellido es obligatorio');
    }

    if (!paciente.fecha_nacimiento) {
      errores.push('La fecha de nacimiento es obligatoria');
    }

    if (!paciente.sexo) {
      errores.push('El sexo es obligatorio');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }
}
