import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ReporteProcedimientosComponent } from './reporte-procedimientos.component';

describe('ReporteProcedimientosComponent', () => {
  let component: ReporteProcedimientosComponent;
  let fixture: ComponentFixture<ReporteProcedimientosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ReporteProcedimientosComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReporteProcedimientosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
