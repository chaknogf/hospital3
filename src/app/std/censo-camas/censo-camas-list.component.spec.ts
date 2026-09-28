import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CensoCamasListComponent } from './censo-camas-list.component';

describe('CensoCamasListComponent', () => {
  let component: CensoCamasListComponent;
  let fixture: ComponentFixture<CensoCamasListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ CensoCamasListComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CensoCamasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra el total global de camas censables y conserva el valor por servicio', () => {
    expect(component.val({ camas_censables_total: 240 }, 'camas_censables')).toBe(240);
    expect(component.val({ camas_censables: 80 }, 'camas_censables')).toBe(80);
  });

  it('formatea la fecha del encabezado diario sin desfase de zona horaria', () => {
    expect(component.formatearFechaCorta('2026-09-26')).toBe('26/09/26');
  });

  it('combina los dos sexos y calcula ocupación, disponibilidad y movimientos del día', () => {
    component.hospitalizacionDiaria = component.armarTablaHospitalizacionDiaria([
      {
        servicio_id: 4,
        servicio_nombre: 'MEDICINA INTERNA',
        camas_censables: 10,
        dias_en_rango: 1,
        dco: 3,
        egresos_totales: 4,
        porcentaje_ocupacion: 30,
        dcd: 7,
        dias_estancia: 0.8,
        rotacion: 0.6,
      },
    ], [
      { servicio_id: 4, camas_ocupadas: 2, egresos: 1, contraindicados: 0, fallecidos: 0 },
      { servicio_id: 4, camas_ocupadas: 1, egresos: 2, contraindicados: 1, fallecidos: 0 },
    ] as any);

    expect(component.hospitalizacionDiaria[0]).toEqual(jasmine.objectContaining({
      camas_censables: 10,
      camas_ocupadas: 3,
      camas_disponibles: 7,
      porcentaje_ocupacional: 30,
      egresos_diarios: 3,
      egresos_contraindicados: 1,
      fallecidos: 0,
    }));
    expect(component.totalesHospitalizacionDiaria.camas_censables).toBe(10);
    expect(component.totalesHospitalizacionDiaria.porcentaje_ocupacional).toBe(30);
  });
});
