import { Pipe, PipeTransform } from '@angular/core';
import { departamentos, municipios } from '../enum/departamentos';
import { idiomas, servicios } from '../enum/diccionarios';
import { partos, gradoAcademicos, pueblos, parentescos, especialidades, tipoConsulta } from '../enum/diccionarios';
@Pipe({
  name: 'datosExtra'
})
export class DatosExtraPipe implements PipeTransform {
  transform(valor: any, tipo: any): any {
    if (valor === null || valor === undefined || valor === '') {
      return 'No especificado';
    }

    // 🔹 Convertir todo a string
    valor = valor.toString();

    switch (tipo) {
      case 'estado_civil':
        const estados: { [key: string]: string } = {
          '1': 'Casado',
          '2': 'Unido',
          '3': 'Soltero',
          '4': 'Viudo',

        };
        return estados[valor] || 'Desconocido';

      case 'nacionalidad':
        const nacionalidades: { [key: string]: string } = {
          'GTM': 'Guatemalteco/a',
          'MEX': 'Mexicano/a',
          'USA': 'Estadounidense',
          'CAN': 'Canadiense',
          'COL': 'Colombiano/a',
          'SLV': 'Salvadoreño/a',
          'HND': 'Hondureño/a',
          'NIC': 'Nicaragüense',
          'CRI': 'Costarricense',
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
          'URY': 'Uruguayo/a',
          // Agrega más códigos y sus descripciones según sea necesario
        };
        return nacionalidades[valor] || valor;

      case 'idioma': {
        const idioma = idiomas.find(i => i.value === valor);
        return idioma ? idioma.label : valor;
      }

      case 'pueblo': {
        const pue = pueblos.find(p => p.value === valor);
        return pue ? pue.label : valor;
      }

      case 'educacion': {
        const nivel = gradoAcademicos.find(n => n.value === valor);
        return nivel ? nivel.label : valor;
      }

      case 'parto': {
        const parto = partos.find(p => p.value === valor);
        return parto ? parto.label : valor;
      }

      case 'municipio_nacimiento': {
        const muni = municipios.find(m => m.codigo === valor);
        return muni ? muni.vecindad : valor;
      }

      case 'departamento_nacimiento': {
        const depto = departamentos.find(d => d.value === valor);
        return depto ? depto.label : valor;
      }

      case 'vecindad': {
        const muni = municipios.find(m => m.codigo === valor);
        return muni ? muni.vecindad : valor;
      }

      case 'parentesco': {
        const parentesco = parentescos.find(p => p.value === valor);
        return parentesco ? parentesco.label : valor;
      }

      case 'estudiante_publico':
        {
          if (valor === 'S') {
            return 'Si';
          } else {
            return 'No';
          }
        }

      case 'empleado_publico':
        {
          if (valor === 'S') {
            return 'Si';
          } else {
            return 'No';
          }
        }

      case 'discapacitado':
        {
          if (valor === 'S') {
            return 'Si';
          } else {
            return 'No';
          }
        }
      case 'sexo':
        {
          if (valor === 'M') {
            return 'Masculino';
          } else {
            return 'Femenino';
          }
        }
      case 'especialidad': {
        const especialidad = especialidades.find(e => e.value === valor);
        return especialidad ? especialidad.label : valor;
      }

      case 'servicio': {
        const servicio = servicios.find(s => s.value === valor);
        return servicio ? servicio.label : valor;
      }
      case 'tipo_consulta': {
        const consulta = tipoConsulta.find(c => c.value == valor);
        return consulta ? consulta.label : valor;
      }


      // Puedes agregar más casos según tus catálogos
      default:
        return valor;
    }
  }
}
