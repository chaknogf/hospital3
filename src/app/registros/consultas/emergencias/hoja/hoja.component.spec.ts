import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HojaComponent } from './hoja.component';

describe('HojaComponent', () => {
  let component: HojaComponent;
  let fixture: ComponentFixture<HojaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HojaComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HojaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
