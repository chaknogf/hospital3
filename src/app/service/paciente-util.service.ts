import { Injectable } from '@angular/core';
import { Paciente, Metadata, DatosExtra, Demograficos, Socioeconomicos, Neonatales, Contacto } from '../interface/interfaces';

@Injectable({ providedIn: 'root' })
export class PacienteUtilService {

  constructor() { }

  // ========== CONVERSIÓN BACKEND ↔ FORMULARIO (MÉTODOS PÚBLICOS) ==========

  /**
   * Convierte el paciente del BACKEND al formato del FORMULARIO
   * Backend: { contacto: { telefonos: "123, 456, 789", municipio: "0801", domicilio: "" } }
   * Formulario: { contacto: { telefono: "123", telefono2: "456", telefono3: "789", ... } }
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
   * Formulario: { contacto: { telefono: "123", telefono2: "456", ... } }
   * Backend: { contacto: { telefonos: "123, 456, 789", municipio: "0801", domicilio: "" } }
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
      telefono: this.extraerTelefono(contacto.telefonos, 0),
      telefono2: this.extraerTelefono(contacto.telefonos, 1),
      telefono3: this.extraerTelefono(contacto.telefonos, 2),
      departamento: contacto.municipio?.slice(0, 2) || '',
      municipio: contacto.municipio || '',
      localidad: contacto.domicilio || '',
      vecindad: contacto.vecindad || '',
      direccion: ''
    };
  }

  /**
   * Convierte contacto del FORMULARIO al BACKEND
   */
  private convertirContactoParaBackend(contacto: any): Contacto {
    return {
      domicilio: contacto?.localidad || null,
      vecindad: contacto?.vecindad || null,
      municipio: contacto?.municipio || null,
      telefonos: this.combinarTelefonos(contacto)
    };
  }

  /**
   * Crea un objeto contacto vacío para formulario
   */
  private crearContactoFormVacio(): any {
    return {
      telefono: '',
      telefono2: '',
      telefono3: '',
      departamento: '',
      municipio: '',
      localidad: '',
      vecindad: '',
      direccion: ''
    };
  }

  // ========== HELPERS CONTACTO (PÚBLICOS) ==========

  /**
   * Combina los 3 teléfonos en una cadena separada por comas
   */
  combinarTelefonos(contacto: any): string | null {
    const telefonos = [
      contacto?.telefono,
      contacto?.telefono2,
      contacto?.telefono3
    ].filter(t => t && t.trim());

    return telefonos.length > 0 ? telefonos.join(', ') : null;
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
   * Convierte referencias para enviar al backend (array simple)
   */
  convertirReferenciasParaBackend(referencias: any): any[] | null {
    if (!referencias) return null;

    if (Array.isArray(referencias)) {
      return referencias
        .filter(ref => ref?.nombre && ref?.nombre.trim())
        .map(ref => ({
          nombre: ref.nombre.trim(),
          parentesco: ref.parentesco || null,
          telefono: ref.telefono || null,
          expediente: ref.expediente || null,
          idpersona: ref.idpersona || null,
          responsable: ref.responsable === true
        }));
    }

    return null;
  }

  // ========== CONVERSIÓN DATOS EXTRA ==========

  /**
   * Convierte datos_extra del BACKEND (demograficos/socioeconomicos/neonatales) al FORMULARIO
   */
  convertirDatosExtraDesdeBackend(datosExtra: DatosExtra | undefined): any {
    if (!datosExtra) {
      return this.crearDatosExtraFormularioVacio();
    }

    // Si tiene estructura de backend (con _id), convertir a estructura de formulario
    if (datosExtra.demograficos && datosExtra.socioeconomicos) {
      return this.convertirDatosExtraEstructuradoAFormulario(datosExtra);
    }

    return this.crearDatosExtraFormularioVacio();
  }

  /**
   * Convierte datos_extra del FORMULARIO al formato del BACKEND
   */
  convertirDatosExtraParaBackend(datosExtra: any): DatosExtra {
    if (!datosExtra) {
      return this.crearDatosExtraBackendVacio();
    }

    // Si ya tiene estructura de backend, retornarla
    if (datosExtra.demograficos && datosExtra.demograficos.idioma_id !== undefined) {
      return {
        defuncion: datosExtra.defuncion || null,
        cuipersona: datosExtra.cuipersona || null,
        demograficos: datosExtra.demograficos as Demograficos,
        socioeconomicos: datosExtra.socioeconomicos as Socioeconomicos,
        neonatales: datosExtra.neonatales as Neonatales
      };
    }

    // Convertir desde estructura de formulario
    return {
      defuncion: datosExtra.defuncion || null,
      cuipersona: datosExtra.cuipersona || null,
      demograficos: {
        idioma: datosExtra.demograficos?.idioma ? Number(datosExtra.demograficos.idioma) : null,
        pueblo: datosExtra.demograficos?.pueblo ? Number(datosExtra.demograficos.pueblo) : null,
        nacionalidad: datosExtra.demograficos?.nacionalidad || 'GTM',
        lugar_nacimiento: datosExtra.demograficos?.lugar_nacimiento || null,
        departamento_nacimiento: datosExtra.demograficos?.departamento_nacimiento ? Number(datosExtra.demograficos.departamento_nacimiento) : null
      },
      socioeconomicos: {
        estado_civil: datosExtra.demograficos?.estado_civil ? Number(datosExtra.demograficos.estado_civil) : null,
        ocupacion: datosExtra.socioeconomicos?.ocupacion || null,
        educacion: datosExtra.socioeconomicos?.nivel_educativo ? Number(datosExtra.socioeconomicos.nivel_educativo) : null,
        estudiante_publico: datosExtra.socioeconomicos?.estudiante_publico === 'SI' ? 'S' : 'N',
        empleado_publico: datosExtra.socioeconomicos?.empleado_publico === 'SI' ? 'S' : 'N',
        discapacidad: datosExtra.socioeconomicos?.discapacidad === 'SI' ? 'S' : 'N'
      },
      neonatales: {
        peso_nacimiento: datosExtra.neonatales?.peso_nacimiento || null,
        edad_gestacional: datosExtra.neonatales?.edad_gestacional || null,
        parto: datosExtra.neonatales?.parto || null,
        gemelo: datosExtra.neonatales?.gemelo || null,
        expediente_madre: datosExtra.neonatales?.expediente_madre || null
      }
    };
  }

  /**
   * Convierte estructura de backend a estructura de formulario
   * @private
   */
  private convertirDatosExtraEstructuradoAFormulario(datosExtra: DatosExtra): any {
    const demo = datosExtra.demograficos || {};
    const socio = datosExtra.socioeconomicos || {};
    const neo = datosExtra.neonatales || {};

    return {
      defuncion: datosExtra.defuncion || '',
      cuipersona: datosExtra.cuipersona || '',
      demograficos: {
        nacionalidad: demo.nacionalidad || 'GTM',
        pueblo: demo.pueblo?.toString() || '',
        idioma: demo.idioma?.toString() || '24',
        lugar_nacimiento: demo.lugar_nacimiento || '',
        departamento_nacimiento: demo.departamento_nacimiento?.toString() || '',
        municipio_nacimiento: ''
      },
      socioeconomicos: {
        estado_civil: socio.estado_civil?.toString() || '',
        ocupacion: socio.ocupacion || '',
        nivel_educativo: socio.educacion?.toString() || '',
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
   * @private
   */
  private crearDatosExtraFormularioVacio(): any {
    return {
      defuncion: '',
      cuipersona: '',
      demograficos: {
        nacionalidad: 'GTM',

        pueblo: '',
        idioma: '24',
        lugar_nacimiento: '',
        departamento_nacimiento: '',
        municipio_nacimiento: ''
      },
      socioeconomicos: {
        estado_civil: '',
        ocupacion: '',
        nivel_educativo: '',
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
   * @private
   */
  private crearDatosExtraBackendVacio(): DatosExtra {
    return {
      defuncion: null,
      cuipersona: null,
      demograficos: {
        nacionalidad: 'GTM',

        pueblo: null,
        idioma: 24,
        lugar_nacimiento: null,
        departamento_nacimiento: null
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
   * Normalización completa para backend y formulario
   * @deprecated Usar convertirPacienteDesdeBackend() o convertirPacienteParaBackend()
   */
  normalizarPaciente(raw: any): Paciente {
    let referencias: any = [];

    if (raw.referencias) {
      if (Array.isArray(raw.referencias)) {
        referencias = raw.referencias;
      } else {
        referencias = Object.values(raw.referencias).filter((ref: any) => ref?.nombre);
      }
    }

    if (referencias.length === 0) {
      referencias = [{ nombre: '', telefono: '', parentesco: '' }];
    }

    const metadatos = raw.metadatos || {};

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
        apellido_casada: raw.nombre?.apellido_casada ?? null,
      },
      sexo: raw.sexo ?? '',
      fecha_nacimiento: raw.fecha_nacimiento ?? '',
      contacto: raw.contacto ?? this.crearContactoFormVacio(),
      referencias,
      datos_extra: raw.datos_extra ?? {},
      estado: raw.estado ?? 'V',
      metadatos,
    };
  }

  /**
   * Calcular edad desde fecha de nacimiento
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
  validarRecienNacido(fechaStr: string): { recienNacido: boolean } {
    if (!fechaStr) return { recienNacido: false };

    const nacimiento = new Date(fechaStr);
    if (isNaN(nacimiento.getTime())) return { recienNacido: false };

    const edad = this.calcularEdad(fechaStr);
    const recienNacido = edad.anios === 0 && edad.meses === 0 && edad.dias >= 0 && edad.dias <= 28;

    return { recienNacido };
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
   * Agrega un metadato de registro
   */
  agregarMetadato(metadatos: any, usuario: string): Metadata {
    const timestamp = new Date().toISOString();

    if (!metadatos) metadatos = {};

    return {
      ...metadatos,
      creado_por: usuario || 'Sistema',
      creado_en: timestamp
    };
  }
}
