import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { ProcedimientosmenoresComponent } from './procedimientosmenores.component';
import { StdService } from '../../std.service';
import { EspecialidadesService } from '../../../service/especialidades.service';

describe('ProcedimientosmenoresComponent', () => {
  let component: ProcedimientosmenoresComponent;
  let fixture: ComponentFixture<ProcedimientosmenoresComponent>;
  let apiSpy: jasmine.SpyObj<StdService>;
  let espSpy: jasmine.SpyObj<EspecialidadesService>;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('StdService', ['getProcedimientos', 'getGruposEdad'], {
      procedimientos$: of([])
    });
    apiSpy.getProcedimientos.and.returnValue(of({ procedimientos: [], total: 0 } as any));
    apiSpy.getGruposEdad.and.returnValue(of([]));

    espSpy = jasmine.createSpyObj('EspecialidadesService', ['getEspecialidades']);
    espSpy.getEspecialidades.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ ProcedimientosmenoresComponent ],
      providers: [
        provideRouter([]),
        { provide: StdService, useValue: apiSpy },
        { provide: EspecialidadesService, useValue: espSpy },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcedimientosmenoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('carga procedimientos y especialidades al iniciar', () => {
    expect(apiSpy.getProcedimientos).toHaveBeenCalled();
    expect(espSpy.getEspecialidades).toHaveBeenCalledWith(true, true);
  });

  it('buscar consulta el día elegido y la especialidad por id', () => {
    component.filtros.especialidad_id = 6;
    component.filtros.fecha_inicio = '2026-10-15';

    component.buscar();

    const filtros = apiSpy.getProcedimientos.calls.mostRecent().args[0];
    expect(filtros.especialidad_id).toBe(6);
    expect(filtros.fecha_inicio).toBe('2026-10-15');
    expect(filtros.fecha_fin).toBe('2026-10-15');
    expect(filtros.skip).toBe(0);
  });

  it('limpiarFiltros resetea especialidad y fechas', () => {
    component.filtros.especialidad_id = 6;
    component.filtros.fecha_inicio = '2026-10-15';
    component.filtros.fecha_fin = '2026-10-15';

    component.limpiarFiltros();

    expect(component.filtros.especialidad_id).toBeNull();
    expect(component.filtros.fecha_inicio).toBe('');
    expect(component.filtros.fecha_fin).toBe('');
  });
});
