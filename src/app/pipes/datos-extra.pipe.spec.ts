import { DatosExtraPipe } from './datos-extra.pipe';
import { partos } from '../enum/diccionarios';

describe('DatosExtraPipe', () => {
  let pipe: DatosExtraPipe;

  beforeEach(() => {
    pipe = new DatosExtraPipe();
  });

  describe('especialidad', () => {
    const cases: [string, string][] = [
      ['MEDI', 'Medicina Interna'],
      ['PEDI', 'Pediatria'],
      ['GINE', 'Ginecologia'],
      ['CIRU', 'Cirugia'],
      ['TRAU', 'Traumatologia'],
      ['PSIC', 'Psicología'],
      ['NUTR', 'Nutricion'],
      ['ODON', 'Odontología'],
      ['ANES', 'Anestesia'],
      ['GENE', 'General'],
    ];
    for (const [value, expected] of cases) {
      it(`transforma "${value}" → "${expected}"`, () => {
        expect(pipe.transform(value, 'especialidad')).toBe(expected);
      });
    }
    it('retorna el valor crudo si no encuentra match', () => {
      expect(pipe.transform('XXXX', 'especialidad')).toBe('XXXX');
    });
    it('retorna "-" para null/undefined/vacío', () => {
      expect(pipe.transform(null, 'especialidad')).toBe('-');
      expect(pipe.transform(undefined, 'especialidad')).toBe('-');
      expect(pipe.transform('', 'especialidad')).toBe('-');
    });
  });

  describe('tipo_consulta', () => {
    const cases: [number | string, string][] = [
      [1, 'COEX'],
      [2, 'Hospitalización'],
      [3, 'Emergencia'],
      [4, 'Interconsulta'],
      [99, 'Otro'],
    ];
    for (const [value, expected] of cases) {
      it(`transforma "${value}" → "${expected}"`, () => {
        expect(pipe.transform(value, 'tipo_consulta')).toBe(expected);
      });
    }
  });

  describe('estado_civil', () => {
    const cases: [number | string, string][] = [
      [1, 'Casado/a'],
      [2, 'Unido/a'],
      [3, 'Soltero/a'],
      [4, 'Viudo/a'],
      [5, 'Divorciado/a'],
    ];
    for (const [value, expected] of cases) {
      it(`transforma "${value}" → "${expected}"`, () => {
        expect(pipe.transform(value, 'estado_civil')).toBe(expected);
      });
    }
  });

  describe('sexo', () => {
    it('transforma M → Masculino', () => {
      expect(pipe.transform('M', 'sexo')).toBe('Masculino');
    });
    it('transforma F → Femenino', () => {
      expect(pipe.transform('F', 'sexo')).toBe('Femenino');
    });
    it('retorna valor crudo para otros', () => {
      expect(pipe.transform('X', 'sexo')).toBe('X');
    });
  });

  describe('vivo', () => {
    it('transforma V → Vivo', () => {
      expect(pipe.transform('V', 'vivo')).toBe('Vivo');
    });
    it('transforma F → Fallecido', () => {
      expect(pipe.transform('F', 'vivo')).toBe('Fallecido');
    });
  });

  describe('educacion', () => {
    const cases: [number, string][] = [
      [2, 'Pre Primaria'],
      [3, 'Primaria'],
      [4, 'Básicos'],
      [5, 'Diversificado'],
      [6, 'Universidad'],
      [7, 'Ninguno'],
      [9, 'No indica'],
    ];
    for (const [value, expected] of cases) {
      it(`transforma "${value}" → "${expected}"`, () => {
        expect(pipe.transform(value, 'educacion')).toBe(expected);
      });
    }
  });

  describe('pueblo', () => {
    const cases: [number, string][] = [
      [1, 'Ladino'],
      [2, 'Maya'],
      [3, 'Garífuna'],
      [4, 'Xinca'],
      [5, 'Otros'],
      [6, 'No indica'],
    ];
    for (const [value, expected] of cases) {
      it(`transforma "${value}" → "${expected}"`, () => {
        expect(pipe.transform(value, 'pueblo')).toBe(expected);
      });
    }
  });

  describe('parto', () => {
    it('transforma PES → Parto Vaginal', () => {
      expect(pipe.transform('PES', 'parto')).toBe('Parto Vaginal');
    });
    it('transforma CSTP → label del diccionario', () => {
      const esperado = partos.find(p => p.value === 'CSTP')?.label;
      expect(pipe.transform('CSTP', 'parto')).toBe(esperado);
    });
  });

  describe('parentesco', () => {
    it('transforma 1 → Madre', () => expect(pipe.transform(1, 'parentesco')).toBe('Madre'));
    it('transforma 2 → Padre', () => expect(pipe.transform(2, 'parentesco')).toBe('Padre'));
    it('transforma 3 → Hijo/a', () => expect(pipe.transform(3, 'parentesco')).toBe('Hijo/a'));
    it('transforma 10 → Esposo/a', () => expect(pipe.transform(10, 'parentesco')).toBe('Esposo/a'));
  });

  describe('estudiante_publico / empleado_publico / discapacitado', () => {
    for (const tipo of ['estudiante_publico', 'empleado_publico', 'discapacitado']) {
      it(`${tipo}: S → Sí`, () => expect(pipe.transform('S', tipo)).toBe('Sí'));
      it(`${tipo}: N → No`, () => expect(pipe.transform('N', tipo)).toBe('No'));
    }
  });

  describe('clasiparto', () => {
    it('PN → Peso Normal', () => expect(pipe.transform('PN', 'clasiparto')).toBe('Peso Normal'));
    it('BP → Bajo peso', () => expect(pipe.transform('BP', 'clasiparto')).toBe('Bajo peso'));
    it('MBP → Muy Bajo Peso', () => expect(pipe.transform('MBP', 'clasiparto')).toBe('Muy Bajo Peso'));
    it('EBP → Extremo Bajo Peso', () => expect(pipe.transform('EBP', 'clasiparto')).toBe('Extremo Bajo Peso'));
  });
});
