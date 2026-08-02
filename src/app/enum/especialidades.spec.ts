import { Especialidades } from './especialidades';
import { especialidades as DiccEspecialidades } from './diccionarios';

describe('Especialidades enum consistency', () => {
  it('todos los valores en especialidades.ts existen en diccionarios.ts', () => {
    const diccValues = new Set(DiccEspecialidades.map(e => e.value));
    for (const esp of Especialidades) {
      expect(diccValues.has(esp.value)).toBeTrue();
    }
  });

  it('especialidades.ts tiene 9 valores únicos', () => {
    const values = Especialidades.map(e => e.value);
    expect(new Set(values).size).toBe(values.length);
    expect(values.length).toBe(9);
  });

  it('diccionarios.ts especialidades tiene 10 valores únicos (incluye ANES)', () => {
    const values = DiccEspecialidades.map(e => e.value);
    expect(new Set(values).size).toBe(values.length);
    expect(values.length).toBe(10);
  });

  it('ANES existe solo en diccionarios.ts (especialidad de soporte)', () => {
    const diccValues = DiccEspecialidades.map(e => e.value);
    const espValues = Especialidades.map(e => e.value);
    expect(diccValues).toContain('ANES');
    expect(espValues).not.toContain('ANES');
  });

  it('todos los labels en especialidades.ts no son vacíos', () => {
    for (const esp of Especialidades) {
      expect(esp.label.trim()).toBeTruthy();
    }
  });

  it('todos los labels en diccionarios.ts especialidades no son vacíos', () => {
    for (const esp of DiccEspecialidades) {
      expect(esp.label.trim()).toBeTruthy();
    }
  });
});
