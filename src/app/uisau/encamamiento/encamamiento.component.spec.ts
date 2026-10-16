import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { EncamamientoComponent } from './encamamiento.component';
import { ConsultaService } from '../../registros/consultas/consultas.service';

describe('EncamamientoComponent', () => {
  let component: EncamamientoComponent;
  let fixture: ComponentFixture<EncamamientoComponent>;
  let apiSpy: jasmine.SpyObj<ConsultaService>;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj<ConsultaService>('ConsultaService', [
      'getServiciosPorTipo',
      'getConsultas',
    ]);
    apiSpy.getServiciosPorTipo.and.returnValue(of([
      { servicio: 'NEON', total: 49 },
      { servicio: 'SOPR', total: 12 },
      { servicio: 'MEDI', total: 3 },
      { servicio: null, total: 1 },
    ]));
    apiSpy.getConsultas.and.returnValue(of({ total: 0, consultas: [] }));

    await TestBed.configureTestingModule({
      imports: [ EncamamientoComponent ],
      providers: [
        provideRouter([]),
        { provide: ConsultaService, useValue: apiSpy },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EncamamientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('arma pestañas con COEX, Emergencia y los servicios reales de hospitalización', () => {
    expect(component.serviciosLista.map(s => s.key))
      .toEqual(['coex', 'emer', 'svc:NEON', 'svc:MEDI']);
  });

  it('omite servicios sin área hospitalaria (SOPR) y valores vacíos', () => {
    const keys = component.serviciosLista.map(s => s.key);
    expect(keys).not.toContain('svc:SOPR');
    expect(keys).not.toContain('svc:');
  });

  it('selecciona el primer servicio de hospitalización por defecto', () => {
    expect(component.seleccionado).toBe('svc:NEON');
  });

  it('excluye estados de salida al resolver servicios y conteos', () => {
    expect(apiSpy.getServiciosPorTipo).toHaveBeenCalledWith(
      jasmine.objectContaining({
        tipo_consulta: 2,
        excluir_estados: 'egreso,archivo,referido,fallecido,recepcion',
      })
    );
    expect(apiSpy.getConsultas).toHaveBeenCalledWith(
      jasmine.objectContaining({
        tipo_consulta: 2,
        servicio: 'NEON',
        excluir_estados: 'egreso,archivo,referido,fallecido,recepcion',
      })
    );
  });
});
