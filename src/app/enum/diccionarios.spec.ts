import {
  especialidades, tipoConsulta, estadoCivil, idiomas, pueblos,
  partos, parentescos, gradoAcademicos, servicios,
  especialidadesProcedimientos, especialidadesConsulta,
} from './diccionarios';

describe('diccionarios consistency', () => {
  function assertUniqueValues(items: { value: any; label: string }[], name: string) {
    it(`${name}: valores únicos`, () => {
      const values = items.map(e => String(e.value));
      expect(new Set(values).size).toBe(values.length);
    });
    it(`${name}: labels no vacíos`, () => {
      for (const item of items) {
        expect(item.label.trim()).toBeTruthy();
      }
    });
  }

  assertUniqueValues(especialidades, 'especialidades');
  assertUniqueValues(especialidadesProcedimientos, 'especialidadesProcedimientos');
  assertUniqueValues(especialidadesConsulta, 'especialidadesConsulta');
  assertUniqueValues(tipoConsulta, 'tipoConsulta');
  assertUniqueValues(estadoCivil, 'estadoCivil');
  assertUniqueValues(idiomas, 'idiomas');
  assertUniqueValues(pueblos, 'pueblos');
  assertUniqueValues(partos, 'partos');
  assertUniqueValues(parentescos, 'parentescos');
  assertUniqueValues(gradoAcademicos, 'gradoAcademicos');
  assertUniqueValues(servicios, 'servicios');

  it('tipoConsulta valores son 1,2,3,4,99', () => {
    const values = tipoConsulta.map(e => e.value).sort();
    expect(values).toEqual([1, 2, 3, 4, 99]);
  });

  it('estadoCivil valores son 1,2,3,4', () => {
    const values = estadoCivil.map(e => e.value).sort();
    expect(values).toEqual([1, 2, 3, 4]);
  });

  it('partos valores son PES y CSTP', () => {
    const values = partos.map(e => e.value).sort();
    expect(values).toEqual(['CSTP', 'PES']);
  });

  it('gradoAcademicos valores excluyen 1 y 8', () => {
    const values = gradoAcademicos.map(e => e.value);
    expect(values).not.toContain(1);
    expect(values).not.toContain(8);
    expect(values).toContain(9);
  });

  it('especialidades tienen ref definida', () => {
    for (const esp of especialidades) {
      expect(esp.ref).toBeDefined();
      expect(['all', 'coex', 'sop', 'admision'].includes(esp.ref!)).toBeTrue();
    }
  });

  it('especialidades value coincide con especialidadesProcedimientos en valores compartidos', () => {
    const esp = new Set(especialidades.map(e => e.value));
    const proc = new Set(especialidadesProcedimientos.map(e => e.value));
    for (const v of esp) {
      if (v !== 'ANES' && v !== 'PSIC' && v !== 'NUTR') {
        expect(proc.has(v)).toBeTrue();
      }
    }
  });
});
