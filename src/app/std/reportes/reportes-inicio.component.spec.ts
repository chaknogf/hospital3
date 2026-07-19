import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ReportesInicioComponent } from './reportes-inicio.component';

describe('ReportesInicioComponent', () => {
  let component: ReportesInicioComponent;
  let fixture: ComponentFixture<ReportesInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ReportesInicioComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportesInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
