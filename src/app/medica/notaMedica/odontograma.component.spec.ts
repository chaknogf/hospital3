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

  it('sincroniza la dentición cuando cambia la entrada (precarga del último odontograma)', () => {
    const component = crear();
    expect(component.denticion).toBe('permanente');
    component.value = { denticion: 'temporal', dientes: {} };
    component.ngOnChanges({ value: { currentValue: component.value } } as any);
    expect(component.denticion).toBe('temporal');
  });

  it('aplica el código clínico: letra de referencia por superficie y símbolo por pieza', () => {
    const component = crear();
    component.value = {
      denticion: 'permanente',
      dientes: {
        '16': { superficies: { oclusal: 'caries' } },
        '26': { estado: 'corona' },
        '36': { estado: 'ausente' },
      },
    };
    expect(component.textoSuperficie(16, { key: 'oclusal', short: 'O' })).toBe('C');
    expect(component.textoSuperficie(16, { key: 'vestibular', short: 'V' })).toBe('V');
    expect(component.esSimboloPieza(16)).toBeFalse();
    expect(component.esSimboloPieza(26)).toBeTrue();
    expect(component.letraPieza(26)).toBe('CR');
    expect(component.letraPieza(36)).toBe('A');
  });
});
