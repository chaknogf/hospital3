import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ConsultorComponent } from './consultor.component';
import { CicloService } from '../../medica/ciclo.service';
import { of } from 'rxjs';

describe('ConsultorComponent', () => {
  let component: ConsultorComponent;
  let fixture: ComponentFixture<ConsultorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ConsultorComponent ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('navega a la nota médica más reciente de la consulta', () => {
    const cicloService = TestBed.inject(CicloService);
    const router = TestBed.inject(Router);
    spyOn(cicloService, 'getCiclosDeConsulta').and.returnValue(of([{ id: 41 }, { id: 42 }] as any));
    const navigate = spyOn(router, 'navigate');

    component.verNotaMedica({ id: 7 } as any);

    expect(cicloService.getCiclosDeConsulta).toHaveBeenCalledWith(7);
    expect(navigate).toHaveBeenCalledWith(['/verNota', 42]);
  });

  it('cae a la historia del paciente cuando la consulta no tiene nota', () => {
    const cicloService = TestBed.inject(CicloService);
    const router = TestBed.inject(Router);
    spyOn(cicloService, 'getCiclosDeConsulta').and.returnValue(of([]));
    const navigate = spyOn(router, 'navigate');
    component.pacienteId = 99;

    component.verNotaMedica({ id: 7 } as any);

    expect(navigate).toHaveBeenCalledWith(['/historiaClinica', 99], { queryParams: { by: 'paciente' } });
  });
});
