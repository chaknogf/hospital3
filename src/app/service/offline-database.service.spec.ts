import { TestBed } from '@angular/core/testing';
import { OfflineDatabaseService } from './offline-database.service';

describe('OfflineDatabaseService', () => {
  let db: OfflineDatabaseService;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [OfflineDatabaseService] });
    db = TestBed.inject(OfflineDatabaseService);
    await db.pacientes.clear();
    await db.consultas.clear();
    await db.cache.clear();
    await db.mutations.clear();
  });

  it('clearOnLogout conserva las mutaciones pendientes (no pierde registros offline)', async () => {
    await db.addMutation({ method: 'POST', url: 'u/pacientes', body: { x: 1 }, timestamp: Date.now(), retries: 0 });
    expect(await db.getPendingCount()).toBe(1);

    await db.clearOnLogout();

    expect(await db.getPendingCount()).toBe(1); // NO se borran
    await db.clearMutations(); // limpieza
  });

  it('savePacientes conserva solo los 500 más nuevos (elimina los de menor id)', async () => {
    const data = Array.from({ length: 600 }, (_, i) => ({ id: i + 1 }) as any);

    await db.savePacientes(data);

    const all = await db.getAllPacientes();
    expect(all.length).toBe(500);
    expect(Math.min(...all.map(p => p.id))).toBe(101);
    expect(Math.max(...all.map(p => p.id))).toBe(600);
  });

  it('saveConsultas conserva solo las 500 más nuevas (elimina las de menor id)', async () => {
    const data = Array.from({ length: 550 }, (_, i) => ({ id: i + 1, paciente_id: 1 }) as any);

    await db.saveConsultas(data);

    const all = await db.getAllConsultas();
    expect(all.length).toBe(500);
    expect(Math.min(...all.map(c => c.id))).toBe(51);
    expect(Math.max(...all.map(c => c.id))).toBe(550);
  });

  it('getCached respeta el TTL y elimina lo vencido', async () => {
    await db.setCache('vigente', { ok: true }, 60_000);
    expect(await db.getCached('vigente')).toEqual({ ok: true });

    await db.setCache('vencido', { ok: false }, -1);
    expect(await db.getCached('vencido')).toBeNull();
  });

  it('los datos cacheados sobreviven a un nuevo contexto (persistencia en IndexedDB)', async () => {
    await db.setCache('pacientes|skip=0', { total: 1, pacientes: [{ id: 5 }] }, 60_000);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [OfflineDatabaseService] });
    const db2 = TestBed.inject(OfflineDatabaseService);

    expect(await db2.getCached('pacientes|skip=0')).toEqual({ total: 1, pacientes: [{ id: 5 }] });
  });
});
