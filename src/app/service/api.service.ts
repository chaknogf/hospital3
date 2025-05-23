import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { Router } from '@angular/router';
import { Usuarios } from '../interface/interfaces';
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
  async login(username: string, password: string): Promise<void> {
    const response = await this.api.post('/auth/login', new URLSearchParams({ username, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const token = response.data.access_token;
    if (token) {
      localStorage.setItem('access_token', token);
      this.getCurrentUser();
      console.log('🔑 Atenticado');
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

      console.log('✅ Usuario autenticado:', response.data);
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
    window.location.reload();


  }

  // ======= USERS =======



  async getUsers(filtros: any): Promise<any> {
    try {
      const response = await this.api.get<Usuarios[]>('/user/', {
        params: filtros
      });
      console.log('👤 Usuarios obtenidos correctamente', response);
      return response.data;

    } catch (error) {
      console.error('❌ Error al obtener usuarios:', error);
      throw error;
    }
  }

  async getUser(id: number): Promise<any> {
    try {
      const response = await this.api.get<Usuarios[]>(`/user/?id=${id}&skip=0&limit=1`);
      console.log('👤 Usuarios obtenidos correctamente', response);
      return response.data;

    } catch (error) {
      console.error('❌ Error al obtener usuarios:', error)
      throw error;
    }
  }

  async createUser(user: any): Promise<any> {
    try {
      const response = await this.api.post('/user/crear', user);
      console.log('👤 Usuario creado correctamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear usuario:', error);
      throw error;
    }
  }

  async updateUser(userId: number | string, user: any): Promise<any> {
    try {
      const response = await this.api.put(`/user/actualizar/${userId}`, user);
      console.log('👤 Usuario actualizado correctamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar usuario:', error);
      throw error;
    }
  }

  async deleteUser(userId: number | string): Promise<any> {
    try {
      const response = await this.api.delete(`/user/eliminar/${userId}`);
      console.log('👤 Usuario eliminado correctamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al eliminar usuario:', error);
      throw error;
    }
  }

}
