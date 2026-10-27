import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { QuirofanoComponent } from './quirofano.component';
import { QuirofanoService } from './quirofano.service';
import { ConsultaService } from '../../registros/consultas/consultas.service';
import { PacienteService } from '../../registros/patient/paciente.service';

describe('QuirofanoComponent', () => {
  let component: QuirofanoComponent;
  let fixture: ComponentFixture<QuirofanoComponent>;

  const quirofanoServiceMock = {
    getIntervenciones: () => of({ total: 0, intervenciones: [] }),
    getEspecialidades: () => of([]),
    getFormatos: () => of([]),
    getEstadosCirugia: () => of([]),
    getRangosEspecialista: () => of([]),
    getProcedencias: () => of([]),
    getQuirofanosNumero: () => of([]),
    getProcedimientosQuirofano: () => of([]),
    eliminarIntervencion: () => of({}),
  };

  const consultaServiceMock = {
    getConsultas: () => of({ total: 0, consultas: [] }),
  };

  const pacienteServiceMock = {
    pacienteExpediente: () => of({}),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuirofanoComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: QuirofanoService, useValue: quirofanoServiceMock },
        { provide: ConsultaService, useValue: consultaServiceMock },
        { provide: PacienteService, useValue: pacienteServiceMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(QuirofanoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize dates to yesterday and today', () => {
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);
    const toIso = (d: Date) => d.toISOString().split('T')[0];
    expect(component.filtroInt.fecha_desde).toBe(toIso(ayer));
    expect(component.filtroInt.fecha_hasta).toBe(toIso(hoy));
  });

  it('should filter by specialidad by buttons', () => {
    spyOn(component, 'cargarIntervenciones');
    spyOn(component, 'cargarHospitalizacion');
    component.filtrarPorEspecialidad(1);
    expect(component.especialidadFiltroSeleccionada).toBe(1);
    expect(component.intPagina).toBe(1);
    expect(component.consultasPagina).toBe(1);
  });

  it('should auto filter on change', () => {
    spyOn(component, 'cargarIntervenciones');
    spyOn(component, 'cargarHospitalizacion');
    component.onFiltroIntervencionChange();
    expect(component.intPagina).toBe(1);
    expect(component.consultasPagina).toBe(1);
  });

  it('should clear filters', () => {
    component.filtroInt.expediente = '123';
    component.limpiarFiltros();
    expect(component.filtroInt.expediente).toBe('');
    expect(component.especialidadFiltroSeleccionada).toBeNull();
  });
});