import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { EstadisticasService } from './estadisticas.service';

describe('Service: EstadisticasService', () => {
  let service: EstadisticasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EstadisticasService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ]
    });
    service = TestBed.inject(EstadisticasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('extiende BaseApiService', () => {
    // Tiene los métodos heredados (accesibles via any en tests)
    expect((service as any).limpiarParametros).toBeDefined();
    expect((service as any).baseUrl).toBeDefined();
  });

  // ── Pacientes atendidos ─────────────────────────────────
  it('getPacientesAtendidos envía GET con desde/hasta', () => {
    let resultado: any = null;
    service.getPacientesAtendidos('2025-01-01', '2025-12-31').subscribe(r => resultado = r);

    const req = httpMock.expectOne(r => r.url.includes('/estadisticas/consultas/pacientesAtendidos'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('desde')).toBe('2025-01-01');
    expect(req.request.params.get('hasta')).toBe('2025-12-31');
    req.flush({ titulo: 'Pacientes Atendidos', total_general: 150 });

    expect(resultado.total_general).toBe(150);
  });

  // ── Hospitalización infantil ─────────────────────────────
  it('getHospitalizacionInfantil envía GET con parámetros', () => {
    service.getHospitalizacionInfantil('2025-01-01', '2025-06-30').subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/estadisticas/consultas/hospitalizacion-infantil'));
    expect(req.request.params.get('desde')).toBe('2025-01-01');
    req.flush({ total_general: 10 });
  });

  // ── Promedio diario ─────────────────────────────────────
  it('getPromedioDiario envía GET con parámetros', () => {
    service.getPromedioDiario('2025-01-01', '2025-12-31').subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/estadisticas/consultas/promedioDiario'));
    req.flush({ total_general: 50 });
  });

  // ── Personal hospital ───────────────────────────────────
  it('getPersonalHospital envía GET con skip/limit', () => {
    service.getPersonalHospital('2025-01-01', '2025-12-31', 10, 25).subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/estadisticas/consultas/personal-hospital'));
    expect(req.request.params.get('skip')).toBe('10');
    expect(req.request.params.get('limit')).toBe('25');
    req.flush({ total_general: 5 });
  });

  it('getPersonalHospitalPacientes envía GET con filtros', () => {
    let resultado: any = null;
    service.getPersonalHospitalPacientes({ skip: 0, limit: 10, cui: '12345' }).subscribe(r => resultado = r);

    const req = httpMock.expectOne(r => r.url.includes('/pacientes/personal-hospital'));
    expect(req.request.params.get('cui')).toBe('12345');
    expect(req.request.params.get('limit')).toBe('10');
    req.flush({ total: 1, pacientes: [] });

    expect(resultado.total).toBe(1);
  });

  // ── Estudiante público ──────────────────────────────────
  it('getEstudiantePublico envía GET con parámetros', () => {
    service.getEstudiantePublico('2025-01-01', '2025-12-31').subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/estadisticas/consultas/estudiante-publico'));
    req.flush({ total_general: 8 });
  });

  // ── Reingresos ──────────────────────────────────────────
  it('getReingresos envía GET con parámetros', () => {
    service.getReingresos('2025-01-01', '2025-12-31').subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/estadisticas/consultas/reingresos'));
    req.flush({ total_general: 3 });
  });

  it('getReingresosTipo3 envía GET con skip/limit', () => {
    let resultado: any = null;
    service.getReingresosTipo3(0, 50).subscribe(r => resultado = r);

    const req = httpMock.expectOne(r => r.url.includes('/estadisticas/consultas/reingresos-tipo3'));
    expect(req.request.params.get('skip')).toBe('0');
    expect(req.request.params.get('limit')).toBe('50');
    req.flush({ total: 0, consultas: [] });

    expect(resultado.total).toBe(0);
  });

  // ── Activos >7 días ─────────────────────────────────────
  it('getActivosMayores7Dias envía GET con parámetros', () => {
    let resultado: any = null;
    service.getActivosMayores7Dias(0, 50).subscribe(r => resultado = r);

    const req = httpMock.expectOne(r => r.url.includes('/estadisticas/consultas/mayores-a-7-dias'));
    expect(req.request.params.get('skip')).toBe('0');
    expect(req.request.params.get('limit')).toBe('50');
    req.flush({ total: 0, consultas: [] });

    expect(resultado.total).toBe(0);
  });

  // ── Estadísticas nacimientos ────────────────────────────
  it('getEstadisticasNacimientos envía GET con parámetros', () => {
    service.getEstadisticasNacimientos('2025-01-01', '2025-12-31').subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/estadisticas/nacimientos'));
    expect(req.request.params.get('desde')).toBe('2025-01-01');
    req.flush({ total: 20 });
  });

  // ── Reporte procedimientos ──────────────────────────────
  it('getReporteProcedimientos envía GET con filtros', () => {
    service.getReporteProcedimientos({ desde: '2025-01-01', hasta: '2025-12-31' }).subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/procedimientos/reporte'));
    expect(req.request.params.get('desde')).toBe('2025-01-01');
    req.flush({ total_registros: 100 });
  });

  it('getResumenProcedimientos envía GET con filtros', () => {
    service.getResumenProcedimientos({ anio: 2025 }).subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/procedimientos/estadisticas/resumen'));
    expect(req.request.params.get('anio')).toBe('2025');
    req.flush({ total: 50 });
  });

  // ── isLoading signal ────────────────────────────────────
  it('isLoading se pone en true durante la llamada y false al completar', () => {
    expect(service.isLoading()).toBeFalse();

    service.getPacientesAtendidos('2025-01-01', '2025-12-31').subscribe();

    expect(service.isLoading()).toBeTrue();

    const req = httpMock.expectOne(r => r.url.includes('/estadisticas/consultas/pacientesAtendidos'));
    req.flush({ total_general: 0 });

    expect(service.isLoading()).toBeFalse();
  });
});
