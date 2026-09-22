import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, throwError, of } from 'rxjs';

import { OfflineSyncService } from './offline-sync.service';
import { OfflineDatabaseService, PendingMutation } from './offline-database.service';

describe('OfflineSyncService', () => {
  let service: OfflineSyncService;
  let db: any;
  let http: jasmine.SpyObj<HttpClient>;

  const nuevaMut = (): PendingMutation => ({
    id: 1, method: 'POST', url: 'http://x/pacientes', body: { a: 1 }, timestamp: 1, retries: 0,
  });

  beforeEach(async () => {
    db = jasmine.createSpyObj('OfflineDatabaseService', ['getPendingMutations', 'deleteMutation', 'getPendingCount', 'clearOnLogout']);
    db.mutations = { update: jasmine.createSpy('update').and.resolveTo() };
    db.getPendingMutations.and.resolveTo([]);
    db.getPendingCount.and.resolveTo(0);

    http = jasmine.createSpyObj('HttpClient', ['post', 'put', 'patch', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        OfflineSyncService,
        { provide: OfflineDatabaseService, useValue: db },
        { provide: HttpClient, useValue: http },
        // 'server' evita que el constructor dispare un syncNow inicial y interfiera con las pruebas.
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });
    service = TestBed.inject(OfflineSyncService);
  });

  it('no procesa dos sincronizaciones concurrentes (evita duplicar un alta de paciente)', async () => {
    db.getPendingMutations.and.resolveTo([nuevaMut()]);
    const subj = new Subject<any>();
    (http.post as any).and.returnValue(subj.asObservable());

    const p1 = service.syncNow();
    const p2 = service.syncNow();

    expect(await p2).toEqual({ synced: 0, failed: 0 }); // segunda llamada: bloqueada

    subj.next({ id: 1 }); subj.complete();
    expect((await p1).synced).toBe(1);
    expect(http.post.calls.count()).toBe(1); // NO se duplicó el POST
  });

  it('conserva una mutación que falla y la marca como stalled (no pérdida de datos)', async () => {
    const mut = nuevaMut();
    mut.retries = 5;
    db.getPendingMutations.and.resolveTo([mut]);
    (http.post as any).and.returnValue(throwError(() => new Error('500')));

    const r = await service.syncNow();

    expect(r.failed).toBe(1);
    expect(db.deleteMutation).not.toHaveBeenCalled();
    expect(db.mutations.update).toHaveBeenCalledWith(mut.id, jasmine.objectContaining({ stalled: true }));
  });

  it('elimina la mutación solo cuando se sincroniza con éxito', async () => {
    db.getPendingMutations.and.resolveTo([nuevaMut()]);
    (http.post as any).and.returnValue(of({ id: 9 }));

    const r = await service.syncNow();

    expect(r.synced).toBe(1);
    expect(db.deleteMutation).toHaveBeenCalledWith(1);
  });
});
