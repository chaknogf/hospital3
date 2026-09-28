import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { CensoCamasFormComponent } from './censo-camas-form.component';
import { CensoCamasService } from './censo-camas.service';
import { ApiService } from '../../service/api.service';

describe('CensoCamasFormComponent', () => {
  let component: CensoCamasFormComponent;
  let fixture: ComponentFixture<CensoCamasFormComponent>;
  let censoService: jasmine.SpyObj<CensoCamasService>;

  beforeEach(async () => {
    const apiService = jasmine.createSpyObj<ApiService>('ApiService', ['getServiciosEncamamiento']);
    apiService.getServiciosEncamamiento.and.returnValue(of([]));
    censoService = jasmine.createSpyObj<CensoCamasService>('CensoCamasService', ['getRegistros', 'crear', 'actualizar']);
    censoService.getRegistros.and.returnValue(of({ total: 0, registros: [] } as any));
    censoService.crear.and.returnValue(of({ id: 14 } as any));
    censoService.actualizar.and.returnValue(of({ id: 14 } as any));

    await TestBed.configureTestingModule({
      imports: [ CensoCamasFormComponent ],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: apiService },
        { provide: CensoCamasService, useValue: censoService },
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CensoCamasFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('usa ayer como fecha predeterminada del censo en hora local', () => {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const esperado = `${ayer.getFullYear()}-${String(ayer.getMonth() + 1).padStart(2, '0')}-${String(ayer.getDate()).padStart(2, '0')}`;

    expect(component.form.get('fecha')?.value).toBe(esperado);
  });

  it('envía ambos desgloses de sexo en un solo registro de fecha y servicio', () => {
    component.form.get('servicio_id')?.setValue(7);
    component.form.get('masculino')?.patchValue({ ocupados: 7, ingresos: 2 });
    component.form.get('femenino')?.patchValue({ ocupados: 3, fallecidos: 1 });
    const fecha = component.form.get('fecha')?.value;

    component.guardar();

    expect(censoService.crear).toHaveBeenCalledWith(jasmine.objectContaining({
      fecha,
      servicio_id: 7,
      masculino: jasmine.objectContaining({ ocupados: 7, ingresos: 2 }),
      femenino: jasmine.objectContaining({ ocupados: 3, fallecidos: 1 }),
    }));
  });
});
