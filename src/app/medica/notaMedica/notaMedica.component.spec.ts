import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { NotaMedicaComponent } from './notaMedica.component';
import { CicloService } from '../ciclo.service';
import { ConsultaService } from '../../registros/consultas/consultas.service';
import { PacienteService } from '../../registros/patient/paciente.service';
import { IconService } from '../../service/icon.service';

describe('NotaMedicaComponent', () => {
  let cicloService: jasmine.SpyObj<CicloService>;
  let consultasService: jasmine.SpyObj<ConsultaService>;
  let pacientesService: jasmine.SpyObj<PacienteService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let paramValue: string | null;

  const crear = () => {
    const fixture = TestBed.createComponent(NotaMedicaComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  };

  beforeEach(async () => {
    paramValue = '12';

    cicloService = jasmine.createSpyObj<CicloService>('CicloService', ['getCiclosDeConsulta', 'iniciarClico']);
    cicloService.getCiclosDeConsulta.and.returnValue(of([]));
    cicloService.iniciarClico.and.callFake((payload: any) => of({ ...payload, id: 9, numero: 1, usuario: 'test' }));

    consultasService = jasmine.createSpyObj<ConsultaService>('ConsultaService', ['getConsultasPorPaciente', 'getConsultaId']);
    consultasService.getConsultasPorPaciente.and.returnValue(of([
      { id: 12, tipo_consulta: 1, especialidad: 'MEDicina Interna', servicio: 'COEX', fecha_consulta: '2026-01-01', hora_consulta: '10:00', ultimo_estado: 'recepcion' },
    ] as any));
    consultasService.getConsultaId.and.returnValue(of({ especialidad: 'MEDI', servicio: 'COEX' } as any));

    pacientesService = jasmine.createSpyObj<PacienteService>('PacienteService', ['pacienteExpediente']);
    pacientesService.pacienteExpediente.and.returnValue(of({
      id: 12, expediente: '2024001', nombre: { primer_nombre: 'Ana', primer_apellido: 'Lopez' },
    } as any));

    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [NotaMedicaComponent],
      providers: [
        { provide: CicloService, useValue: cicloService },
        { provide: ConsultaService, useValue: consultasService },
        { provide: PacienteService, useValue: pacientesService },
        { provide: IconService, useValue: { getIcon: () => '' } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => paramValue } } } },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  });

  it('con consultaId carga los ciclos de la consulta de la ruta', () => {
    const { component } = crear();
    expect(cicloService.getCiclosDeConsulta).toHaveBeenCalledWith(12);
    expect(component.ciclo()?.consulta_id).toBe(12);
  });

  it('no queda en blanco: sin consultaId muestra el buscador por expediente', () => {
    paramValue = null;
    const { fixture } = crear();
    const picker = fixture.nativeElement.querySelector('.nm-picker');
    expect(picker).toBeTruthy();
    expect(picker.textContent).toContain('Registrar nota médica');
  });

  it('los steppers de escalas ajustan y acotan valores, y recalculan el total', () => {
    const { component } = crear();
    component.glasgow.apertura_ocular = 2;
    component.ajustar(component.glasgow, 'apertura_ocular', 1, 1, 4);
    expect(component.glasgow.apertura_ocular).toBe(3);
    component.ajustar(component.glasgow, 'apertura_ocular', 5, 1, 4);
    expect(component.glasgow.apertura_ocular).toBe(4); // acotado al máximo
    component.ajustar(component.glasgow, 'apertura_ocular', -9, 1, 4);
    expect(component.glasgow.apertura_ocular).toBe(1); // acotado al mínimo
    expect(component.val(component.glasgow, 'apertura_ocular')).toBe(1);
    expect(component.glasgowTotal).toBe(1 + component.glasgow.respuesta_verbal + component.glasgow.respuesta_motora);
  });

  it('busca por expediente y lista las consultas a documentar', () => {
    paramValue = null;
    const { component } = crear();
    component.busquedaExpediente = '2024001';
    component.buscarPaciente();
    expect(pacientesService.pacienteExpediente).toHaveBeenCalledWith('2024001');
    expect(consultasService.getConsultasPorPaciente).toHaveBeenCalledWith(12);
    expect(component.consultasPaciente().length).toBe(1);
  });

  it('construye y persiste todos los datos clínicos de la nota', () => {
    const { component } = crear();
    component.datosMedicos.impresion_clinica = 'Paciente estable';
    component.signosVitales.fc = '82';
    component.cuerpo.torax = 'Sin hallazgos';

    component.guardar();

    expect(cicloService.iniciarClico).toHaveBeenCalledWith(jasmine.objectContaining({
      consulta_id: 12,
      datos_medicos: jasmine.objectContaining({
        impresion_clinica: 'Paciente estable',
        signos_vitales: jasmine.objectContaining({ fc: '82' }),
        examen_fisico: jasmine.objectContaining({ cuerpo: jasmine.any(Object) }),
      }),
    }));
    expect(component.mensaje()?.tipo).toBe('success');
  });

  it('activa odontología por especialidad y guarda odontograma junto con la nota', () => {
    consultasService.getConsultaId.and.returnValue(of({ especialidad: 'ODON', servicio: 'COEX' } as any));
    const { component } = crear();
    component.odontologia.motivo_consulta = 'Dolor al masticar';
    component.odontologia.diagnostico = 'Caries oclusal';
    component.odontologia.odontograma.dientes['16'] = {
      superficies: { oclusal: 'caries' },
    };

    component.guardar();

    expect(component.odontologiaActiva()).toBeTrue();
    expect(component.tabActivo).toBe('odontologia');
    expect(cicloService.iniciarClico).toHaveBeenCalledWith(jasmine.objectContaining({
      contenido: 'Caries oclusal',
      especialidad: 'ODON',
      datos_medicos: jasmine.objectContaining({
        detalle_clinicos: 'Dolor al masticar',
        impresion_clinica: 'Caries oclusal',
        odontologia: jasmine.objectContaining({
          motivo_consulta: 'Dolor al masticar',
          odontograma: jasmine.objectContaining({
            dientes: jasmine.objectContaining({ 16: jasmine.objectContaining({
              superficies: jasmine.objectContaining({ oclusal: 'caries' }),
            }) }),
          }),
        }),
      }),
    }));
  });
});
