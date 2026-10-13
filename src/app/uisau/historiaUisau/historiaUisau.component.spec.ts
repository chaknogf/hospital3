import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of } from 'rxjs';

import { HistoriaUisauComponent } from './historiaUisau.component';
import { CicloService } from '../../medica/ciclo.service';
import { PacienteService } from '../../registros/patient/paciente.service';

describe('HistoriaUisauComponent', () => {
  let fixture: ComponentFixture<HistoriaUisauComponent>;
  let component: HistoriaUisauComponent;
  let cicloService: jasmine.SpyObj<CicloService>;

  const uisau = {
    estado_paciente: { fecha: '2026-01-01', hora: '10:00', estado: 1, situacion: 2, cama: 5, lugar_referencia: 1 },
    informacion_contacto: { contacto: 'María López', parentesco: 3, telefono: 55512345 },
    nota_clinica: {
      nota: 'Se informa al usuario',
      evolucion: 'Estable',
      diagnosticos: [{ codigo: 'Z00', descripcion: 'Examen general' }],
      articulos: [{ descripcion: 'Pañales', cantidad: 2 }],
    },
  };
  const cicloUisau = { id: 1, numero: 1, registro: '2026-01-01T10:00:00Z', usuario: 'uisau', uisau };
  const cicloMedico = { id: 2, numero: 2, registro: '2026-01-01T11:00:00Z', usuario: 'medico', resumen: 'Nota médica' };

  beforeEach(async () => {
    cicloService = jasmine.createSpyObj<CicloService>('CicloService', ['getHistoriaClinica']);
    cicloService.getHistoriaClinica.and.returnValue(of({
      paciente_id: 7,
      paciente_nombre: 'Ana López',
      paciente_expediente: '2024001',
      consultas: [{
        consulta: { id: 12, tipo_consulta: 1, especialidad: 'MEDI', servicio: 'HOSP', fecha_consulta: '2026-01-01', hora_consulta: '10:00', ultimo_estado: 'recepcion' },
        ciclos: [cicloUisau, cicloMedico],
        total_ciclos: 2,
      }],
      total_consultas: 1,
      total_ciclos: 2,
    } as any));

    await TestBed.configureTestingModule({
      imports: [HistoriaUisauComponent],
      providers: [
        { provide: CicloService, useValue: cicloService },
        { provide: PacienteService, useValue: jasmine.createSpyObj<PacienteService>('PacienteService', ['pacienteExpediente']) },
        { provide: Location, useValue: { back: () => {} } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '7' } } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoriaUisauComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('carga la historia y presenta solo los registros UISAU', () => {
    expect(cicloService.getHistoriaClinica).toHaveBeenCalledWith(7);
    const conUisau = component.consultasConUisau();
    expect(conUisau.length).toBe(1);
    expect(conUisau[0].ciclos.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Se informa al usuario');
    expect(fixture.nativeElement.textContent).toContain('María López');
  });

  it('traduce los códigos a etiquetas legibles', () => {
    expect(component.etiquetaEstado(1)).toBe('Estable');
    expect(component.etiquetaSituacion(2)).toBe('Evolución favorable');
    expect(component.etiquetaLugar(1)).toBe('Hospital Regional');
    expect(component.etiquetaEstado(null)).toBe('—');
  });

  it('alterna el colapso de las consultas', () => {
    expect(component.estaColapsada(12)).toBeFalse();
    component.toggleConsulta(12);
    expect(component.estaColapsada(12)).toBeTrue();
  });
});
