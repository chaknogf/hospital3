import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { Router } from '@angular/router';
import { Paciente, Usuarios, Correlativo, Municipio } from '../interface/interfaces';
import { ConsultaBase } from '../interface/consultas';
@Injectable({ providedIn: 'root' })
export class ApiService {
  private api: AxiosInstance;
  public readonly baseUrl = 'https://hgtecpan.duckdns.org/fah';
  public token: string | null = null;
  public username: string | null = null;
  public role: string | null = null;

  constructor(
    private router: Router,
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

  /**
   * Inicia sesión con las credenciales del usuario.
   * @param username Usuario
   * @param password Contraseña
   */


  limpiarParametros(filtros: any): any {
    const filtrosLimpiados: any = {};
    for (const key in filtros) {
      if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
        filtrosLimpiados[key] = filtros[key];
      }
    }
    return filtrosLimpiados;
  }

  async login(username: string, password: string): Promise<void> {
    const response = await this.api.post('/auth/login', new URLSearchParams({ username, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const token = response.data.access_token;
    if (token) {
      localStorage.setItem('access_token', token);
      this.getCurrentUser();
      // console.log('🔑 Atenticado');
      this.router.navigate(['/dash']);
    } else {
      throw new Error('No se recibió el token.');

    }
  }

  /**
   * Obtiene la información del usuario autenticado.
   */
  async getCurrentUser(): Promise<any> {
    const token = localStorage.getItem('access_token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');


    if (!token) {
      throw new Error('🔒 No estás autenticado.');
    }

    try {
      const response = await this.api.get('/auth/me', {
        headers: {
          usuario: username || '',
          rol: role || ''
        }
      });

      const { username: nombreUsuario, role: rolUsuario } = response.data;

      localStorage.setItem('username', nombreUsuario);
      localStorage.setItem('role', rolUsuario);
      //window.location.reload();

      // console.log('✅ Usuario autenticado:', response.data);
      //console.log(username, role);
      return response.data;

    } catch (error) {
      console.error('❌ Error al obtener usuario actual:', error);
      throw error;
    }
  }

  logOut() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    // window.location.reload();
    this.router.navigate(['/inicio']);



  }
  ///////////////////
  // ======= USERS =======
  ///////////////////


  async getUsers(filtros: any): Promise<any> {
    try {
      const response = await this.api.get<Usuarios[]>('/user/', {
        params: filtros
      });
      // console.log('👤 Usuarios obtenidos correctamente', response);
      return response.data;

    } catch (error) {
      console.error('❌ Error al obtener usuarios:', error);
      throw error;
    }
  }

  async getUser(id: number): Promise<any> {
    try {
      const response = await this.api.get<Usuarios[]>(`/user/?id=${id}&skip=0&limit=1`);
      // console.log('👤 Usuarios obtenidos correctamente', response);
      return response.data;

    } catch (error) {
      console.error('❌ Error al obtener usuarios:', error)
      throw error;
    }
  }

  async createUser(user: any): Promise<any> {
    try {
      const response = await this.api.post('/user/crear', user);
      // console.log('👤 Usuario creado correctamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear usuario:', error);
      throw error;
    }
  }

  async updateUser(userId: number, user: any): Promise<any> {
    try {
      const response = await this.api.put(`/user/actualizar/${userId}`, user);
      // console.log('👤 Usuario actualizado correctamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar usuario:', error);
      throw error;
    }
  }

  async deleteUser(userId: number | string): Promise<any> {
    try {
      const response = await this.api.delete(`/user/eliminar/${userId}`);
      // console.log('👤 Usuario eliminado correctamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al eliminar usuario:', error);
      throw error;
    }
  }

  ///////////////////
  // pacientes
  ///////////////////
  async getPacientes(filtros: any): Promise<any> {
    try {
      const filtrosLimpiados = this.limpiarParametros(filtros);
      const response = await this.api.get<Paciente[]>('/pacientes/', {
        params: filtrosLimpiados
      });
      // console.log('👤 Pacientes obtenidos correctamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener pacientes:', error);
      throw error;
    }
  }

  async getPaciente(id: number): Promise<Paciente> {
    try {
      const response = await this.api.get<Paciente[]>(`/pacientes/?id=${id}&skip=0&limit=1`);
      // console.log('👤 Paciente obtenido correctamente');
      return response.data[0];

    } catch (error) {
      console.error('❌ Error al obtener paciente:', error);
      throw error;
    }
  }
  async createPaciente(paciente: any): Promise<any> {
    try {
      const response = await this.api.post(
        '/paciente/crear/', paciente,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      // console.log('👤 Paciente creado correctamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear paciente:', error);
      throw error;
    }
  }


  async updatePaciente(pacienteId: number, paciente: any): Promise<any> {
    try {
      const response = await this.api.put(
        `/paciente/actualizar/${pacienteId}`,
        paciente,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      // console.log('👤 Paciente actualizado correctamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar paciente:', error);
      throw error;
    }
  }

  async deletePaciente(pacienteId: number): Promise<any> {
    try {
      const response = await this.api.delete(`/paciente/eliminar/${pacienteId}`);
      // console.log('👤 Paciente eliminado correctamente');
      return response.data[0];
    } catch (error) {
      console.error('❌ Error al eliminar paciente:', error);
      throw error;
    }
  }


  ///////////////////
  // correlativos
  /////////////////
  async corExpediente(): Promise<string> {
    try {
      const response = await this.api.post<{ 'correlativo': string }>('/generar/expediente');
      // console.log('👤 Correlativo obtenido correctamente:', response.data['correlativo']);
      return response.data['correlativo'];
    } catch (error) {
      console.error('❌ Error al obtener correlativo:', error);
      console.log(error);
      throw error;
    }
  }


  ///////////////////
  // municipios
  ///////////////////
  async getMunicipios(filtros: any): Promise<any> {
    try {
      const response = await this.api.get('/municipios/', {
        params: filtros
      });
      // console.log('👤 Municipios obtenidos correctamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener municipios:', error);
      throw error;
    }
  }

  async getCodigoMunicipio(codigo: string): Promise<any> {
    try {
      const response = await this.api.get<Municipio>(`/municipios/?codigo=${codigo}&skip=0&limit=1`);
      // console.log('👤 Municipio obtenido correctamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener municipio:', error);
      throw error;
    }
  }


  async createMunicipio(municipio: any): Promise<any> {
    try {
      const response = await this.api.post('/municipio/crear', municipio);
      // console.log('👤 Municipio creado correctamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear municipio:', error);
      throw error;
    }
  }

  async updateMunicipio(codigo: string, municipio: any): Promise<any> {
    try {
      const response = await this.api.put(`/municipio/actualizar/${codigo}`, municipio);
      // console.log('👤 Municipio actualizado correctamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar municipio:', error);
      throw error;
    }
  }

  async deleteMunicipio(codigo: string): Promise<any> {
    try {
      const response = await this.api.delete(`/municipio/eliminar/${codigo}`);
      // console.log('👤 Municipio eliminado correctamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al eliminar municipio:', error);
      throw error;
    }
  }
  ///////////////////
  // paises_iso
  ///////////////////
  async getPaisesIso(): Promise<any> {
    try {
      const response = await this.api.get('/paises_iso/');
      // console.log('👤 paises obtenidos correctamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener municipios:', error);
      throw error;
    }
  }

  async getRenapITD(filtros: any): Promise<any> {
    try {
      const filtrosLimpiados = this.limpiarParametros(filtros);
      const response = await this.api.get('/renap-persona', {
        params: filtros
      });
      // console.log('👤 Datos del servidor obtenidos con exito');
      //console.table(response.data.resultado);
      return response.data.resultado;
    } catch (error) {
      console.error('❌ Error al obtener datos:', error);
      throw error;
    }
  }


  ///////////////////
  // consultas
  ///////////////////


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

  async getConsulta(filtros: any): Promise<any> {
    try {
      const filtrosLimpiados = this.limpiarParametros(filtros);
      const response = await this.api.get<ConsultaBase[]>('/consulta/', {
        params: filtrosLimpiados

      })
      // console.log('👤 Consulta obtenida correctamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener consulta:', error);
      throw error;
    }
  }

  async getConsultaId(id_consulta: number): Promise<any> {
    try {
      const response = await this.api.get<ConsultaBase[]>('/consulta/?id_consulta=' + id_consulta);
      // console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener consulta:', error);
      throw error;
    }
  }

  async crearConsulta(consulta: any): Promise<any> {
    try {
      const response = await this.api.post(
        '/consulta/crear/', consulta,
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

  async updateConsulta(consultaId: any, consulta: any): Promise<any> {
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
