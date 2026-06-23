import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { OfflineDatabaseService } from './offline-database.service';
import { Paciente, PacienteListResponse } from '../interface/interfaces';
import { ConsultaListResponse } from '../interface/consultas';
import { BaseApiService } from './base-api.service';

const MS = { HORA: 3600000, DIA: 86400000 };

@Injectable({ providedIn: 'root' })
export class FullSyncService {
  private db = inject(OfflineDatabaseService);
  private http = inject(HttpClient);
  private api = inject(BaseApiService);

  isSyncing = signal(false);
  syncProgress = signal<string>('');
  lastSyncAt = signal<Date | null>(null);
  syncStats = signal<{ pacientes: number; detalles: number; consultas: number }>({ pacientes: 0, detalles: 0, consultas: 0 });

  private readonly PAGE_SIZE = 100;
  private readonly CONCURRENCY = 5;
  private readonly FULL_DETAIL_THRESHOLD = 4000;

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

  async syncAll(force: boolean = false): Promise<void> {
    if (this.isSyncing()) return;
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

      if (syncDet) {
        this.syncProgress.set('Descargando detalles completos de pacientes...');
        await this.syncPacientesDetalle();
      }

      if (syncCon) {
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
      console.error('Error en sincronización completa:', err);
      this.syncProgress.set('Error en sincronización');
      throw err;
    } finally {
      this.isSyncing.set(false);
    }
  }

  private async syncPacientesResumen(): Promise<void> {
    const todos: Paciente[] = [];
    let skip = 0;
    let total = 0;

    do {
      const params = new HttpParams()
        .set('skip', skip.toString())
        .set('limit', this.PAGE_SIZE.toString());

      const res = await firstValueFrom(
        this.http.get<PacienteListResponse>(`${this.api.baseUrl}/pacientes/`, { params })
      );

      if (total === 0) total = res.total;
      todos.push(...res.pacientes as any);
      skip += this.PAGE_SIZE;
    } while (skip < total);

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
    for (let i = 0; i < ids.length; i += this.CONCURRENCY) {
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

    do {
      const params = new HttpParams()
        .set('skip', skip.toString())
        .set('limit', this.PAGE_SIZE.toString());

      const res = await firstValueFrom(
        this.http.get<ConsultaListResponse>(`${this.api.baseUrl}/consultas/`, { params })
      );

      if (total === 0) total = res.total;
      todas.push(...res.consultas);
      skip += this.PAGE_SIZE;
    } while (skip < total);

    if (todas.length > 0) {
      await this.db.saveConsultas(todas);
      await this.db.setSyncMeta('consultas', todas.length);
      this.syncStats.update(s => ({ ...s, consultas: todas.length }));
    }
  }

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
