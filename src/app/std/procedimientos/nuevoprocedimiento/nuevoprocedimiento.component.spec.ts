import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NuevoprocedimientoComponent } from './nuevoprocedimiento.component';

describe('NuevoprocedimientoComponent', () => {
  let component: NuevoprocedimientoComponent;
  let fixture: ComponentFixture<NuevoprocedimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ NuevoprocedimientoComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NuevoprocedimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
