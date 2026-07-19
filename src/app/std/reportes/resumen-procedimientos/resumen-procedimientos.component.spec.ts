import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ResumenProcedimientosComponent } from './resumen-procedimientos.component';

describe('ResumenProcedimientosComponent', () => {
  let component: ResumenProcedimientosComponent;
  let fixture: ComponentFixture<ResumenProcedimientosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ResumenProcedimientosComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ResumenProcedimientosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
