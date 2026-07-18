import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CnAcimientoInformeComponent, CnacimientoOut, MedicoInfo } from './cnacimiento-informe.component';
import { IconService } from '../../../service/icon.service';
import { SafeHtml } from '@angular/platform-browser';

const mockLogo = '<svg>mock-logo</svg>' as unknown as SafeHtml;

class MockIconService {
  getIcon(_name: string): SafeHtml {
    return mockLogo;
  }
}

function makeConstancia(overrides: Partial<CnacimientoOut> = {}): CnacimientoOut {
  return {
    id: 1,
    documento: 'CN-000001',
    fecha_registro: '2026-07-15',
    hijos: 2,
    vivos: 1,
    muertos: 1,
    observaciones: null,
    paciente: null,
    madre: null,
    medico: null,
    ...overrides,
  };
}

function makeMadre(overrides: Record<string, any> = {}) {
  return {
    nombre: {
      primer_nombre: 'María',
      segundo_nombre: null,
      otro_nombre: null,
      primer_apellido: 'López',
      segundo_apellido: 'Pérez',
      apellido_casada: null,
    },
    fecha_nacimiento: '1990-05-10',
    cui: '1234567890123',
    pasaporte: null,
    datos_extra: {
      demograficos: {
        vecindad: 'Tecpán',
        lugar_nacimiento: 'Chimaltenango',
        nacionalidad: 'GTM',
      },
    },
    ...overrides,
  };
}

function makePaciente(overrides: Record<string, any> = {}) {
  return {
    nombre: {
      primer_nombre: 'Juan',
      segundo_nombre: null,
      otro_nombre: null,
      primer_apellido: 'López',
      segundo_apellido: null,
      apellido_casada: null,
    },
    sexo: 'M',
    fecha_nacimiento: '2026-07-15',
    datos_extra: {
      neonatales: {
        peso_nacimiento: '112',
        hora_nacimiento: '08:30',
        tipo_parto: 'Vaginal',
        clase_parto: 'Pes',
        edad_gestacional: '39',
      },
    },
    ...overrides,
  };
}

describe('CnAcimientoInformeComponent', () => {
  let component: CnAcimientoInformeComponent;
  let fixture: ComponentFixture<CnAcimientoInformeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CnAcimientoInformeComponent],
      providers: [{ provide: IconService, useClass: MockIconService }],
    }).compileComponents();

    fixture = TestBed.createComponent(CnAcimientoInformeComponent);
    component = fixture.componentInstance;
  });

  describe('logo', () => {
    it('should load logo from IconService', () => {
      expect(component.logo).toBe(mockLogo);
    });
  });

  describe('fechaEmision', () => {
    it('should format fecha_registro as full date', () => {
      component.constancia = makeConstancia({ fecha_registro: '2026-07-15' });
      expect(component.fechaEmision).toContain('julio');
      expect(component.fechaEmision).toContain('2026');
      expect(component.fechaEmision).toContain('15');
    });

    it('should return empty string when no fecha_registro', () => {
      component.constancia = makeConstancia({ fecha_registro: null });
      expect(component.fechaEmision).toBe('');
    });

    it('should return empty string for invalid date', () => {
      component.constancia = makeConstancia({ fecha_registro: 'not-a-date' });
      expect(component.fechaEmision).toBe('');
    });
  });

  describe('fechaNacimiento', () => {
    it('should format paciente fecha_nacimiento', () => {
      component.constancia = makeConstancia({ paciente: makePaciente({ fecha_nacimiento: '2026-07-15' }) as any });
      expect(component.fechaNacimiento).toContain('julio');
      expect(component.fechaNacimiento).toContain('2026');
    });

    it('should return empty string when no fecha_nacimiento', () => {
      component.constancia = makeConstancia({ paciente: makePaciente({ fecha_nacimiento: null }) as any });
      expect(component.fechaNacimiento).toBe('');
    });
  });

  describe('horaNacimiento', () => {
    it('should return hora from neonatales', () => {
      component.constancia = makeConstancia({ paciente: makePaciente() as any });
      expect(component.horaNacimiento).toBe('08:30');
    });

    it('should return — when no hora', () => {
      component.constancia = makeConstancia();
      expect(component.horaNacimiento).toBe('—');
    });
  });

  describe('sexoNeonato', () => {
    it('should return Masculino for M', () => {
      component.constancia = makeConstancia({ paciente: makePaciente({ sexo: 'M' }) as any });
      expect(component.sexoNeonato).toBe('Masculino');
    });

    it('should return Femenino for F', () => {
      component.constancia = makeConstancia({ paciente: makePaciente({ sexo: 'F' }) as any });
      expect(component.sexoNeonato).toBe('Femenino');
    });

    it('should return — for unknown sex', () => {
      component.constancia = makeConstancia({ paciente: makePaciente({ sexo: null }) as any });
      expect(component.sexoNeonato).toBe('—');
    });
  });

  describe('pesoNacer', () => {
    it('should convert ounces to lbs/oz', () => {
      component.constancia = makeConstancia({ paciente: makePaciente({ datos_extra: { neonatales: { peso_nacimiento: '112' } } }) as any });
      expect(component.pesoNacer).toBe('7 lb 0 oz');
    });

    it('should show only oz when less than 16', () => {
      component.constancia = makeConstancia({ paciente: makePaciente({ datos_extra: { neonatales: { peso_nacimiento: '10' } } }) as any });
      expect(component.pesoNacer).toBe('10 oz');
    });

    it('should return — when no peso', () => {
      component.constancia = makeConstancia({ paciente: makePaciente({ datos_extra: { neonatales: { peso_nacimiento: null } } }) as any });
      expect(component.pesoNacer).toBe('—');
    });
  });

  describe('tipoParto', () => {
    it('should return tipo_parto value', () => {
      component.constancia = makeConstancia({ paciente: makePaciente() as any });
      expect(component.tipoParto).toBe('Vaginal');
    });

    it('should return — when null', () => {
      component.constancia = makeConstancia({ paciente: makePaciente({ datos_extra: { neonatales: { tipo_parto: null } } }) as any });
      expect(component.tipoParto).toBe('—');
    });
  });

  describe('clasePartoTexto', () => {
    it('should map Pes to Eutócico', () => {
      component.constancia = makeConstancia({ paciente: makePaciente({ datos_extra: { neonatales: { clase_parto: 'Pes' } } }) as any });
      expect(component.clasePartoTexto).toContain('Eutócico');
    });

    it('should map Cstp to Distócico', () => {
      component.constancia = makeConstancia({ paciente: makePaciente({ datos_extra: { neonatales: { clase_parto: 'Cstp' } } }) as any });
      expect(component.clasePartoTexto).toContain('Distócico');
    });

    it('should return raw value for unknown class', () => {
      component.constancia = makeConstancia({ paciente: makePaciente({ datos_extra: { neonatales: { clase_parto: 'Otro' } } }) as any });
      expect(component.clasePartoTexto).toBe('Otro');
    });
  });

  describe('edadMadre', () => {
    it('should calculate age from fecha_nacimiento', () => {
      const nac = new Date();
      const birthDate = new Date(nac.getFullYear() - 30, nac.getMonth(), nac.getDate());
      const iso = birthDate.toISOString().split('T')[0];
      component.constancia = makeConstancia({ madre: makeMadre({ fecha_nacimiento: iso }) as any });
      expect(component.edadMadre).toBe(30);
    });

    it('should return — when no fecha_nacimiento', () => {
      component.constancia = makeConstancia({ madre: makeMadre({ fecha_nacimiento: null }) as any });
      expect(component.edadMadre).toBe('—');
    });
  });

  describe('documentoIdentificacionMadre', () => {
    it('should return Certificado de Nacimiento for minor (< 18)', () => {
      const nac = new Date();
      const birthDate = new Date(nac.getFullYear() - 16, nac.getMonth(), nac.getDate());
      const iso = birthDate.toISOString().split('T')[0];
      component.constancia = makeConstancia({ madre: makeMadre({ fecha_nacimiento: iso, cui: '1234567890123' }) as any });
      expect(component.documentoIdentificacionMadre).toBe('Certificado de Nacimiento - CUI');
    });

    it('should return DPI - CUI for adult with CUI', () => {
      component.constancia = makeConstancia({ madre: makeMadre() as any });
      expect(component.documentoIdentificacionMadre).toBe('DPI - CUI');
    });

    it('should return Pasaporte for adult without CUI but with pasaporte', () => {
      component.constancia = makeConstancia({ madre: makeMadre({ cui: null, pasaporte: 'AB123456' }) as any });
      expect(component.documentoIdentificacionMadre).toBe('Pasaporte');
    });

    it('should return — when no madre data', () => {
      component.constancia = makeConstancia({ madre: null });
      expect(component.documentoIdentificacionMadre).toBe('—');
    });
  });

  describe('numeroIdentificacionMadre', () => {
    it('should format CUI with spaces', () => {
      component.constancia = makeConstancia({ madre: makeMadre({ cui: '1234567890123' }) as any });
      expect(component.numeroIdentificacionMadre).toBe('1234 56789 0123');
    });

    it('should return pasaporte when no CUI', () => {
      component.constancia = makeConstancia({ madre: makeMadre({ cui: null, pasaporte: 'AB123456' }) as any });
      expect(component.numeroIdentificacionMadre).toBe('AB123456');
    });

    it('should return — when no ID', () => {
      component.constancia = makeConstancia({ madre: makeMadre({ cui: null, pasaporte: null }) as any });
      expect(component.numeroIdentificacionMadre).toBe('—');
    });
  });

  describe('nacionalidadMadre', () => {
    it('should return GTM for Guatemalan', () => {
      component.constancia = makeConstancia({ madre: makeMadre() as any });
      expect(component.nacionalidadMadre).toBe('GTM');
    });

    it('should return foreign code', () => {
      component.constancia = makeConstancia({ madre: makeMadre({ datos_extra: { demograficos: { nacionalidad: 'USA', vecindad: null, lugar_nacimiento: null } } }) as any });
      expect(component.nacionalidadMadre).toBe('USA');
    });

    it('should return — when no data', () => {
      component.constancia = makeConstancia();
      expect(component.nacionalidadMadre).toBe('—');
    });
  });

  describe('esGuatemalteca', () => {
    it('should be true when nacionalidad is GTM', () => {
      component.constancia = makeConstancia({ madre: makeMadre() as any });
      expect(component.esGuatemalteca).toBeTrue();
    });

    it('should be true when mother has CUI even without GTM nationality', () => {
      component.constancia = makeConstancia({ madre: makeMadre({ datos_extra: { demograficos: { nacionalidad: null, vecindad: null, lugar_nacimiento: null } } }) as any });
      expect(component.esGuatemalteca).toBeTrue();
    });

    it('should be false when no CUI and nationality is not GTM', () => {
      component.constancia = makeConstancia({ madre: makeMadre({ cui: null, datos_extra: { demograficos: { nacionalidad: 'USA', vecindad: null, lugar_nacimiento: null } } }) as any });
      expect(component.esGuatemalteca).toBeFalse();
    });

    it('should be false when no madre data', () => {
      component.constancia = makeConstancia({ madre: null });
      expect(component.esGuatemalteca).toBeFalse();
    });
  });

  describe('nombreMadre', () => {
    it('should build full name', () => {
      component.constancia = makeConstancia({ madre: makeMadre() as any });
      expect(component.nombreMadre).toBe('María López Pérez');
    });

    it('should include apellido_casada', () => {
      component.constancia = makeConstancia({ madre: makeMadre({ nombre: { primer_nombre: 'Ana', primer_apellido: 'García', apellido_casada: 'Ramírez' } }) as any });
      expect(component.nombreMadre).toBe('Ana García de Ramírez');
    });

    it('should return — when no nombre', () => {
      component.constancia = makeConstancia({ madre: makeMadre({ nombre: null }) as any });
      expect(component.nombreMadre).toBe('—');
    });
  });

  describe('nombreMedico', () => {
    it('should return medico nombre', () => {
      component.medico = { nombre: 'Dr. Pérez', sexo: 'M', colegiado: 12345, dpi: null };
      expect(component.nombreMedico).toBe('Dr. Pérez');
    });

    it('should return — when no medico', () => {
      expect(component.nombreMedico).toBe('—');
    });
  });

  describe('cargoMedico', () => {
    it('should return Ginecólogo for M', () => {
      component.medico = { nombre: 'Dr. Pérez', sexo: 'M', colegiado: 12345, dpi: null };
      expect(component.cargoMedico).toBe('Ginecólogo y Obstetra');
    });

    it('should return Ginecóloga for F', () => {
      component.medico = { nombre: 'Dra. López', sexo: 'F', colegiado: 54321, dpi: null };
      expect(component.cargoMedico).toBe('Ginecóloga y Obstetra');
    });
  });

  describe('colegiadoMedico', () => {
    it('should return colegiado + CUI', () => {
      component.medico = { nombre: 'Dr. Pérez', sexo: 'M', colegiado: 12345, dpi: '1234567890123' };
      expect(component.colegiadoMedico).toContain('Colegiado 12345');
      expect(component.colegiadoMedico).toContain('CUI: 1234 56789 0123');
    });

    it('should return colegiado without CUI', () => {
      component.medico = { nombre: 'Dr. Pérez', sexo: 'M', colegiado: 12345, dpi: null };
      expect(component.colegiadoMedico).toBe('Colegiado 12345');
    });

    it('should return hospital name when no colegiado', () => {
      component.medico = { nombre: 'Dr. Pérez', sexo: 'M', colegiado: null, dpi: null };
      expect(component.colegiadoMedico).toBe('Hospital General Tipo I de Tecpán Guatemala');
    });
  });

  describe('vecindadMadre', () => {
    it('should return vecindad value', () => {
      component.constancia = makeConstancia({ madre: makeMadre() as any });
      expect(component.vecindadMadre).toBe('Tecpán');
    });
  });

  describe('lugarNacimientoMadre', () => {
    it('should return lugar_nacimiento', () => {
      component.constancia = makeConstancia({ madre: makeMadre() as any });
      expect(component.lugarNacimientoMadre).toBe('Chimaltenango');
    });
  });

  describe('madre extranjera (no GTM)', () => {
    beforeEach(() => {
      component.constancia = makeConstancia({
        madre: makeMadre({
          cui: null,
          pasaporte: 'AB123456',
          fecha_nacimiento: '1990-05-10',
          datos_extra: {
            demograficos: {
              vecindad: 'Miami',
              lugar_nacimiento: null,
              nacionalidad: 'USA',
            },
          },
        }) as any,
      });
    });

    it('esGuatemalteca should be false', () => {
      expect(component.esGuatemalteca).toBeFalse();
    });

    it('documentoIdentificacionMadre should be Pasaporte', () => {
      expect(component.documentoIdentificacionMadre).toBe('Pasaporte');
    });

    it('numeroIdentificacionMadre should show pasaporte', () => {
      expect(component.numeroIdentificacionMadre).toBe('AB123456');
    });

    it('nacionalidadMadre should be USA', () => {
      expect(component.nacionalidadMadre).toBe('USA');
    });

    it('lugarNacimientoMadre should be — (null)', () => {
      expect(component.lugarNacimientoMadre).toBe('—');
    });
  });

  describe('madre menor de edad (< 18)', () => {
    beforeEach(() => {
      const nac = new Date();
      const birthDate = new Date(nac.getFullYear() - 16, nac.getMonth(), nac.getDate());
      const iso = birthDate.toISOString().split('T')[0];
      component.constancia = makeConstancia({
        madre: makeMadre({
          fecha_nacimiento: iso,
          cui: '1234567890123',
        }) as any,
      });
    });

    it('edadMadre should be 16', () => {
      expect(component.edadMadre).toBe(16);
    });

    it('documentoIdentificacionMadre should be Certificado de Nacimiento', () => {
      expect(component.documentoIdentificacionMadre).toBe('Certificado de Nacimiento - CUI');
    });

    it('esGuatemalteca should be true (has CUI)', () => {
      expect(component.esGuatemalteca).toBeTrue();
    });
  });

  describe('madre extranjera menor de edad', () => {
    beforeEach(() => {
      const nac = new Date();
      const birthDate = new Date(nac.getFullYear() - 16, nac.getMonth(), nac.getDate());
      const iso = birthDate.toISOString().split('T')[0];
      component.constancia = makeConstancia({
        madre: makeMadre({
          fecha_nacimiento: iso,
          cui: null,
          pasaporte: 'XY789012',
          datos_extra: {
            demograficos: {
              vecindad: 'Ciudad de México',
              lugar_nacimiento: null,
              nacionalidad: 'MEX',
            },
          },
        }) as any,
      });
    });

    it('esGuatemalteca should be false', () => {
      expect(component.esGuatemalteca).toBeFalse();
    });

    it('edadMadre should be 16', () => {
      expect(component.edadMadre).toBe(16);
    });

    it('documentoIdentificacionMadre should be Certificado de Nacimiento (minor check first)', () => {
      expect(component.documentoIdentificacionMadre).toBe('Certificado de Nacimiento - CUI');
    });

    it('numeroIdentificacionMadre should show pasaporte (no CUI)', () => {
      expect(component.numeroIdentificacionMadre).toBe('XY789012');
    });

    it('nacionalidadMadre should be MEX', () => {
      expect(component.nacionalidadMadre).toBe('MEX');
    });
  });

  describe('template rendering', () => {
    it('should render header with logo SVG', () => {
      component.constancia = makeConstancia();
      fixture.detectChanges();
      const logoEl = fixture.nativeElement.querySelector('.hoja-logo');
      expect(logoEl).toBeTruthy();
    });

    it('should render document number', () => {
      component.constancia = makeConstancia({ documento: 'CN-999' });
      fixture.detectChanges();
      const docEl = fixture.nativeElement.querySelector('.exp-num');
      expect(docEl?.textContent?.trim()).toBe('CN-999');
    });

    it('should show Lugar de Origen for foreign mother', () => {
      component.constancia = makeConstancia({
        madre: makeMadre({
          cui: null,
          datos_extra: { demograficos: { vecindad: null, lugar_nacimiento: null, nacionalidad: 'USA' } },
        }) as any,
      });
      fixture.detectChanges();
      const lbls = fixture.nativeElement.querySelectorAll('.form-lbl');
      const found = Array.from(lbls).find((l) => (l as Element).textContent?.includes('Origen'));
      expect(found).toBeTruthy();
    });

    it('should show Lugar de Nacimiento for Guatemalan mother', () => {
      component.constancia = makeConstancia({ madre: makeMadre() as any });
      fixture.detectChanges();
      const lbls = fixture.nativeElement.querySelectorAll('.form-lbl');
      const found = Array.from(lbls).find((l) => (l as Element).textContent?.includes('Nacimiento'));
      expect(found).toBeTruthy();
    });

    it('should render observaciones section when present', () => {
      component.constancia = makeConstancia({ observaciones: 'Parto sin complicaciones' });
      fixture.detectChanges();
      const obs = fixture.nativeElement.querySelector('.form-observaciones');
      expect(obs?.textContent?.trim()).toContain('sin complicaciones');
    });

    it('should NOT render observaciones section when null', () => {
      component.constancia = makeConstancia({ observaciones: null });
      fixture.detectChanges();
      const obs = fixture.nativeElement.querySelector('.form-observaciones');
      expect(obs).toBeFalsy();
    });
  });

  describe('hoy()', () => {
    it('should return current date object', () => {
      const d = new Date();
      const result = component.hoy();
      expect(result.dia).toBe(d.getDate());
      expect(typeof result.mes).toBe('string');
      expect(result.anio).toBe(d.getFullYear());
    });
  });
});
