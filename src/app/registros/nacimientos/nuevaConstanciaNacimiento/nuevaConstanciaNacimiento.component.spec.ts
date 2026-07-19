import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NuevaConstanciaNacimientoComponent } from './nuevaConstanciaNacimiento.component';

describe('NuevaConstanciaNacimientoComponent', () => {
  let component: NuevaConstanciaNacimientoComponent;
  let fixture: ComponentFixture<NuevaConstanciaNacimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ NuevaConstanciaNacimientoComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NuevaConstanciaNacimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
