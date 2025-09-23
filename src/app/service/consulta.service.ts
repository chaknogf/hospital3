import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class ConsultaService {
  private api: AxiosInstance;
  public baseUrl = 'https://hgtecpan.duckdns.org/fah';
  public token: string | null = null;
  public username: string | null = null;
  public role: string | null = null;

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
        //console.log('🛰️ Interceptor ejecutado:', config);
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
      // console.log('👤 Consultas obtenidas correctamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener consultas:', error);
      throw error;
    }
  }

  async getConsulta(id: number): Promise<any> {
    try {
      const response = await this.api.get(`/consulta/?id=${id}&skip=0&limit=1`);
      // console.log('👤 Consulta obtenida correctamente');
      return response.data[0];
    } catch (error) {
      console.error('❌ Error al obtener consulta:', error);
      throw error;
    }
  }

  async crearConsulta(consulta: any): Promise<any> {
    try {
      const response = await this.api.post(
        '/consulta/crear', consulta,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      // console.log('👤 Consulta creada correctamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear consulta:', error);
      throw error;
    }
  }

  async updateConsulta(consultaId: number, consulta: any): Promise<any> {
    try {
      const response = await this.api.put(
        `/consulta/actualizar/${consultaId}`
        , consulta,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        });
      // console.log('👤 Consulta actualizada correctamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar consulta:', error);
      throw error;
    }
  }

  async deleteConsulta(id: number): Promise<any> {
    try {
      const response = await this.api.delete(`/consulta/eliminar/${id}`);
      // console.log('👤 Consulta eliminada correctamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al eliminar consulta:', error);
      throw error;
    }
  }

  async corEmergencia(): Promise<any> {
    try {
      const response = await this.api.post<{ 'correlativo': string }>('/generar/emergencia');
      // console.log('👤 Correlativo obtenido correctamente:', response.data['correlativo']);
      return response.data['correlativo'];
    } catch (error) {
      console.error('❌ Error al obtener correlativo:', error);
      throw error;
    }
  }


}
