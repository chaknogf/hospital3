import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HojaIngresoComponent } from './hojaIngreso.component';

describe('HojaIngresoComponent', () => {
  let component: HojaIngresoComponent;
  let fixture: ComponentFixture<HojaIngresoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HojaIngresoComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HojaIngresoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
