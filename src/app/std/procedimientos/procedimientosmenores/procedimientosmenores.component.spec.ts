import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ProcedimientosmenoresComponent } from './procedimientosmenores.component';

describe('ProcedimientosmenoresComponent', () => {
  let component: ProcedimientosmenoresComponent;
  let fixture: ComponentFixture<ProcedimientosmenoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ProcedimientosmenoresComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProcedimientosmenoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
