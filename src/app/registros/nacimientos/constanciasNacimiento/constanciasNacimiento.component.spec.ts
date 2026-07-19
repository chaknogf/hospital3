import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ConstanciasNacimientoComponent } from './constanciasNacimiento.component';

describe('ConstanciasNacimientoComponent', () => {
  let component: ConstanciasNacimientoComponent;
  let fixture: ComponentFixture<ConstanciasNacimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ConstanciasNacimientoComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConstanciasNacimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
