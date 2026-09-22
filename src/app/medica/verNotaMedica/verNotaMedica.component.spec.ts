import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { VerNotaMedicaComponent } from './verNotaMedica.component';
import { CicloService } from '../ciclo.service';

describe('VerNotaMedicaComponent', () => {
  let fixture: ComponentFixture<VerNotaMedicaComponent>;
  let component: VerNotaMedicaComponent;
  let cicloService: jasmine.SpyObj<CicloService>;

  const ciclo = {
    id: 5,
    consulta_id: 228941,
    numero: 4,
    activo: true,
    registro: '2026-09-17T10:00:00',
    usuario: 'Dra. Aguirre',
    especialidad: 'CIRU',
    servicio: 'CIHO',
    contenido: '[PRUEBA] Postoperatorio',
    consulta: {
      id: 228941,
      expediente: '26A-3332',
      paciente: {
        id: 34568,
        nombre: { primer_nombre: 'Erick', primer_apellido: 'Cutzal' },
        nombre_completo: 'ERICK CUTZAL',
        sexo: 'M',
      },
    },
    datos_medicos: {
      impresion_clinica: 'Postoperatorio favorable',
      tratamiento: 'Cefazolina',
      signos_vitales: { pa: '118/76', fc: '78', fr: '18', sat02: '98', temp: '36.8', peso: '72', talla: '172', pt: '', te: '', pe: '', gmt: '' },
      antecedentes: { familiares: [], medicos: [], quirurgicos: [{ descripcion: 'Apendicectomía' }], alergicos: [], traumaticos: [], ginecoobstetricos: [], habitos: [] },
      examen_fisico: {
        cuerpo: { '2026-09-17T10:00:00': { cabeza: 'Normocéfalo', abdomen: 'Blando' } as any },
        glasgow: { '2026-09-17T10:00:00': { apertura_ocular: 4, respuesta_verbal: 5, respuesta_motora: 6, puntuacion_total: 15 } },
        silverman: {}, downe: {}, apgar: {}, bishop: {},
      },
      egreso: { condicion: '', referencia: '', medico: '', diagnosticos: [{ codigo: 'K35', descripcion: 'Apendicitis' }] },
    },
  } as any;

  beforeEach(async () => {
    cicloService = jasmine.createSpyObj<CicloService>('CicloService', ['getCiclo']);
    cicloService.getCiclo.and.returnValue(of(ciclo));

    await TestBed.configureTestingModule({
      imports: [VerNotaMedicaComponent],
      providers: [
        { provide: CicloService, useValue: cicloService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '5' } } } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VerNotaMedicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('carga la nota por id (solo lectura)', () => {
    expect(cicloService.getCiclo).toHaveBeenCalledWith(5);
    expect(component.ciclo()?.numero).toBe(4);
  });

  it('expone nombre, signos, examen y diagnósticos para el informe', () => {
    expect(component.nombrePaciente).toBe('ERICK CUTZAL');
    expect(component.signosItems.map((s) => s.label)).toContain('PA (mmHg)');
    expect(component.cuerpoItems.map((h) => h.label)).toEqual(['Cabeza', 'Abdomen']);
    expect(component.antecedentesGrupos.map((g) => g.label)).toEqual(['Quirúrgicos']);
    expect(component.diagnosticos).toEqual([{ codigo: 'K35', descripcion: 'Apendicitis' }]);
  });

  it('renderiza el documento y el sello de solo lectura', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.rep-doc')).toBeTruthy();
    expect(el.textContent).toContain('Postoperatorio favorable');
    expect(el.textContent).toContain('Solo lectura');
    expect(el.querySelector('input, textarea, select')).toBeNull();
  });
});
