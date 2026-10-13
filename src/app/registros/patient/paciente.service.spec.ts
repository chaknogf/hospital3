import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { PacienteService } from './paciente.service';
import { OfflineSyncService } from '../../service/offline-sync.service';
import { OfflineDatabaseService } from '../../service/offline-database.service';
import { PacienteUtilService } from '../../service/paciente-util.service';
import { FullSyncService } from '../../service/full-sync.service';
import { AuthService } from '../../service/auth.service';

describe('Service: PacienteService (offline: ediciones y admisiones)', () => {
  let service: PacienteService;
  let httpMock: HttpTestingController;
  let syncMock: any;
  let dbMock: any;
  let authMock: any;

  const flush = () => new Promise(resolve => setTimeout(resolve));

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
      'getPacienteById', 'savePacientes', 'getAllPacientes', 'searchPacientesLocal',
      'deletePacienteLocal',
    ]);
    dbMock.getPacienteById.and.resolveTo(null);
    dbMock.savePacientes.and.resolveTo();
    dbMock.getAllPacientes.and.resolveTo([]);
    dbMock.searchPacientesLocal.and.resolveTo([]);
    dbMock.pacientes_consultados = {
      add: jasmine.createSpy('add').and.resolveTo(),
      count: jasmine.createSpy('count').and.resolveTo(0),
      toArray: jasmine.createSpy('toArray').and.resolveTo([]),
      delete: jasmine.createSpy('delete').and.resolveTo(),
    };

    authMock = { logOut: jasmine.createSpy('logOut') };

    TestBed.configureTestingModule({
      providers: [
        PacienteService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: OfflineSyncService, useValue: syncMock },
        { provide: OfflineDatabaseService, useValue: dbMock },
        { provide: PacienteUtilService, useValue: { obtenerNombreCompleto: () => 'Ana Pérez' } },
        { provide: FullSyncService, useValue: {} },
        { provide: AuthService, useValue: authMock },
      ],
    });
    service = TestBed.inject(PacienteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('editar sin conexión: encola el PATCH y actualiza la copia local (no pierde el cambio)', async () => {
    syncMock.isOnline.and.returnValue(false);
    dbMock.getPacienteById.and.resolveTo({ id: 5, nombre: { primer_nombre: 'Ana' } } as any);
    dbMock.getAllPacientes.and.resolveTo([{ id: 5 }] as any);

    await firstValueFrom(service.updatePaciente(5, { id: 5, telefono: '5555' } as any));
    await flush();

    // El cambio queda en la cola para enviarse al reconectar.
    expect(syncMock.enqueueMutation).toHaveBeenCalledWith(
      'PATCH', jasmine.stringMatching(/\/pacientes\/5\?accion=mantener/), { id: 5, telefono: '5555' }
    );
    // La caché local (tabla `pacientes`) se actualiza para que la lista lo refleje.
    expect(dbMock.savePacientes).toHaveBeenCalled();
    const guardado = dbMock.savePacientes.calls.mostRecent().args[0][0];
    expect(guardado.telefono).toBe('5555');
    // La lista se recarga desde la caché local.
    expect(dbMock.getAllPacientes).toHaveBeenCalled();
    httpMock.expectNone(r => r.url.includes('/pacientes/5'));
  });

  it('editar en línea: envía el PATCH y refresca la caché local', async () => {
    syncMock.isOnline.and.returnValue(true);

    const promesa = firstValueFrom(service.updatePaciente(5, { id: 5, telefono: '9999' } as any));
    const patch = httpMock.expectOne(r => r.url.includes('/pacientes/5') && r.method === 'PATCH');
    patch.flush({ id: 5 });
    await promesa;
    await flush();

    const get = httpMock.expectOne(r => r.url.endsWith('/pacientes/') && r.method === 'GET');
    get.flush({ total: 0, pacientes: [] });

    expect(syncMock.enqueueMutation).not.toHaveBeenCalled();
    expect(dbMock.savePacientes).toHaveBeenCalled();
  });

  it('crear paciente sin conexión: se guarda en la cola y no se pierde', async () => {
    syncMock.isOnline.and.returnValue(false);
    dbMock.getAllPacientes.and.resolveTo([]);

    const res = await firstValueFrom(service.crearPaciente({ nombre: { primer_nombre: 'Luis' } } as any));
    await flush();

    expect(res.queued).toBeTrue();
    expect(syncMock.enqueueMutation).toHaveBeenCalledWith(
      'POST', jasmine.stringMatching(/\/pacientes/), jasmine.any(Object)
    );
    httpMock.expectNone(r => r.url.includes('/pacientes'));
  });

  it('listar pacientes sin conexión lee la caché local', async () => {
    syncMock.isOnline.and.returnValue(false);
    dbMock.getAllPacientes.and.resolveTo([{ id: 1 }, { id: 2 }] as any);

    const res = await firstValueFrom(service.getPacientes({ skip: 0, limit: 10 }));

    expect(res.total).toBe(2);
    expect(res.pacientes.length).toBe(2);
    httpMock.expectNone(r => r.url.endsWith('/pacientes/'));
  });
});
