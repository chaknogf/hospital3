import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { ApiService } from './api.service';
import { AuthService } from './auth.service';

describe('Service: ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('extiende BaseApiService', () => {
    // ApiService hereda de BaseApiService — métodos protegidos accesibles via any
    expect((service as any).limpiarParametros).toBeDefined();
    expect((service as any).baseUrl).toBeDefined();
  });

  // ── Auth delegation ─────────────────────────────────────
  it('login delega a AuthService', () => {
    service.login('admin', '123').subscribe();

    const req = httpMock.expectOne(r => r.url.endsWith('/auth/login'));
    req.flush({ access_token: 'jwt-test' });

    const meReq = httpMock.expectOne(r => r.url.endsWith('/auth/me'));
    meReq.flush({ username: 'admin', role: 'admin', nombre: 'Admin' });

    // preCacheReferenceData lanza requests async
    httpMock.expectOne(r => r.url.includes('/municipios/departamentos')).flush([]);
    httpMock.expectOne(r => r.url.includes('/paises/')).flush([]);

    expect(service.token()).toBe('jwt-test');
  });

  it('getUsuarioActual delega a AuthService', () => {
    const auth = TestBed.inject(AuthService);
    auth.username.set('test-user');
    auth.role.set('medico');

    const result = service.getUsuarioActual();
    expect(result.username).toBe('test-user');
    expect(result.role).toBe('medico');
  });

  // ── Usuarios ────────────────────────────────────────────
  it('GET /users/ retorna lista de usuarios', () => {
    const respuesta = { total: 2, usuarios: [{ id: 1, username: 'admin' }, { id: 2, username: 'user' }] };

    let resultado: any = null;
    service.getUsers({}).subscribe(r => resultado = r);

    const req = httpMock.expectOne(r => r.url.endsWith('/users/'));
    req.flush(respuesta);

    expect(resultado.total).toBe(2);
    expect(resultado.usuarios.length).toBe(2);
  });

  it('GET /users/{id} retorna usuario', () => {
    let resultado: any = null;
    service.getUser(5).subscribe(r => resultado = r);

    const req = httpMock.expectOne(r => r.url.endsWith('/users/5'));
    req.flush({ id: 5, username: 'test' });

    expect(resultado.id).toBe(5);
  });

  it('POST /users/ crea usuario', () => {
    service.createUser({ username: 'nuevo', email: 'nuevo@test.com' }).subscribe();

    const req = httpMock.expectOne(r => r.url.endsWith('/users/') && r.method === 'POST');
    expect(req.request.body.username).toBe('nuevo');
    req.flush({ id: 1, username: 'nuevo' });
  });

  it('PUT /users/{id} actualiza usuario', () => {
    service.updateUser(3, { role: 'admin' }).subscribe();

    const req = httpMock.expectOne(r => r.url.endsWith('/users/3') && r.method === 'PUT');
    expect(req.request.body.role).toBe('admin');
    req.flush({ id: 3, role: 'admin' });
  });

  // ── Correlativos ────────────────────────────────────────
  it('corDefuncion() POST correlativo', () => {
    let resultado: any = null;
    service.corDefuncion().subscribe(r => resultado = r);

    const req = httpMock.expectOne(r => r.url.endsWith('/correlativos/constancia_defuncion'));
    req.flush({ correlativo: 'DF-000001' });

    expect(resultado.correlativo).toBe('DF-000001');
  });

  // ── Municipios ──────────────────────────────────────────
  it('GET /municipios/ retorna lista', () => {
    let resultado: any = null;
    service.getMunicipios({}).subscribe(r => resultado = r);

    const req = httpMock.expectOne(r => r.url.endsWith('/municipios/'));
    req.flush({ total: 1, municipios: [{ codigo: '0101' }] });

    expect(resultado.total).toBe(1);
  });

  it('POST /municipios/ crea municipio', () => {
    service.createMunicipio({ codigo: '0101', municipio: 'Test' }).subscribe();

    const req = httpMock.expectOne(r => r.url.endsWith('/municipios/') && r.method === 'POST');
    req.flush({ codigo: '0101' });
  });

  it('PUT /municipios/{codigo} actualiza', () => {
    service.updateMunicipio('0101', { municipio: 'Updated' }).subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/municipios/0101') && r.method === 'PUT');
    req.flush({ codigo: '0101' });
  });

  it('DELETE /municipios/{codigo} elimina', () => {
    service.deleteMunicipio('0101').subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/municipios/0101') && r.method === 'DELETE');
    req.flush({ detail: 'Eliminado' });
  });

  // ── Encamamiento ────────────────────────────────────────
  it('GET /encamamiento/ retorna servicios', () => {
    let resultado: any = null;
    service.getServiciosEncamamiento().subscribe(r => resultado = r);

    const req = httpMock.expectOne(r => r.url.endsWith('/encamamiento/'));
    req.flush([{ id: 1, servicio: 'Medicina Interna' }]);

    expect(resultado.length).toBe(1);
  });

  it('GET /encamamiento/ con filtro activo', () => {
    service.getServiciosEncamamiento(true).subscribe();

    const req = httpMock.expectOne(r => r.url.endsWith('/encamamiento/'));
    expect(req.request.params.get('activo')).toBe('true');
    req.flush([]);
  });

  it('POST /encamamiento/ crea servicio', () => {
    service.createServicioEncamamiento({ servicio: 'Nuevo' }).subscribe();

    const req = httpMock.expectOne(r => r.url.endsWith('/encamamiento/') && r.method === 'POST');
    req.flush({ id: 1 });
  });

  it('PATCH /encamamiento/{id} actualiza', () => {
    service.updateServicioEncamamiento(1, { servicio: 'Updated' }).subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/encamamiento/1') && r.method === 'PATCH');
    req.flush({ id: 1 });
  });

  it('DELETE /encamamiento/{id} elimina', () => {
    service.deleteServicioEncamamiento(1).subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/encamamiento/1') && r.method === 'DELETE');
    req.flush({ detail: 'Eliminado' });
  });

  // ── Países ──────────────────────────────────────────────
  it('GET /paises/ retorna países', () => {
    let resultado: any = null;
    service.getPaisesIso().subscribe(r => resultado = r);

    const req = httpMock.expectOne(r => r.url.endsWith('/paises/'));
    req.flush([{ codigo: 'GTM', nombre: 'Guatemala' }]);

    expect(resultado.length).toBe(1);
  });

  // ── RENAP ───────────────────────────────────────────────
  it('GET /renap-persona busca persona', () => {
    let resultado: any = null;
    service.getRenapITD({ cui: '1234567890101' }).subscribe(r => resultado = r);

    const req = httpMock.expectOne(r => r.url.endsWith('/renap-persona'));
    // El tap retorna la respuesta completa, no solo .resultado
    req.flush({ resultado: { nombre: 'Juan' } });

    expect(resultado).toBeTruthy();
  });

  // ── Merge ───────────────────────────────────────────────
  it('POST /pacientes/merge fusiona pacientes', () => {
    service.mergePacientes(1, [2, 3]).subscribe();

    const req = httpMock.expectOne(r => r.url.endsWith('/pacientes/merge') && r.method === 'POST');
    expect(req.request.params.get('principal_id')).toBe('1');
    expect(req.request.params.getAll('ids')).toEqual(['2', '3']);
    req.flush({ message: 'Merge exitoso' });
  });

  // ── Médicos ─────────────────────────────────────────────
  it('GET /personal-atencion/ retorna médicos', () => {
    let resultado: any = null;
    service.getMedicos({}).subscribe(r => resultado = r);

    const req = httpMock.expectOne(r => r.url.endsWith('/personal-atencion/'));
    req.flush({ total: 1, personal_atencion: [{ id: 1, nombre: 'Dr. Test' }] });

    expect(resultado.length).toBe(1);
    expect(resultado[0].nombre).toBe('Dr. Test');
  });

  // ── Estadísticas delegation ─────────────────────────────
  it('getPacientesAtendidos delega a EstadisticasService', () => {
    let resultado: any = null;
    service.getPacientesAtendidos('2025-01-01', '2025-12-31').subscribe(r => resultado = r);

    const req = httpMock.expectOne(r => r.url.includes('/estadisticas/consultas/pacientesAtendidos'));
    expect(req.request.params.get('desde')).toBe('2025-01-01');
    req.flush({ total_general: 100 });

    expect(resultado.total_general).toBe(100);
  });

  it('getReingresos delega a EstadisticasService', () => {
    service.getReingresos('2025-01-01', '2025-12-31').subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/estadisticas/consultas/reingresos'));
    req.flush({ total_general: 5 });
  });

  it('getActivosMayores7Dias delega a EstadisticasService', () => {
    service.getActivosMayores7Dias(0, 50).subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/estadisticas/consultas/mayores-a-7-dias'));
    expect(req.request.params.get('skip')).toBe('0');
    expect(req.request.params.get('limit')).toBe('50');
    req.flush({ total: 0, consultas: [] });
  });

  // ── Audit Log ───────────────────────────────────────────
  it('GET /audit-log/ retorna logs', () => {
    let resultado: any = null;
    service.getAuditLog({}).subscribe(r => resultado = r);

    const req = httpMock.expectOne(r => r.url.endsWith('/audit-log/'));
    req.flush({ total: 1, logs: [{ id: 1 }] });

    expect(resultado.total).toBe(1);
  });

  // ── Recuperación ────────────────────────────────────────
  it('solicitarRecuperacion envía email', () => {
    service.solicitarRecuperacion('test@test.com').subscribe();

    const req = httpMock.expectOne(r => r.url.endsWith('/users/recuperar/solicitar'));
    expect(req.request.body.email).toBe('test@test.com');
    req.flush({ message: 'Email enviado' });
  });

  it('confirmarRecuperacion envía datos', () => {
    service.confirmarRecuperacion('test@test.com', 'token123', 'newpass').subscribe();

    const req = httpMock.expectOne(r => r.url.endsWith('/users/recuperar/confirmar'));
    expect(req.request.body.email).toBe('test@test.com');
    expect(req.request.body.token).toBe('token123');
    req.flush({ message: 'Contraseña actualizada' });
  });
});
