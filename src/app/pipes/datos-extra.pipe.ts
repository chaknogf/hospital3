import { Pipe, PipeTransform } from '@angular/core';
import { departamentos, municipios } from '../enum/departamentos';
import { idiomas, servicios } from '../enum/diccionarios';
import { partos, gradoAcademicos, pueblos, parentescos, especialidades, tipoConsulta } from '../enum/diccionarios';

@Pipe({
  name: 'datosExtra',
  standalone: true
})
export class DatosExtraPipe implements PipeTransform {
  transform(valor: any, tipo: any): any {
    // Manejar valores vacíos o nulos
    if (valor === null || valor === undefined || valor === '' || valor === 0) {
      return 'No especificado';
    }

    // Convertir a string para comparaciones
    const valorStr = valor.toString();

    switch (tipo) {
      case 'estado_civil':
      case 'estado_civil_id': {
        const estados: { [key: string]: string } = {
          '1': 'Casado/a',
          '2': 'Unido/a',
          '3': 'Soltero/a',
          '4': 'Viudo/a',
          '5': 'Divorciado/a'
        };
        return estados[valorStr] || 'Desconocido';
      }

      case 'nacionalidad':
      case 'nacionalidad_id': {
        const nacionalidades: { [key: string]: string } = {
          '1': 'Guatemalteco/a',
          'GTM': 'Guatemalteco/a',
          '2': 'Mexicano/a',
          'MEX': 'Mexicano/a',
          '3': 'Estadounidense',
          'USA': 'Estadounidense',
          '4': 'Salvadoreño/a',
          'SLV': 'Salvadoreño/a',
          '5': 'Hondureño/a',
          'HND': 'Hondureño/a',
          '6': 'Nicaragüense',
          'NIC': 'Nicaragüense',
          '7': 'Costarricense',
          'CRI': 'Costarricense',
          'CAN': 'Canadiense',
          'COL': 'Colombiano/a',
          'PAN': 'Panameño/a',
          'CUB': 'Cubano/a',
          'DOM': 'Dominicano/a',
          'ARG': 'Argentino/a',
          'CHL': 'Chileno/a',
          'PER': 'Peruano/a',
          'VEN': 'Venezolano/a',
          'ECU': 'Ecuatoriano/a',
          'BOL': 'Boliviano/a',
          'PRY': 'Paraguayo/a',
          'URY': 'Uruguayo/a'
        };
        return nacionalidades[valorStr] || valorStr;
      }

      case 'idioma':
      case 'idioma_id': {
        const idioma = idiomas.find(i => i.value == valor);
        return idioma ? idioma.label : valorStr;
      }

      case 'pueblo':
      case 'pueblo_id': {
        const pue = pueblos.find(p => p.value == valor);
        return pue ? pue.label : valorStr;
      }

      case 'educacion':
      case 'educacion_id':
      case 'nivel_educativo': {
        const nivel = gradoAcademicos.find(n => n.value == valor);
        return nivel ? nivel.label : valorStr;
      }

      case 'parto': {
        const parto = partos.find(p => p.value == valor);
        return parto ? parto.label : valorStr;
      }

      case 'lugar_nacimiento':
      case 'lugar_nacimiento_id':
      case 'municipio_nacimiento': {
        const muni = municipios.find(m => m.codigo === valorStr);
        return muni ? muni.vecindad : valorStr;
      }

      case 'departamento_nacimiento':
      case 'departamento_nacimiento_id': {
        const depto = departamentos.find(d => d.value == valor);
        return depto ? depto.label : valorStr;
      }

      case 'municipio':
      case 'vecindad': {
        const muni = municipios.find(m => m.codigo === valorStr);
        return muni ? muni.vecindad : valorStr;
      }

      case 'parentesco': {
        const parentesco = parentescos.find(p => p.value == valor);
        return parentesco ? parentesco.label : valorStr;
      }

      case 'estudiante_publico': {
        return valorStr === 'S' || valorStr === '1' || valorStr === 'true' ? 'Sí' : 'No';
      }

      case 'empleado_publico': {
        return valorStr === 'S' || valorStr === '1' || valorStr === 'true' ? 'Sí' : 'No';
      }

      case 'discapacitado': {
        return valorStr === 'S' || valorStr === '1' || valorStr === 'true' ? 'Sí' : 'No';
      }

      case 'sexo': {
        const sexoUpper = valorStr.trim().toUpperCase();
        return sexoUpper === 'M' ? 'Masculino' : sexoUpper === 'F' ? 'Femenino' : valorStr;
      }

      case 'especialidad': {
        const especialidad = especialidades.find(e => e.value == valor);
        return especialidad ? especialidad.label : valorStr;
      }

      case 'servicio': {
        const servicio = servicios.find(s => s.value == valor);
        return servicio ? servicio.label : valorStr;
      }

      case 'tipo_consulta': {
        const consulta = tipoConsulta.find(c => c.value == valor);
        return consulta ? consulta.label : valorStr;
      }

      case 'ocupacion': {
        // Si es solo un string, devolverlo capitalizado
        return valorStr.charAt(0).toUpperCase() + valorStr.slice(1).toLowerCase();
      }

      // Para cualquier otro tipo, devolver el valor tal cual
      default:
        return valorStr;
    }
  }
}
