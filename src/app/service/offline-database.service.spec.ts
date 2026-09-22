import { TestBed } from '@angular/core/testing';
import { OfflineDatabaseService } from './offline-database.service';

describe('OfflineDatabaseService', () => {
  let db: OfflineDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [OfflineDatabaseService] });
    db = TestBed.inject(OfflineDatabaseService);
  });

  it('clearOnLogout conserva las mutaciones pendientes (no pierde registros offline)', async () => {
    await db.clearMutations();
    await db.addMutation({ method: 'POST', url: 'u/pacientes', body: { x: 1 }, timestamp: Date.now(), retries: 0 });
    expect(await db.getPendingCount()).toBe(1);

    await db.clearOnLogout();

    expect(await db.getPendingCount()).toBe(1); // NO se borran
    await db.clearMutations(); // limpieza
  });
});
