import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { PacienteActivosComponent } from './pacienteActivos.component';
import { ConsultaService } from '../../registros/consultas/consultas.service';

describe('PacienteActivosComponent', () => {
  let fixture: ComponentFixture<PacienteActivosComponent>;
  let component: PacienteActivosComponent;
  let consultaService: jasmine.SpyObj<ConsultaService>;

  const consulta = (id: number, estado: string, especialidad: string) => ({
    id,
    especialidad,
    paciente_id: id + 1000,
    paciente: { id: id + 1000, nombre: { primer_nombre: 'Ana', primer_apellido: 'Lopez' } },
    ciclo: [{ estado }],
  });

  beforeEach(async () => {
    consultaService = jasmine.createSpyObj<ConsultaService>('ConsultaService', ['getConsultas']);
    consultaService.getConsultas.and.returnValue(of({
      total: 4,
      consultas: [
        consulta(1, 'consulta', 'MEDI'),
        consulta(2, 'egreso', 'MEDI'),
        consulta(3, 'archivo', 'PEDI'),
        consulta(4, 'evolucion', 'PEDI'),
      ] as any,
    } as any));

    await TestBed.configureTestingModule({
      imports: [PacienteActivosComponent],
      providers: [
        { provide: ConsultaService, useValue: consultaService },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PacienteActivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('solo lista pacientes cuyo último estado no es egreso ni archivo', () => {
    expect(component.visibles.map((c) => c.id)).toEqual([1, 4]);
  });

  it('filtra por especialidad recargando con el filtro', () => {
    consultaService.getConsultas.calls.reset();
    consultaService.getConsultas.and.returnValue(of({ total: 0, consultas: [] } as any));

    component.seleccionarEspecialidad('PEDI');

    expect(consultaService.getConsultas).toHaveBeenCalledWith(jasmine.objectContaining({ especialidad: 'PEDI', activo: true }));
    expect(component.especialidadSeleccionada).toBe('PEDI');
  });

  it('navega a la nota médica y a la historia por consulta', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    const c = component.visibles[0];

    component.nota(c);
    component.historia(c);

    expect(router.navigate).toHaveBeenCalledWith(['/notaMedica', c.id]);
    expect(router.navigate).toHaveBeenCalledWith(['/historiaClinica', c.paciente_id], { queryParams: { by: 'paciente' } });
  });

  it('pagina la lista: muestra pageSize y avanza con siguiente()', () => {
    const muchas = Array.from({ length: 15 }, (_, i) => consulta(i + 1, 'consulta', 'MEDI'));
    consultaService.getConsultas.and.returnValue(of({ total: 15, consultas: muchas } as any));
    component.cargar();

    expect(component.visibles.length).toBe(15);
    expect(component.totalPaginas).toBe(2);
    expect(component.paginados.length).toBe(12);

    component.siguiente();
    expect(component.paginaActual()).toBe(2);
    expect(component.paginados.length).toBe(3);

    component.anterior();
    expect(component.paginaActual()).toBe(1);
  });
});
