import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcedimientosDashboardComponent } from './procedimientos-dashboard.component';

describe('ProcedimientosDashboardComponent', () => {
  let component: ProcedimientosDashboardComponent;
  let fixture: ComponentFixture<ProcedimientosDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcedimientosDashboardComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(ProcedimientosDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
