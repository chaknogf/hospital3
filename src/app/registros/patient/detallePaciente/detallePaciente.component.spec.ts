import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DetallePacienteComponent } from './detallePaciente.component';

describe('DetallePacienteComponent', () => {
  let component: DetallePacienteComponent;
  let fixture: ComponentFixture<DetallePacienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ DetallePacienteComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetallePacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
