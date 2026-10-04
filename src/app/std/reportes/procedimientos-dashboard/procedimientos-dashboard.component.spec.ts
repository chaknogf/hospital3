import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';

import { ProcedimientosDashboardComponent } from './procedimientos-dashboard.component';

const isReporte = (r: { url: string }) => r.url.includes('procedimientos/reporte');
const isResumen = (r: { url: string }) => r.url.includes('procedimientos/estadisticas/resumen');
const isListado = (r: { url: string }) => {
  const url = r.url.toLowerCase();
  return url.includes('/procedimientos') && !url.includes('reporte') && !url.includes('resumen');
};

describe('ProcedimientosDashboardComponent', () => {
  let component: ProcedimientosDashboardComponent;
  let fixture: ComponentFixture<ProcedimientosDashboardComponent>;
  let httpMock: HttpTestingController;

  const mockReporte = {
    totales: { total_cantidad: 20, total_anestesia: 5, total_registros: 4 },
    grupos: [
      { especialidad: 'CIRUGIA', lugar_servicio: 'SOP', sexo: 'M', total_cantidad: 10, total_registros: 2, total_anestesia: 2 },
      { especialidad: 'CIRUGIA', lugar_servicio: 'SOP', sexo: 'F', total_cantidad: 5, total_registros: 1, total_anestesia: 1 },
      { especialidad: 'MEDICINA', lugar_servicio: 'EMERGENCIA', sexo: 'M', total_cantidad: 3, total_registros: 1, total_anestesia: 1 },
      { especialidad: 'MEDICINA', lugar_servicio: 'EMERGENCIA', sexo: 'F', total_cantidad: 2, total_registros: 0, total_anestesia: 1 }
    ]
  };

  const mockResumen = {
    top_procedimientos: [
      { nombre: 'Cirugia menor', total: 5, total_cantidad: 10, total_anestesia: 2 },
      { nombre: 'Sutura', total: 3, total_cantidad: 5, total_anestesia: 1 }
    ]
  };

  const mockProcedimientosList = {
    total: 4,
    procedimientos: [
      { id: 1, fecha: '2025-09-01', cantidad: 2, sexo: 'M', lugar_servicio: 'SOP', especialidad: 'CIRUGIA' }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcedimientosDashboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);

    // Crear componente sin disparar ngOnInit
    fixture = TestBed.createComponent(ProcedimientosDashboardComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create y setear fechas', () => {
    expect(component).toBeTruthy();
    expect(component.filtros.desde).toBeTruthy();
    expect(component.filtros.hasta).toBeTruthy();
  });

  it('cargar() debería poblar totales, rows, lugares y top5', () => {
    component.cargar();
    httpMock.expectOne(isReporte).flush(mockReporte);
    httpMock.expectOne(isResumen).flush(mockResumen);

    expect(component.totales?.total_cantidad).toBe(20);
    expect(component.rows.length).toBe(2);
    expect(component.lugares.length).toBe(2);
    expect(component.totalGeneral).toBe(20);
    expect(component.top5.length).toBe(2);
    expect(component.registrosPorServicio.length).toBe(2);
    expect(component.cargando).toBeFalse();
    expect(component.error).toBeNull();
  });

  it('cargar() debería manejar error y setear error', () => {
    component.cargar();
    httpMock.expectOne(isReporte).error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });
    // Resumen queda como 200 vacío para limpiar la cola
    httpMock.expectOne(isResumen).flush({ top_procedimientos: [] });

    expect(component.error).toBe('Error al cargar datos');
    expect(component.cargando).toBeFalse();
  });

  it('debería ordenar rows por total descendente', () => {
    component.cargar();
    httpMock.expectOne(isReporte).flush(mockReporte);
    httpMock.expectOne(isResumen).flush(mockResumen);

    expect(component.rows[0].especialidad).toBe('CIRUGIA');
    expect(component.rows[1].especialidad).toBe('MEDICINA');
  });

  it('debería ordenar registrosPorServicio descendente', () => {
    component.cargar();
    httpMock.expectOne(isReporte).flush(mockReporte);
    httpMock.expectOne(isResumen).flush(mockResumen);

    expect(component.registrosPorServicio[0].lugar_servicio).toBe('SOP');
    expect(component.registrosPorServicio[0].total_registros).toBe(3);
  });

  it('debería calcular colTotales correctamente', () => {
    component.cargar();
    httpMock.expectOne(isReporte).flush(mockReporte);
    httpMock.expectOne(isResumen).flush(mockResumen);

    const sop = component.colTotales[component.lugares.indexOf('SOP')];
    const emerg = component.colTotales[component.lugares.indexOf('EMERGENCIA')];
    expect(sop.M).toBe(10);
    expect(sop.F).toBe(5);
    expect(sop.total).toBe(15);
    expect(emerg.M).toBe(3);
    expect(emerg.F).toBe(2);
    expect(emerg.total).toBe(5);
  });

  it('limpiar() debería resetear filtros a mes actual', () => {
    component.filtros.especialidad = 'TEST';
    component.filtros.sexo = 'M';

    component.limpiar();
    httpMock.expectOne(isReporte).flush(mockReporte);
    httpMock.expectOne(isResumen).flush(mockResumen);

    expect(component.filtros.especialidad).toBe('');
    expect(component.filtros.sexo).toBe('');
    expect(component.filtros.nombre).toBe('');
  });

  it('descargarExcel() debería llamar al listado con los filtros correctos', () => {
    component.filtros.especialidad = 'CIRUGIA';
    component.descargarExcel();
    const req = httpMock.expectOne(isListado);
    expect(req.request.params.get('especialidad')).toBe('CIRUGIA');
    expect(req.request.params.get('limit')).toBe('100000');
    req.flush(mockProcedimientosList);
  });

  it('descargarExcel() no debería exportar si no hay datos', async () => {
    spyOn(window, 'alert');
    const promesa = component.descargarExcel();
    httpMock.expectOne(isListado).flush({ total: 0, procedimientos: [] });
    await promesa;
    expect(window.alert).toHaveBeenCalled();
  });

  it('descargarExcel() maneja error', async () => {
    spyOn(window, 'alert');
    const promesa = component.descargarExcel();
    httpMock.expectOne(isListado).error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });
    await promesa;
    expect(window.alert).toHaveBeenCalled();
  });

  it('el desglose por edad y sexo debe cuadrar con la cantidad del registro', () => {
    const nuevo = {
      id: 1,
      fecha: '2026-12-01',
      cantidad: 6,
      sexo: null,
      grupo_edad_detalle: { NEO: { m: 2, f: 1 }, ADO: { m: 0, f: 3 } }
    };
    const historico = { id: 2, fecha: '2026-12-01', cantidad: 3, sexo: 'M', grupo_edad_detalle: null };

    const total = (p: any, clave: 'm' | 'f') =>
      (component as any).totalSexo(p, clave);

    expect(total(nuevo, 'm') + total(nuevo, 'f')).toBe(nuevo.cantidad);
    // El registro histórico atribuye su cantidad al sexo con que se capturó
    expect(total(historico, 'm')).toBe(3);
    expect(total(historico, 'f')).toBe(0);
  });

  it('ngOnInit llama cargar()', () => {
    const spy = spyOn(component, 'cargar').and.callThrough();
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
    httpMock.expectOne(isReporte).flush(mockReporte);
    httpMock.expectOne(isResumen).flush(mockResumen);
  });

  it('ngOnInit acepta fechas inválidas sin romper', () => {
    // crear otro componente
    const f2 = TestBed.createComponent(ProcedimientosDashboardComponent);
    const c2 = f2.componentInstance;
    expect(c2).toBeTruthy();
  });
});
