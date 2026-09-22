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
  let consultasService: jasmine.SpyObj<ConsultaService>;
  let pacientesService: jasmine.SpyObj<PacienteService>;
  let paramValue: string | null;

  beforeEach(async () => {
    paramValue = null;

    cicloService = jasmine.createSpyObj<CicloService>('CicloService', ['getCiclosDeConsulta']);
    cicloService.getCiclosDeConsulta.and.returnValue(of([
      {
        id: 1,
        consulta_id: 12,
        numero: 1,
        activo: true,
        registro: '2026-01-01T10:00:00Z',
        usuario: 'doctor',
        datos_medicos: { impresion_clinica: 'Estable' },
      },
    ] as any));

    consultasService = jasmine.createSpyObj<ConsultaService>('ConsultaService', ['getConsultasPorPaciente']);
    consultasService.getConsultasPorPaciente.and.returnValue(of([
      { id: 12, tipo_consulta: 1, especialidad: 'MEDicina Interna', servicio: 'COEX', fecha_consulta: '2026-01-01', hora_consulta: '10:00', ultimo_estado: 'recepcion' },
    ] as any));

    pacientesService = jasmine.createSpyObj<PacienteService>('PacienteService', ['pacienteExpediente']);
    pacientesService.pacienteExpediente.and.returnValue(of({
      id: 12,
      expediente: '2024001',
      nombre: { primer_nombre: 'Ana', primer_apellido: 'Lopez' },
    } as any));

    await TestBed.configureTestingModule({
      imports: [HistoriaClinicaComponent],
      providers: [
        { provide: CicloService, useValue: cicloService },
        { provide: ConsultaService, useValue: consultasService },
        { provide: PacienteService, useValue: pacientesService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => paramValue }, queryParamMap: { get: () => null } } } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoriaClinicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('no queda en blanco: muestra el buscador por expediente al entrar sin consultaId', () => {
    const search = fixture.nativeElement.querySelector('.historia-search');
    expect(search).toBeTruthy();
    expect(search.textContent).toContain('Buscar paciente');
  });

  it('busca por expediente y lista todas las notas del paciente', () => {
    component.busquedaExpediente = '2024001';
    component.buscarPaciente();
    fixture.detectChanges();

    expect(pacientesService.pacienteExpediente).toHaveBeenCalledWith('2024001');
    expect(consultasService.getConsultasPorPaciente).toHaveBeenCalledWith(12);
    expect(cicloService.getCiclosDeConsulta).toHaveBeenCalledWith(12);
    expect(component.ciclos().length).toBe(1);
    expect(component.resumen(component.ciclos()[0])).toBe('Estable');
  });

  it('con consultaId en la ruta carga la historia directamente', () => {
    paramValue = '12';
    const f = TestBed.createComponent(HistoriaClinicaComponent);
    f.detectChanges();
    expect(cicloService.getCiclosDeConsulta).toHaveBeenCalledWith(12);
    expect(f.componentInstance.ciclos().length).toBe(1);
  });
});
