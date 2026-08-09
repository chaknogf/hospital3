import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';

import { ListarPrestamosComponent } from './listarPrestamos.component';
import { PrestamosService } from '../prestamos.service';

describe('ListarPrestamosComponent', () => {
  let component: ListarPrestamosComponent;
  let fixture: ComponentFixture<ListarPrestamosComponent>;
  let api: PrestamosService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarPrestamosComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        PrestamosService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListarPrestamosComponent);
    component = fixture.componentInstance;
    api = TestBed.inject(PrestamosService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('paginaSiguiente incrementa skip en el limite', () => {
    component.finPagina = false;
    api.total.set(100);
    const antes = component.filtros.skip ?? 0;
    component.paginaSiguiente();
    expect(component.filtros.skip).toBe(antes + component.limit);
  });

  it('paginaAnterior no baja de cero', () => {
    component.filtros.skip = 0;
    component.paginaAnterior();
    expect(component.filtros.skip).toBe(0);
  });

  it('totalPaginas redondea hacia arriba', () => {
    api.total.set(21);
    expect(component.totalPaginas).toBe(2);
  });

  it('estaVencido detecta fecha limite pasada sin devolucion', () => {
    const hoy = new Date();
    const ayer = new Date(hoy.getTime() - 86400000).toISOString();
    const prestamo = {
      id: 1,
      id_paciente: 1,
      solicitante: 'A',
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
      fecha_limite: ayer,
      fecha_devolucion: null,
    } as any;
    expect(component.estaVencido(prestamo)).toBeTrue();
  });

  it('filtros inicial incluye rango de fechas null', () => {
    expect(component.filtros.fecha_desde).toBeNull();
    expect(component.filtros.fecha_hasta).toBeNull();
  });

  it('limpiarFiltros resetea el rango de fechas', () => {
    component.filtros.fecha_desde = '2026-08-01';
    component.filtros.fecha_hasta = '2026-08-31';
    component.limpiarFiltros();
    expect(component.filtros.fecha_desde).toBeNull();
    expect(component.filtros.fecha_hasta).toBeNull();
    expect(component.filtros.activo).toBeTrue();
  });
});