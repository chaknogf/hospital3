// departamento.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { municipios } from '../enum/departamentos';

const DEPARTAMENTOS: Record<string, string> = {
  '01': 'Guatemala',
  '02': 'El Progreso',
  '03': 'Sacatepéquez',
  '04': 'Chimaltenango',
  '05': 'Escuintla',
  '06': 'Santa Rosa',
  '07': 'Sololá',
  '08': 'Totonicapán',
  '09': 'Quetzaltenango',
  '10': 'Suchitepéquez',
  '11': 'Retalhuleu',
  '12': 'San Marcos',
  '13': 'Huehuetenango',
  '14': 'Quiché',
  '15': 'Baja Verapaz',
  '16': 'Alta Verapaz',
  '17': 'Petén',
  '18': 'Izabal',
  '19': 'Zacapa',
  '20': 'Chiquimula',
  '21': 'Jalapa',
  '22': 'Jutiapa',
};

@Pipe({
  name: 'departamento',
  standalone: true,
})
export class DepartamentoPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';

    // Toma los primeros 2 caracteres como código de depto
    const codigo = String(value).trim().slice(0, 2);

    return DEPARTAMENTOS[codigo] ?? '';
  }
}

@Pipe({

  name: 'vecindad',
  standalone: true

})

export class VecindadPipe implements PipeTransform {

  transform(codigo: string | null | undefined): string {

    if (!codigo) return '';

    const match = municipios.find(m => m.codigo === codigo);

    return match ? match.vecindad : codigo; // fallback elegante

  }

}
