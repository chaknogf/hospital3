import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { FormConsultaComponent } from './formConsulta.component';

describe('FormConsultaComponent', () => {
  let component: FormConsultaComponent;
  let fixture: ComponentFixture<FormConsultaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ FormConsultaComponent ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormConsultaComponent);
    component = fixture.componentInstance;
    component.paciente = {
      id: 0,
      nombre: { primer_nombre: '', segundo_nombre: '', otro_nombre: '', primer_apellido: '', segundo_apellido: '', apellido_casada: '' },
    } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
