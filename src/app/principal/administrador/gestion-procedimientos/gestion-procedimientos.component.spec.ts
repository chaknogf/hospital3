import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { GestionProcedimientosComponent } from './gestion-procedimientos.component';
import { environment } from '../../../../environments/environment';

describe('GestionProcedimientosComponent', () => {
  let component: GestionProcedimientosComponent;
  let fixture: ComponentFixture<GestionProcedimientosComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ GestionProcedimientosComponent ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionProcedimientosComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    // Responde las peticiones iniciales del constructor (catálogo + especialidades).
    httpMock.match(() => true).forEach(req => req.flush([]));
  });

  afterEach(() => {
    httpMock.match(() => true).forEach(req => req.flush([]));
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggleEspecialidad agrega y quita ids', () => {
    component.toggleEspecialidad(3);
    component.toggleEspecialidad(5);
    expect(component.formEspecialidades()).toEqual([3, 5]);

    component.toggleEspecialidad(3);
    expect(component.formEspecialidades()).toEqual([5]);
    expect(component.especialidadSeleccionada(3)).toBeFalse();
    expect(component.especialidadSeleccionada(5)).toBeTrue();
  });

  it('abrirEditar precarga especialidades_ids', () => {
    component.abrirEditar({
      id: 1, nombre: 'P',
      especialidades_ids: [2, 4],
    } as any);
    expect(component.formEspecialidades()).toEqual([2, 4]);
  });

  it('abrirEditar usa especialidad_ref si no hay especialidades_ids', () => {
    component.abrirEditar({ id: 1, nombre: 'P', especialidad_ref: 7 } as any);
    expect(component.formEspecialidades()).toEqual([7]);
  });

  it('guardar envía especialidades_ids al backend', () => {
    component.abrirNuevo();
    component.formProcedimiento.set('Procedimiento de prueba');
    component.toggleEspecialidad(2);
    component.toggleEspecialidad(9);

    component.guardar();

    const req = httpMock.expectOne(`${environment.apiUrl}/catalogo-procedimientos/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.especialidades_ids).toEqual([2, 9]);
    expect(req.request.body.especialidad_ref).toBeUndefined();
    req.flush({ id: 99, nombre: 'Procedimiento de prueba', especialidades_ids: [2, 9] });
  });
});
