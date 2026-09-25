import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { HistoriaClinicaComponent } from './historiaClinica.component';
import { CicloService } from '../ciclo.service';
import { ConsultaService } from '../../registros/consultas/consultas.service';
import { PacienteService } from '../../registros/patient/paciente.service';

describe('HistoriaClinicaComponent', () => {
  let fixture: ComponentFixture<HistoriaClinicaComponent>;
  let component: HistoriaClinicaComponent;
  let cicloService: jasmine.SpyObj<CicloService>;
  let paramValue: string | null;
  let byValue: string | null;

  const odontologia = {
    motivo_consulta: 'Dolor al masticar',
    diagnostico: 'Caries oclusal',
    plan_tratamiento: 'Restauración',
    procedimientos: 'Evaluación clínica',
    piezas_afectadas: ['16'],
  };
  const ciclo = {
    id: 1,
    numero: 1,
    registro: '2026-01-01T10:00:00Z',
    usuario: 'doctor',
    especialidad: 'ODON',
    resumen: 'Caries oclusal',
    impresion_clinica: 'Caries oclusal',
    odontologia,
  };

  beforeEach(async () => {
    paramValue = '7';
    byValue = 'paciente';
    cicloService = jasmine.createSpyObj<CicloService>('CicloService', ['getHistoriaClinica', 'getCiclosDeConsulta']);
    cicloService.getHistoriaClinica.and.returnValue(of({
      paciente_id: 7,
      paciente_nombre: 'Ana López',
      paciente_expediente: '2024001',
      consultas: [{
        consulta: { id: 12, tipo_consulta: 1, especialidad: 'ODON', fecha_consulta: '2026-01-01' },
        ciclos: [ciclo],
        total_ciclos: 1,
      }],
      total_consultas: 1,
      total_ciclos: 1,
    } as any));
    cicloService.getCiclosDeConsulta.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [HistoriaClinicaComponent],
      providers: [
        { provide: CicloService, useValue: cicloService },
        { provide: ConsultaService, useValue: jasmine.createSpyObj<ConsultaService>('ConsultaService', ['getConsultasPorPaciente']) },
        { provide: PacienteService, useValue: jasmine.createSpyObj<PacienteService>('PacienteService', ['pacienteExpediente']) },
        { provide: ActivatedRoute, useValue: { snapshot: {
          paramMap: { get: () => paramValue },
          queryParamMap: { get: () => byValue },
        } } },
        { provide: Router, useValue: jasmine.createSpyObj<Router>('Router', ['navigate']) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoriaClinicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('carga y presenta la nota odontológica junto con su diagnóstico y piezas afectadas', () => {
    fixture.detectChanges();
    expect(cicloService.getHistoriaClinica).toHaveBeenCalledWith(7);
    expect(fixture.nativeElement.textContent).toContain('Odontología');
    expect(fixture.nativeElement.textContent).toContain('Caries oclusal');
    expect(fixture.nativeElement.textContent).toContain('16');
  });

  it('prepara el resumen odontológico para la tarjeta y la impresión', () => {
    expect(component.esNotaOdontologica(ciclo as any)).toBeTrue();
    expect(component.resumenOdontologico(ciclo as any)).toBe('Caries oclusal · Dolor al masticar · Restauración · Piezas: 16');
  });
});
