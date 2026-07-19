import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { EstadisticasNacimientosComponent } from './estadisticas-nacimientos.component';

describe('EstadisticasNacimientosComponent', () => {
  let component: EstadisticasNacimientosComponent;
  let fixture: ComponentFixture<EstadisticasNacimientosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EstadisticasNacimientosComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EstadisticasNacimientosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
