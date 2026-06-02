import { Injectable } from '@angular/core';
import Dexie, { type Table } from 'dexie';

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;
}

export interface PendingMutation {
  id?: number;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  body?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retries: number;
}

@Injectable({ providedIn: 'root' })
export class OfflineDatabaseService extends Dexie {
  cache!: Table<CacheEntry, string>;
  mutations!: Table<PendingMutation, number>;

  constructor() {
    super('Hospital3OfflineDB');
    this.version(1).stores({
      cache: 'key',
      mutations: '++id'
    });
  }

  async getCached<T>(key: string): Promise<T | null> {
    const entry = await this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
      await this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  async setCache(key: string, data: any, ttl: number = 5 * 60 * 1000): Promise<void> {
    await this.cache.put({ key, data, timestamp: Date.now(), ttl });
  }

  async clearCache(): Promise<void> {
    await this.cache.clear();
  }

  async addMutation(mutation: Omit<PendingMutation, 'id'>): Promise<number> {
    return this.mutations.add(mutation as PendingMutation);
  }

  async getPendingMutations(): Promise<PendingMutation[]> {
    return this.mutations.orderBy('timestamp').toArray();
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
}
