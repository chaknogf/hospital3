import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ConsultaService } from './consultas.service';
import { OfflineSyncService } from '../../service/offline-sync.service';
import { OfflineDatabaseService } from '../../service/offline-database.service';
import { FullSyncService } from '../../service/full-sync.service';
import { AuthService } from '../../service/auth.service';

describe('Service: ConsultaService', () => {
  let service: ConsultaService;
  let httpMock: HttpTestingController;
  let syncMock: any;
  let dbMock: any;
  let authMock: any;

  const consulta = (id: number) => ({ id, paciente_id: 1, especialidad: 'COEX', ultimo_estado: 'activo' } as any);

  beforeEach(() => {
    syncMock = {
      isOnline: jasmine.createSpy('isOnline').and.returnValue(true),
      enqueueMutation: jasmine.createSpy('enqueueMutation').and.resolveTo(1),
      cacheKey: jasmine.createSpy('cacheKey').and.callFake((url: string, params?: any) => `${url}|${params?.toString?.() ?? ''}`),
      cacheGet: jasmine.createSpy('cacheGet').and.callFake((_key: string, req$: any) => req$),
      getCachedData: jasmine.createSpy('getCachedData').and.resolveTo(null),
      setCachedData: jasmine.createSpy('setCachedData').and.resolveTo(),
      preCache: jasmine.createSpy('preCache'),
    };

    dbMock = jasmine.createSpyObj('OfflineDatabaseService', [
      'getAllConsultas', 'saveConsultas', 'guardarConsultaConsultada', 'getConsultasByPacienteId',
    ]);
    dbMock.getAllConsultas.and.resolveTo([]);
    dbMock.saveConsultas.and.resolveTo();
    dbMock.guardarConsultaConsultada.and.resolveTo();
    dbMock.getConsultasByPacienteId.and.resolveTo([]);

    authMock = { logOut: jasmine.createSpy('logOut') };

    TestBed.configureTestingModule({
      providers: [
        ConsultaService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: OfflineSyncService, useValue: syncMock },
        { provide: OfflineDatabaseService, useValue: dbMock },
        { provide: FullSyncService, useValue: {} },
        { provide: AuthService, useValue: authMock },
      ],
    });
    service = TestBed.inject(ConsultaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('envía los filtros planos de los componentes al backend', async () => {
    const promesa = firstValueFrom(
      service.getConsultas({ skip: 0, limit: 8, tipo_consulta: 1, especialidad: 'COEX' })
    );

    const req = httpMock.expectOne(r => r.url.endsWith('/consultas/') && r.method === 'GET');
    expect(req.request.params.get('tipo_consulta')).toBe('1');
    expect(req.request.params.get('especialidad')).toBe('COEX');
    expect(req.request.params.get('limit')).toBe('8');
    expect(req.request.params.get('skip')).toBe('0');
    req.flush({ total: 1, consultas: [consulta(1)] });

    const res = await promesa;
    expect(res.total).toBe(1);
    expect(res.consultas.length).toBe(1);
  });

  it('acota limit a 200 (máximo del backend) para evitar el 422', async () => {
    const promesa = firstValueFrom(service.getConsultas({ skip: 0, limit: 500 }));

    const req = httpMock.expectOne(r => r.url.endsWith('/consultas/'));
    expect(req.request.params.get('limit')).toBe('200');
    req.flush({ total: 0, consultas: [] });

    await promesa;
  });

  it('acepta filtros anidados { filtro } por compatibilidad', async () => {
    const promesa = firstValueFrom(
      service.getConsultas({ filtro: { skip: 0, limit: 10, especialidad: 'emergencia' } })
    );

    const req = httpMock.expectOne(r => r.url.endsWith('/consultas/'));
    expect(req.request.params.get('especialidad')).toBe('emergencia');
    expect(req.request.params.get('limit')).toBe('10');
    req.flush({ total: 0, consultas: [] });

    await promesa;
  });

  it('sin conexión usa la caché local y no llama al backend', async () => {
    syncMock.isOnline.and.returnValue(false);
    dbMock.getAllConsultas.and.resolveTo([consulta(1), consulta(2)]);

    const res = await firstValueFrom(service.getConsultas({ skip: 0, limit: 10 }));

    httpMock.expectNone(r => r.url.endsWith('/consultas/'));
    expect(res.total).toBe(2);
    expect(res.consultas.length).toBe(2);
  });

  it('al reconectar con el backend caído (502) carga desde la caché local', async () => {
    syncMock.isOnline.and.returnValue(true);
    dbMock.getAllConsultas.and.resolveTo([consulta(7)]);

    const promesa = firstValueFrom(service.getConsultas({ skip: 0, limit: 10 }));

    const req = httpMock.expectOne(r => r.url.endsWith('/consultas/'));
    req.flush('backend temporalmente caído', { status: 502, statusText: 'Bad Gateway' });

    const res = await promesa;
    expect(res.total).toBe(1);
    expect(res.consultas[0].id).toBe(7);
  });

  it('propaga el 401 sin servir caché', async () => {
    syncMock.isOnline.and.returnValue(true);

    const promesa = firstValueFrom(service.getConsultas({ skip: 0, limit: 10 }));

    const req = httpMock.expectOne(r => r.url.endsWith('/consultas/'));
    req.flush('no autorizado', { status: 401, statusText: 'Unauthorized' });

    await expectAsync(promesa).toBeRejected();
    expect(authMock.logOut).toHaveBeenCalled();
  });

  it('registrar admisión sin conexión: se guarda en la cola (no se pierde la admisión)', async () => {
    syncMock.isOnline.and.returnValue(false);
    dbMock.getAllConsultas.and.resolveTo([]);

    const res = await firstValueFrom(
      service.registrarAdmision({ paciente_id: 1, tipo_consulta: 1, especialidad: 'COEX' } as any)
    );

    expect((res as any).queued).toBeTrue();
    expect(syncMock.enqueueMutation).toHaveBeenCalledWith(
      'POST', jasmine.stringMatching(/\/consultas\/registro/), jasmine.any(Object)
    );
    httpMock.expectNone(r => r.url.includes('/consultas/registro'));
  });

  it('editar consulta sin conexión: encola el PATCH para el reconectar', async () => {
    syncMock.isOnline.and.returnValue(false);
    dbMock.getAllConsultas.and.resolveTo([consulta(7)]);

    const res = await firstValueFrom(
      service.updateConsulta(7, { especialidad: 'emergencia' } as any)
    );

    expect((res as any).queued).toBeTrue();
    expect(syncMock.enqueueMutation).toHaveBeenCalledWith(
      'PATCH', jasmine.stringMatching(/\/consultas\/7/), { especialidad: 'emergencia' }
    );
    httpMock.expectNone(r => r.url.includes('/consultas/7'));
  });
});
