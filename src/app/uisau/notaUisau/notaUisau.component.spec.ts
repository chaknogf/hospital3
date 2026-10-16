import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { NotaUisauComponent } from './notaUisau.component';
import { HistoriaUisauComponent } from '../historiaUisau/historiaUisau.component';
import { CicloService } from '../../medica/ciclo.service';
import { ConsultaService } from '../../registros/consultas/consultas.service';
import { PacienteService } from '../../registros/patient/paciente.service';

describe('NotaUisauComponent (página unificada)', () => {
  let fixture: ComponentFixture<NotaUisauComponent>;
  let component: NotaUisauComponent;
  let ciclo: jasmine.SpyObj<CicloService>;
  let pacientes: jasmine.SpyObj<PacienteService>;
  let consultas: jasmine.SpyObj<ConsultaService>;

  const paciente = {
    id: 5,
    expediente: '2024001',
    sexo: 'F',
    nombre: { primer_nombre: 'Ana', segundo_nombre: '', primer_apellido: 'López', segundo_apellido: '' },
  } as any;

  function create(params: Record<string, string>) {
    ciclo = jasmine.createSpyObj<CicloService>('CicloService', ['getHistoriaClinica', 'iniciarClico']);
    ciclo.getHistoriaClinica.and.returnValue(of({
      paciente_id: 5, paciente_nombre: 'Ana López', paciente_expediente: '2024001',
      consultas: [], total_consultas: 0, total_ciclos: 0,
    } as any));

    pacientes = jasmine.createSpyObj<PacienteService>('PacienteService', ['pacienteExpediente', 'getPacientes', 'getPaciente']);
    pacientes.pacienteExpediente.and.returnValue(of(paciente));
    pacientes.getPaciente.and.returnValue(of(paciente));
    pacientes.getPacientes.and.returnValue(of({
      total: 1,
      pacientes: [{ id: 5, expediente: '2024001', nombre: paciente.nombre }],
    } as any));

    consultas = jasmine.createSpyObj<ConsultaService>('ConsultaService', ['getConsultaId', 'getConsultasPorPaciente']);
    consultas.getConsultasPorPaciente.and.returnValue(of([]));

    TestBed.configureTestingModule({
      imports: [NotaUisauComponent],
      providers: [
        provideRouter([]),
        { provide: CicloService, useValue: ciclo },
        { provide: ConsultaService, useValue: consultas },
        { provide: PacienteService, useValue: pacientes },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: (k: string) => params[k] ?? null } } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotaUisauComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => TestBed.resetTestingModule());

  it('sin parámetros muestra el buscador único y no embebe la historia', () => {
    create({});
    expect(fixture.nativeElement.querySelector('.uv-tabs')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.nm-picker__search input').length).toBe(2);
    expect(fixture.nativeElement.querySelector('app-historiaUisau')).toBeNull();
  });

  it('busca por expediente y muestra la historia del paciente', () => {
    create({});
    component.busquedaExpediente = '2024001';
    component.buscarPaciente();
    fixture.detectChanges();

    expect(pacientes.pacienteExpediente).toHaveBeenCalledWith('2024001');
    expect(component.pacienteId()).toBe(5);
    expect(component.pacienteBuscado()).toBeTruthy();

    const child = fixture.debugElement.query(By.directive(HistoriaUisauComponent));
    expect(child).toBeTruthy();
    expect((child.componentInstance as HistoriaUisauComponent).mostrarBusqueda).toBeFalse();
  });

  it('filtra por nombre y permite elegir un paciente del listado', () => {
    create({});
    component.busquedaNombre = 'Ana';
    component.buscarPaciente();
    fixture.detectChanges();

    expect(pacientes.getPacientes).toHaveBeenCalledWith({ nombre: 'Ana', limit: 20 });
    expect(component.pacientesEncontrados().length).toBe(1);

    component.seleccionarPaciente(component.pacientesEncontrados()[0]);
    fixture.detectChanges();

    expect(component.pacienteId()).toBe(5);
    expect(fixture.nativeElement.querySelector('app-historiaUisau')).not.toBeNull();
  });

  it('con pacienteId en la ruta carga y embebe la historia', () => {
    create({ pacienteId: '5' });
    expect(pacientes.getPaciente).toHaveBeenCalledWith(5);
    expect(component.pacienteId()).toBe(5);
    expect(fixture.nativeElement.querySelector('app-historiaUisau')).not.toBeNull();
  });

  it('exige expediente o nombre para buscar', () => {
    create({});
    component.buscarPaciente();
    expect(component.error()).toContain('expediente o un nombre');
  });
});
