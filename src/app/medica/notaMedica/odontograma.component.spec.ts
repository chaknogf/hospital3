import { OdontogramaComponent } from './odontograma.component';
import { Odontograma } from './odontograma.model';

describe('OdontogramaComponent', () => {
  const crear = () => {
    const component = new OdontogramaComponent();
    component.value = { denticion: 'permanente', dientes: {} };
    return component;
  };

  it('usa numeración FDI para las cuatro arcadas permanentes y temporales', () => {
    const component = crear();
    expect(component.dientesDelCuadrante(component.cuadrantes[0])).toEqual([18, 17, 16, 15, 14, 13, 12, 11]);
    expect(component.dientesDelCuadrante(component.cuadrantes[3])).toEqual([31, 32, 33, 34, 35, 36, 37, 38]);
    component.cambiarDenticion('temporal');
    expect(component.dientesDelCuadrante(component.cuadrantes[0])).toEqual([55, 54, 53, 52, 51]);
  });

  it('registra y elimina hallazgos por superficie y por pieza completa', () => {
    const component = crear();
    let resultado: Odontograma | undefined;
    component.valueChange.subscribe(value => {
      resultado = value;
      component.value = value;
    });

    component.marcarSuperficie(26, 'oclusal');
    expect(resultado?.dientes[26]?.superficies?.oclusal).toBe('caries');
    component.hallazgoActivo = 'ausente';
    component.marcarPieza(26);
    expect(resultado?.dientes[26]?.estado).toBe('ausente');
    component.hallazgoActivo = 'sano';
    component.marcarPieza(26);
    expect(resultado?.dientes[26]).toBeUndefined();
  });
});
