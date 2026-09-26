import { Injectable } from '@angular/core';
import Dexie, { type Table } from 'dexie';
import { Paciente } from '../interface/interfaces';
import { ConsultaOut } from '../interface/consultas';

/** Entrada persistida en IndexedDB; el TTL se evalúa al leer, no mediante temporizadores. */
export interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;
}

/** Mutación local pendiente de enviar al servidor cuando se recupere la conexión. */
export interface PendingMutation {
  id?: number;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  body?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retries: number;
  stalled?: boolean;
  lastError?: string;
}

/** Marca temporal y cantidad asociadas a una descarga completa de datos. */
export interface SyncMeta {
  key: string;
  timestamp: number;
  total: number;
}

/** Persistencia offline compartida para caché, sincronización y datos clínicos locales. */
@Injectable({ providedIn: 'root' })
export class OfflineDatabaseService extends Dexie {
  cache!: Table<CacheEntry, string>;
  mutations!: Table<PendingMutation, number>;
  syncMeta!: Table<SyncMeta, string>;
  pacientes!: Table<Paciente, number>;
  consultas!: Table<ConsultaOut, number>;

  constructor() {
    super('Hospital3OfflineDB');
    this.version(2).stores({
      cache: 'key',
      mutations: '++id',
      syncMeta: 'key',
      pacientes: 'id, nombre_completo, expediente, sexo',
      consultas: 'id, paciente_id, especialidad, servicio, fecha_consulta, ultimo_estado'
    }).upgrade(tx => {
      tx.table('cache').clear();
    });
  }

  /** Lee una entrada y elimina de IndexedDB la que ya superó su TTL. */
  async getCached<T>(key: string): Promise<T | null> {
    const entry = await this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
      await this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  /** Guarda el valor junto con la hora de escritura y su vigencia en milisegundos. */
  async setCache(key: string, data: any, ttl: number = 5 * 60 * 1000): Promise<void> {
    await this.cache.put({ key, data, timestamp: Date.now(), ttl });
  }

  async clearCache(): Promise<void> {
    await this.cache.clear();
  }

  /** Persiste una mutación antes de devolver su identificador para permitir reintentos. */
  async addMutation(mutation: Omit<PendingMutation, 'id'>): Promise<number> {
    return this.mutations.add(mutation as PendingMutation);
  }

  async getPendingMutations(): Promise<PendingMutation[]> {
    return this.mutations.toArray();
  }

  async getPendingCount(): Promise<number> {
    return this.mutations.count();
  }

  async deleteMutation(id: number): Promise<void> {
    await this.mutations.delete(id);
  }

  async clearMutations(): Promise<void> {
    await this.mutations.clear();
  }

  async savePacientes(pacientes: Paciente[]): Promise<void> {
    await this.pacientes.bulkPut(pacientes);
  }

  async deletePacienteLocal(id: number): Promise<void> {
    await this.pacientes.delete(id);
  }

  async getAllPacientes(): Promise<Paciente[]> {
    return this.pacientes.toArray();
  }

  async getPacienteById(id: number): Promise<Paciente | undefined> {
    return this.pacientes.get(id);
  }

  async searchPacientesLocal(query: string): Promise<Paciente[]> {
    const q = query.toLowerCase();
    return this.pacientes.filter(p =>
      (p.nombre_completo?.toLowerCase().includes(q) ?? false) ||
      (p.expediente?.toLowerCase().includes(q) ?? false) ||
      (p.cui?.toString().includes(q) ?? false)
    ).toArray();
  }

  async saveConsultas(consultas: ConsultaOut[]): Promise<void> {
    await this.consultas.bulkPut(consultas);
  }

  async getAllConsultas(): Promise<ConsultaOut[]> {
    return this.consultas.toArray();
  }

  async getConsultaById(id: number): Promise<ConsultaOut | undefined> {
    return this.consultas.get(id);
  }

  async getConsultasByPacienteId(pacienteId: number): Promise<ConsultaOut[]> {
    return this.consultas.where('paciente_id').equals(pacienteId).toArray();
  }

  async setSyncMeta(key: string, total: number): Promise<void> {
    await this.syncMeta.put({ key, timestamp: Date.now(), total });
  }

  async getSyncMeta(key: string): Promise<SyncMeta | undefined> {
    return this.syncMeta.get(key);
  }

  async countPacientes(): Promise<number> {
    return this.pacientes.count();
  }

  async countConsultas(): Promise<number> {
    return this.consultas.count();
  }

  /** Borra explícitamente todas las tablas locales, incluida la cola pendiente. */
  async clearAllData(): Promise<void> {
    await this.pacientes.clear();
    await this.consultas.clear();
    await this.cache.clear();
    await this.mutations.clear();
    await this.syncMeta.clear();
  }

  /** Conserva la información local al cerrar sesión para no perder trabajo offline. */
  async clearOnLogout(): Promise<void> {
    // NO limpiar `mutations`: las creaciones/actualizaciones de pacientes hechas
    // sin conexión son datos del usuario y deben conservarse para sincronizar
    // al volver a iniciar sesión. Borrarlas causaría pérdida de registros.
    // Solo se limpian caché/metadata volátil si hiciera falta (aquí se conservan
    // para no re-descargar todo en cada login/refresh).
  }
}
