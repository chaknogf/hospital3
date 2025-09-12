import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'datosExtra'
})
export class DatosExtraPipe implements PipeTransform {
  transform(valor: any, tipo: string): any {
    if (!valor) return 'No especificado';

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

      case 'idioma':
        const idiomas: { [key: string]: string } = {
          '1': 'Achi',
          '2': 'Akateka',
          '3': 'Awakateka',
          '4': 'Chorti',
          '5': 'Chalchiteka',
          '6': 'Chuj',
          '7': 'Itza',
          '8': 'Ixil',
          '9': 'Jakalteka',
          '10': 'Kaqchikel',
          '11': 'Kiche',
          '12': 'Mam',
          '13': 'Mopan',
          '14': 'Poqomam',
          '15': 'Pocomchi',
          '16': 'Qanjobal',
          '17': 'Qeqchi',
          '18': 'Sakapulteka',
          '19': 'Sipakapensa',
          '20': 'Tektiteka',
          '21': 'Tzutujil',
          '22': 'Uspanteka',
          '23': 'No indica',
          '24': 'Español',
          '25': 'Otro'
        };
        return idiomas[valor] || valor;

      case 'pueblo':
        const pueblos: { [key: string]: string } = {
          '1': 'Ladino',
          '2': 'Maya',
          '3': 'Garífuna',
          '4': 'Xinca',
          '5': 'Otros',
          '6': 'No indica'
        };
        return pueblos[valor] || valor;

      case 'nivel_educativo':
        const niveles: { [key: string]: string } = {
          '1': 'No aplica',
          '2': 'Pre Primaria',
          '3': 'Primaria',
          '4': 'Básicos',
          '5': 'Diversificado',
          '6': 'Universidad',
          '7': 'Ninguno',
          '8': 'Otro',
          '9': 'No indica'
        };
        return niveles[valor] || valor;
      case 'parto':
        const partos: { [key: string]: string } = {
          '1': 'Vaginal',
          '2': 'Cesárea',
          '3': 'No indica'
        };
        return partos[valor] || valor;
      case 'gemelo':
        const gemelos: { [key: string]: string } = {
          '1': 'Sí',
          '2': 'No',
        };
        return gemelos[valor] || valor;


      case 'municipio_nacimiento':
        const municipios: { [key: string]: string } = {
          '001': 'Guatemala'
        };
        return municipios[valor] || valor;

      case 'departamento_nacimiento':
        const departamentos: { [key: string]: string } = {
          '01': 'Guatemala'
        };
        return departamentos[valor] || valor;



      // Puedes agregar más casos según tus catálogos
      default:
        return valor;
    }
  }
}
