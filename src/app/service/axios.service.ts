import { Injectable, inject } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { Router } from '@angular/router';
import { ConsultaBase } from '../interface/consultas';
import { OfflineSyncService } from './offline-sync.service';


@Injectable({
  providedIn: 'root'
})
export class ConsultaService {
  private api: AxiosInstance;
  public baseUrl = 'https://hgtecpan.duckdns.org/fah';
  public token: string | null = null;
  public username: string | null = null;
  public role: string | null = null;
  private sync = inject(OfflineSyncService);

  constructor(
    private router: Router
  ) {

    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    this.api.interceptors.request.use(
      config => {
        const token = localStorage.getItem('access_token');

        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );
  }

  limpiarParametros(filtros: any): any {
    const filtrosLimpiados: any = {};
    for (const key in filtros) {
      if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
        filtrosLimpiados[key] = filtros[key];
      }
    }
    return filtrosLimpiados;
  }

  async getConsultas(filtros: any): Promise<any> {
    try {
      const filtrosLimpiados = this.limpiarParametros(filtros);
      const response = await this.api.get('/consultas/', {
        params: filtrosLimpiados
      });
      const key = this.sync.cacheKey(`${this.baseUrl}/consultas/`, JSON.stringify(filtros));
      await this.sync.setCachedData(key, response.data, 5 * 60 * 1000);
      return response.data;
    } catch (error: any) {
      if (!navigator.onLine || error?.response?.status === 0) {
        const key = this.sync.cacheKey(`${this.baseUrl}/consultas/`, JSON.stringify(filtros));
        const cached = await this.sync.getCachedData(key);
        if (cached) return cached;
      }
      console.error('❌ Error al obtener consultas:', error);
      throw error;
    }
  }

  async getConsulta(filtros: any): Promise<any> {
    try {
      const filtrosLimpiados = this.limpiarParametros(filtros);
      const response = await this.api.get<ConsultaBase[]>('/consulta/', {
        params: filtrosLimpiados
      })
      const key = this.sync.cacheKey(`${this.baseUrl}/consulta/`, JSON.stringify(filtros));
      await this.sync.setCachedData(key, response.data, 5 * 60 * 1000);
      return response.data;
    } catch (error: any) {
      if (!navigator.onLine || error?.response?.status === 0) {
        const key = this.sync.cacheKey(`${this.baseUrl}/consulta/`, JSON.stringify(filtros));
        const cached = await this.sync.getCachedData(key);
        if (cached) return cached;
      }
      console.error('❌ Error al obtener consulta:', error);
      throw error;
    }
  }

  async crearConsulta(consulta: any): Promise<any> {
    if (!navigator.onLine) {
      await this.sync.enqueueMutation('POST', `${this.baseUrl}/consulta/crear/`, consulta);
      return { queued: true, mensaje: 'Guardado localmente, se sincronizará cuando haya conexión' };
    }
    try {
      const response = await this.api.post(
        '/consulta/crear/', consulta,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 0 || error?.response?.status === 502 || error?.response?.status === 503) {
        await this.sync.enqueueMutation('POST', `${this.baseUrl}/consulta/crear/`, consulta);
        return { queued: true, mensaje: 'Guardado localmente, se sincronizará cuando haya conexión' };
      }
      console.error('❌ Error al crear consulta:', error);
      throw error;
    }
  }

  async updateConsulta(consultaId: number, consulta: any): Promise<any> {
    if (!navigator.onLine) {
      await this.sync.enqueueMutation('PUT', `${this.baseUrl}/consulta/actualizar/${consultaId}`, consulta);
      return { queued: true, mensaje: 'Guardado localmente, se sincronizará cuando haya conexión' };
    }
    try {
      const response = await this.api.put(
        `/consulta/actualizar/${consultaId}`
        , consulta,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        });
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 0 || error?.response?.status === 502 || error?.response?.status === 503) {
        await this.sync.enqueueMutation('PUT', `${this.baseUrl}/consulta/actualizar/${consultaId}`, consulta);
        return { queued: true, mensaje: 'Guardado localmente, se sincronizará cuando haya conexión' };
      }
      console.error('❌ Error al actualizar consulta:', error);
      throw error;
    }
  }

  async deleteConsulta(id: number): Promise<any> {
    if (!navigator.onLine) {
      await this.sync.enqueueMutation('DELETE', `${this.baseUrl}/consulta/eliminar/${id}`);
      return { queued: true, mensaje: 'Guardado localmente, se sincronizará cuando haya conexión' };
    }
    try {
      const response = await this.api.delete(`/consulta/eliminar/${id}`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 0 || error?.response?.status === 502 || error?.response?.status === 503) {
        await this.sync.enqueueMutation('DELETE', `${this.baseUrl}/consulta/eliminar/${id}`);
        return { queued: true, mensaje: 'Guardado localmente, se sincronizará cuando haya conexión' };
      }
      console.error('❌ Error al eliminar consulta:', error);
      throw error;
    }
  }

  async corEmergencia(): Promise<any> {
    if (!navigator.onLine) {
      const key = this.sync.cacheKey(`${this.baseUrl}/correlativo-emergencia`);
      const cached = await this.sync.getCachedData<{ correlativo: string }>(key);
      if (cached) return cached.correlativo;
      throw new Error('Sin conexión — no se puede generar correlativo');
    }
    try {
      const response = await this.api.post<{ 'correlativo': string }>('/generar/emergencia');
      return response.data['correlativo'];
    } catch (error) {
      console.error('❌ Error al obtener correlativo:', error);
      throw error;
    }
  }


}
