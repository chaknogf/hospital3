import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { OfflineDatabaseService } from './offline-database.service';
import { Paciente, PacienteListResponse } from '../interface/interfaces';
import { ConsultaListResponse } from '../interface/consultas';
import { BaseApiService } from './base-api.service';

const MS = { HORA: 3600000, DIA: 86400000 };

/** Descarga pacientes y consultas por páginas y controla pausas/cancelación. */
@Injectable({ providedIn: 'root' })
export class FullSyncService {
  private db = inject(OfflineDatabaseService);
  private http = inject(HttpClient);
  private api = inject(BaseApiService);

  isSyncing = signal(false);
  syncProgress = signal<string>('');
  lastSyncAt = signal<Date | null>(null);
  syncStats = signal<{ pacientes: number; detalles: number; consultas: number }>({ pacientes: 0, detalles: 0, consultas: 0 });
  syncState = signal<'idle' | 'syncing' | 'paused'>('idle');

  private cancelFlag = false;
  private pausePromise: Promise<void> | null = null;
  private pauseResolve: (() => void) | null = null;

  private readonly PAGE_SIZE = 100;
  private readonly CONCURRENCY = 5;
  private readonly FULL_DETAIL_THRESHOLD = 500;
  private readonly MAX_RECORDS = 500;

  /** Pausa la descarga en el siguiente límite de lote/página comprobado. */
  pause(): void {
    if (this.syncState() === 'syncing') {
      this.syncState.set('paused');
      this.syncProgress.set('⏸ Sincronización pausada');
      this.pausePromise = new Promise(resolve => {
        this.pauseResolve = resolve;
      });
    }
  }

  /** Libera la espera creada por {@link pause}. */
  resume(): void {
    if (this.syncState() === 'paused') {
      this.syncState.set('syncing');
      this.syncProgress.set('Reanudando...');
      this.pauseResolve?.();
      this.pausePromise = null;
      this.pauseResolve = null;
    }
  }

  /** Solicita cancelación; la operación en curso termina antes de detenerse. */
  cancel(): void {
    this.cancelFlag = true;
    this.pauseResolve?.();
    this.pausePromise = null;
    this.pauseResolve = null;
  }

  private async checkPauseCancel(): Promise<void> {
    if (this.cancelFlag) {
      throw new Error('Sincronización cancelada por el usuario');
    }
    if (this.syncState() === 'paused' && this.pausePromise) {
      await this.pausePromise;
      if (this.cancelFlag) {
        throw new Error('Sincronización cancelada por el usuario');
      }
    }
  }

  // Tiempos de re-sincronización por tipo de dato
  private readonly TTL = {
    pacientes: 6 * MS.HORA,
    detalles: 24 * MS.HORA,
    consultas: 2 * MS.HORA,
  };

  private async necesitaSync(key: string, ttl: number): Promise<boolean> {
    const meta = await this.db.getSyncMeta(key);
    if (!meta) return true;
    return Date.now() - meta.timestamp > ttl;
  }

  /** Sincroniza los conjuntos cuyo TTL venció, o todos cuando `force` es verdadero. */
  async syncAll(force: boolean = false): Promise<void> {
    if (this.isSyncing()) return;
    this.cancelFlag = false;
    this.syncState.set('syncing');
    this.isSyncing.set(true);
    this.syncStats.set({ pacientes: 0, detalles: 0, consultas: 0 });
    try {
      const syncPac = force || await this.necesitaSync('pacientes', this.TTL.pacientes);
      const syncDet = force || await this.necesitaSync('pacientes_detalle', this.TTL.detalles);
      const syncCon = force || await this.necesitaSync('consultas', this.TTL.consultas);

      if (!syncPac && !syncDet && !syncCon) {
        const s = await this.getSyncStatus();
        this.syncProgress.set('Datos actualizados');
        this.lastSyncAt.set(new Date());
        return;
      }

      if (syncPac) {
        this.syncProgress.set('Actualizando lista de pacientes...');
        await this.syncPacientesResumen();
      }

      if (syncDet && !this.cancelFlag) {
        this.syncProgress.set('Descargando detalles completos de pacientes...');
        await this.syncPacientesDetalle();
      }

      if (syncCon && !this.cancelFlag) {
        this.syncProgress.set('Actualizando consultas...');
        await this.syncConsultas();
      }

      this.lastSyncAt.set(new Date());
      const s = this.syncStats();
      const partes: string[] = [];
      if (s.pacientes) partes.push(`${s.pacientes} pacientes`);
      if (s.detalles) partes.push(`${s.detalles} con detalle`);
      if (s.consultas) partes.push(`${s.consultas} consultas`);
      this.syncProgress.set(partes.length ? `Sincronizado: ${partes.join(' · ')}` : 'Sin cambios');
    } catch (err) {
      if ((err as Error)?.message === 'Sincronización cancelada por el usuario') {
        this.syncProgress.set('⏹ Sincronización cancelada');
      } else {
        console.error('Error en sincronización completa:', err);
        this.syncProgress.set('Error en sincronización');
      }
    } finally {
      this.syncState.set('idle');
      this.isSyncing.set(false);
    }
  }

  private async syncPacientesResumen(): Promise<void> {
    const todos: Paciente[] = [];
    let skip = 0;
    let total = 0;

    // `/pacientes/buscar` ordena por id descendente: skip=0 es el último paciente
    // creado, de modo que se descarga de lo más nuevo hasta llegar a MAX_RECORDS.
    do {
      await this.checkPauseCancel();

      const limite = Math.min(this.PAGE_SIZE, this.MAX_RECORDS - todos.length);
      const params = new HttpParams()
        .set('skip', skip.toString())
        .set('limit', limite.toString());

      const res = await firstValueFrom(
        this.http.get<PacienteListResponse>(`${this.api.baseUrl}/pacientes/buscar`, { params })
      );

      if (total === 0) total = res.total;
      todos.push(...res.pacientes as any);
      skip += limite;
    } while (skip < total && todos.length < this.MAX_RECORDS && !this.cancelFlag);

    if (todos.length > 0) {
      await this.db.savePacientes(todos);
      await this.db.setSyncMeta('pacientes', todos.length);
      this.syncStats.update(s => ({ ...s, pacientes: todos.length }));
    }
  }

  private async syncPacientesDetalle(): Promise<void> {
    const pacientes = await this.db.getAllPacientes();
    const ids = pacientes.map(p => p.id);

    if (ids.length > this.FULL_DETAIL_THRESHOLD) {
      this.syncProgress.set(`Saltando detalle individual: ${ids.length} pacientes (umbral: ${this.FULL_DETAIL_THRESHOLD})`);
      return;
    }
    if (ids.length === 0) return;

    let count = 0;
    for (let i = 0; i < ids.length && !this.cancelFlag; i += this.CONCURRENCY) {
      await this.checkPauseCancel();
      const batch = ids.slice(i, i + this.CONCURRENCY);
      const results = await Promise.allSettled(
        batch.map(id =>
          firstValueFrom(
            this.http.get<Paciente>(`${this.api.baseUrl}/pacientes/${id}`)
          ).then(paciente => ({ id, paciente }))
        )
      );

      const actualizados: Paciente[] = [];
      for (const r of results) {
        if (r.status === 'fulfilled') {
          actualizados.push(r.value.paciente);
          count++;
        }
      }

      if (actualizados.length > 0) {
        await this.db.savePacientes(actualizados);
      }

      this.syncProgress.set(`Detalles: ${count}/${ids.length} pacientes`);
    }

    this.syncStats.update(s => ({ ...s, detalles: count }));
    await this.db.setSyncMeta('pacientes_detalle', count);
  }

  private async syncConsultas(): Promise<void> {
    const todas: any[] = [];
    let skip = 0;
    let total = 0;

    // `GET /consultas/` ordena por id descendente: skip=0 es la última consulta
    // creada, de modo que se descarga de lo más nuevo hasta llegar a MAX_RECORDS.
    do {
      await this.checkPauseCancel();

      const limite = Math.min(this.PAGE_SIZE, this.MAX_RECORDS - todas.length);
      const params = new HttpParams()
        .set('skip', skip.toString())
        .set('limit', limite.toString());

      const res = await firstValueFrom(
        this.http.get<ConsultaListResponse>(`${this.api.baseUrl}/consultas/`, { params })
      );

      if (total === 0) total = res.total;
      todas.push(...res.consultas);
      skip += limite;
    } while (skip < total && todas.length < this.MAX_RECORDS && !this.cancelFlag);

    if (todas.length > 0) {
      await this.db.saveConsultas(todas);
      await this.db.setSyncMeta('consultas', todas.length);
      this.syncStats.update(s => ({ ...s, consultas: todas.length }));
    }
  }

  /** Actualiza el detalle local de un paciente; devuelve null si falla la API. */
  async syncPacienteDetail(id: number): Promise<Paciente | null> {
    try {
      const paciente = await firstValueFrom(
        this.http.get<Paciente>(`${this.api.baseUrl}/pacientes/${id}`)
      );
      await this.db.savePacientes([paciente]);
      return paciente;
    } catch {
      return null;
    }
  }

  /** Resume conteos locales y fechas de la última sincronización completa. */
  async getSyncStatus(): Promise<{
    pacientes: { count: number; syncedAt: Date | null };
    consultas: { count: number; syncedAt: Date | null };
  }> {
    const [pMeta, cMeta, pCount, cCount] = await Promise.all([
      this.db.getSyncMeta('pacientes'),
      this.db.getSyncMeta('consultas'),
      this.db.countPacientes(),
      this.db.countConsultas(),
    ]);
    return {
      pacientes: { count: pCount, syncedAt: pMeta ? new Date(pMeta.timestamp) : null },
      consultas: { count: cCount, syncedAt: cMeta ? new Date(cMeta.timestamp) : null },
    };
  }
}
