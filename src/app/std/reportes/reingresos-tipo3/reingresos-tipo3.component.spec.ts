import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ReingresosTipo3Component } from './reingresos-tipo3.component';

describe('ReingresosTipo3Component', () => {
  let component: ReingresosTipo3Component;
  let fixture: ComponentFixture<ReingresosTipo3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ReingresosTipo3Component ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReingresosTipo3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
