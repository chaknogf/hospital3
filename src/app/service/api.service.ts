import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { Router } from '@angular/router';
import { Paciente, Usuarios, Correlativo, Municipio, Totales } from '../interface/interfaces';
import { ConsultaBase, ConsultaResponse } from '../interface/consultas';
import { BehaviorSubject } from 'rxjs';
import { __param } from 'tslib';
@Injectable({ providedIn: 'root' })
export class ApiService {
  private api: AxiosInstance;
  public readonly baseUrl = 'https://hgtecpan.duckdns.org/fah';
  public token: string | null = null;
  public username: string | null = null;
  public role: string | null = null;
  private ultimoFiltroPaciente: any = { skip: 0, limit: 6 };
  private ultimoFiltroConsulta: any = { skip: 0, limit: 6 };
  private pacientesSubject = new BehaviorSubject<Paciente[]>([]);
  pacientes$ = this.pacientesSubject.asObservable();
  private consultasSubject = new BehaviorSubject<ConsultaResponse[]>([]);
  consultas$ = this.consultasSubject.asObservable();
  private ordenesSubject = new BehaviorSubject<any>({});
  public ordenes$ = this.ordenesSubject.asObservable();




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
      this.ultimoFiltroPaciente = filtros; // 👈 guardar el filtro actual
      const filtrosLimpiados = this.limpiarParametros(filtros);

      const response = await this.api.get<Paciente[]>('/pacientes/', {
        params: filtrosLimpiados
      });

      this.pacientesSubject.next(response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener pacientes:', error);
      throw error;
    }
  }

  async refreshPacientes() {   // 👈 nueva función
    return this.getPacientes(this.ultimoFiltroPaciente);
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
  async crearPaciente(paciente: Paciente, generar_expediente: boolean = false): Promise<any> {
    const url = generar_expediente ? '/paciente/crear/?gen_expediente=true' : '/paciente/crear/';
    const response = await this.api.post(url, paciente, {
      headers: { 'Content-Type': 'application/json' }
    });

    // Refrescar lista de pacientes después de crear
    await this.refreshPacientes();

    return response.data;
  }

  async updatePaciente(pacienteId: number, paciente: any, accion: string): Promise<any> {
    const response = await this.api.put(
      `/paciente/actualizar/${pacienteId}?accion_expediente=${accion}`,
      paciente,
      { headers: { 'Content-Type': 'application/json' } }
    );
    await this.refreshPacientes();  // 👈 refrescar lista
    return response.data;
  }

  async deletePaciente(pacienteId: number): Promise<any> {
    const response = await this.api.delete(`/paciente/eliminar/${pacienteId}`);
    await this.refreshPacientes();  // 👈 refrescar lista
    return response.data[0];
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

  enviarOrdenes(ordenes: any) {
    this.ordenesSubject.next(ordenes);
  }

  async getConsultas(filtros: any): Promise<any> {
    try {
      this.ultimoFiltroConsulta = filtros;
      const filtrosLimpiados = this.limpiarParametros(filtros);
      // console.log(filtrosLimpiados)
      const response = await this.api.get<ConsultaResponse[]>('/consultas/', {
        params: filtrosLimpiados


      });

      this.consultasSubject.next(response.data);

      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener consultas:', error);
      throw error;
    }
  }
  async refreshConsultas() {
    return this.getConsultas(this.ultimoFiltroConsulta);
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
    const response = await this.api.post('/consulta/crear/', consulta, {
      headers: { 'Content-Type': 'application/json' }
    });
    await this.refreshConsultas();
    //console.log(response.data);
    return response.data;

  }

  async updateConsulta(consultaId: any, consulta: any): Promise<any> {
    const response = await this.api.put(
      `/consulta/actualizar/${consultaId}`,
      consulta,
      { headers: { 'Content-Type': 'application/json' } }
    );
    await this.refreshConsultas();
    return response.data;
  }

  async deleteConsulta(consultaId: number): Promise<any> {
    const response = await this.api.delete(`/consulta/eliminar/${consultaId}`);
    await this.refreshConsultas();
    return response.data[0];
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

  ///////////////////////
  // totales
  //////////////////////




  async getTotales(): Promise<Totales[]> {
    try {
      const response = await this.api.get<Totales[]>('/totales/');
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener totales:', error);
      throw error;
    }
  }

}
