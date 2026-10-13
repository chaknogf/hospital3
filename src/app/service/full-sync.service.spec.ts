import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { FullSyncService } from './full-sync.service';
import { OfflineDatabaseService } from './offline-database.service';
import { BaseApiService } from './base-api.service';

describe('Service: FullSyncService', () => {
  let service: FullSyncService;
  let http: jasmine.SpyObj<HttpClient>;
  let db: any;

  /** Simula una página del backend ordenada descendentemente por id. */
  const page = (skip: number, limit: number, total: number, key: 'pacientes' | 'consultas') => {
    const disponibles = Math.max(0, total - skip);
    const n = Math.min(limit, disponibles);
    const rows = Array.from({ length: n }, (_, i) => ({ id: total - skip - i }));
    return key === 'pacientes' ? { total, pacientes: rows } : { total, consultas: rows };
  };

  beforeEach(() => {
    http = jasmine.createSpyObj('HttpClient', ['get']);
    db = jasmine.createSpyObj('OfflineDatabaseService', [
      'savePacientes', 'saveConsultas', 'setSyncMeta', 'getAllPacientes',
      'getSyncMeta', 'countPacientes', 'countConsultas',
    ]);
    db.savePacientes.and.resolveTo();
    db.saveConsultas.and.resolveTo();
    db.setSyncMeta.and.resolveTo();
    db.getAllPacientes.and.resolveTo([]);

    TestBed.configureTestingModule({
      providers: [
        FullSyncService,
        { provide: OfflineDatabaseService, useValue: db },
        { provide: HttpClient, useValue: http },
        { provide: BaseApiService, useValue: { baseUrl: 'http://test' } },
      ],
    });
    service = TestBed.inject(FullSyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('descarga pacientes en orden descendente (skip=0 = último creado) y se detiene en 500', async () => {
    const llamadas: number[] = [];
    (http.get as any).and.callFake((_url: string, opts: any) => {
      const skip = Number(opts.params.get('skip'));
      const limit = Number(opts.params.get('limit'));
      llamadas.push(skip);
      return of(page(skip, limit, 100000, 'pacientes'));
    });

    await (service as any).syncPacientesResumen();

    // Primeras 5 páginas, de la más nueva a la más antigua.
    expect(llamadas).toEqual([0, 100, 200, 300, 400]);

    const guardados = db.savePacientes.calls.mostRecent().args[0];
    expect(guardados.length).toBe(500);
    // El primer registro descargado es el más nuevo (id mayor).
    expect(guardados[0].id).toBe(100000);
    expect(guardados[499].id).toBe(99501);
    expect(db.setSyncMeta).toHaveBeenCalledWith('pacientes', 500);
  });

  it('no pide más páginas cuando el backend tiene menos de 500 pacientes', async () => {
    const llamadas: number[] = [];
    (http.get as any).and.callFake((_url: string, opts: any) => {
      const skip = Number(opts.params.get('skip'));
      const limit = Number(opts.params.get('limit'));
      llamadas.push(skip);
      return of(page(skip, limit, 150, 'pacientes'));
    });

    await (service as any).syncPacientesResumen();

    expect(llamadas).toEqual([0, 100]);
    expect(db.savePacientes.calls.mostRecent().args[0].length).toBe(150);
  });

  it('descarga consultas en orden descendente y se detiene en 500', async () => {
    const llamadas: number[] = [];
    (http.get as any).and.callFake((_url: string, opts: any) => {
      const skip = Number(opts.params.get('skip'));
      const limit = Number(opts.params.get('limit'));
      llamadas.push(skip);
      return of(page(skip, limit, 80000, 'consultas'));
    });

    await (service as any).syncConsultas();

    expect(llamadas).toEqual([0, 100, 200, 300, 400]);
    const guardadas = db.saveConsultas.calls.mostRecent().args[0];
    expect(guardadas.length).toBe(500);
    expect(guardadas[0].id).toBe(80000);
    expect(db.setSyncMeta).toHaveBeenCalledWith('consultas', 500);
  });
});
