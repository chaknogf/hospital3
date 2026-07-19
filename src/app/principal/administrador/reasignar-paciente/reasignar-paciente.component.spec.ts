import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ReasignarPacienteComponent } from './reasignar-paciente.component';

describe('ReasignarPacienteComponent', () => {
  let component: ReasignarPacienteComponent;
  let fixture: ComponentFixture<ReasignarPacienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ReasignarPacienteComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReasignarPacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
