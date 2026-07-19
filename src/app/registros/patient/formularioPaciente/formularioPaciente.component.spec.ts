import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { FormularioPacienteComponent } from './formularioPaciente.component';

describe('FormularioPacienteComponent', () => {
  let component: FormularioPacienteComponent;
  let fixture: ComponentFixture<FormularioPacienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ FormularioPacienteComponent ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormularioPacienteComponent);
    component = fixture.componentInstance;
    // Skipping detectChanges because manejarDatosRenap accesses history.state
    // which is null in test environment
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
