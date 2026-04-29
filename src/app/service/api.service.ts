// api.service.ts
import { ConsultasIdPaciente } from './../interface/consultas';
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { Paciente, Usuarios, Municipio, Totales, PacienteListResponse, Hijode, PacienteJoin } from '../interface/interfaces';
import { ConstanciaNacimientoOut, ConstanciaNacimientoCreate, ConstanciaNacHistorial, ConstanciaNacimientoUpdate } from '../interface/consNac';
import { ConsultaBase, ConsultaCreate, ConsultaOut, ConsultaResponse, ConsultaUpdate, Egreso, Indicador, RegistroConsultaCreate, RegistroConsultaResponse, SignosVitales, TotalesItem, TotalesResponse } from '../interface/consultas';
import { CicloClinico, EstadoCiclo } from '../interface/consultas';
import { FiltroConsulta, FiltroCitas } from '../interface/filtros.model';
import { CitaCreate, CitaResponse, Citas, CitasBase, CitaUpdate } from '../interface/citas';
import { Medico } from '../interface/medicos.interface';

export interface PaginationState {
  filtro: any;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'http://localhost:8000';

  // ======= SIGNALS =======
  token = signal<string | null>(null);
  username = signal<string | null>(null);
  role = signal<string | null>(null);
  isLoading = signal(false);




  // ======= ESTADO DE PAGINACIÓN =======
  private hoy(): string {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.cargarTokenDelStorage();
  }

  // ======= UTILITARIOS =======
  private cargarTokenDelStorage(): void {
    const token = localStorage.getItem('access_token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');

    if (token) {
      this.token.set(token);
      this.username.set(username);
      this.role.set(role);
    }
  }

  private limpiarParametros(filtros: any): HttpParams {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }

  // api.service.ts
  private manejarError(error: any, operacion: string) {
    console.error(`❌ Error al ${operacion}:`, error);

    if (error instanceof HttpErrorResponse && error.status === 401) {
      this.logOut();
    }

    return throwError(() => error);
  }

  // ======= AUTENTICACIÓN =======
  login(username: string, password: string): Observable<any> {
    this.isLoading.set(true);
    const body = new HttpParams()
      .set('username', username)
      .set('password', password);

    return this.http.post<{ access_token: string }>(
      `${this.baseUrl}/auth/login`, body
    ).pipe(
      tap(response => {
        if (!response.access_token) throw new Error('No se recibió el token.');

        localStorage.setItem('access_token', response.access_token);
        this.token.set(response.access_token);

        // ✅ Primero obtener el usuario, luego navegar (evita condición de carrera)
        this.getCurrentUser().subscribe({
          next: () => this.router.navigate(['/dash']),
          error: () => this.router.navigate(['/dash']) // navegar igual aunque falle /me
        });
      }),
      catchError(error => this.manejarError(error, 'iniciar sesión')),
      finalize(() => this.isLoading.set(false))
    );
  }

  getCurrentUser(): Observable<any> {
    return this.http.get<{ username: string; role: string }>(
      `${this.baseUrl}/auth/me`,
      {
        headers: {
          usuario: this.username() || '',
          rol: this.role() || ''
        }
      }
    ).pipe(
      tap(response => {
        localStorage.setItem('username', response.username);
        localStorage.setItem('role', response.role);
        this.username.set(response.username);
        this.role.set(response.role);
      }),
      catchError(error => this.manejarError(error, 'obtener usuario actual'))
    );
  }

  getUsuarioActual(): { username: string; role: string } {
    return {
      username:
        this.username() ??
        localStorage.getItem('username') ??
        'sistema',

      role:
        this.role() ??
        localStorage.getItem('role') ??
        'SIN_ROL'
    };
  }

  logOut(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    this.token.set(null);
    this.username.set(null);
    this.role.set(null);
    this.router.navigate(['/inicio']);
  }

  // ======= USUARIOS =======
  getUsers(filtros: any): Observable<Usuarios[]> {
    const params = this.limpiarParametros(filtros);
    return this.http.get<Usuarios[]>(`${this.baseUrl}/user/`, { params }).pipe(
      catchError(error => this.manejarError(error, 'obtener usuarios'))
    );
  }

  getUser(id: number): Observable<Usuarios> {
    const params = new HttpParams()
      .set('id', id.toString())
      .set('skip', '0')
      .set('limit', '1');

    return this.http.get<Usuarios>(`${this.baseUrl}/user/`, { params }).pipe(
      catchError(error => this.manejarError(error, 'obtener usuario'))
    );
  }

  createUser(user: any): Observable<any> {
    this.isLoading.set(true);
    return this.http.post<any>(`${this.baseUrl}/user/crear`, user).pipe(
      catchError(error => this.manejarError(error, 'crear usuario')),
      finalize(() => this.isLoading.set(false))
    );
  }

  updateUser(userId: number, user: any): Observable<any> {
    this.isLoading.set(true);
    return this.http.put<any>(`${this.baseUrl}/user/actualizar/${userId}`, user).pipe(
      catchError(error => this.manejarError(error, 'actualizar usuario')),
      finalize(() => this.isLoading.set(false))
    );
  }

  deleteUser(userId: number | string): Observable<any> {
    this.isLoading.set(true);
    return this.http.delete<any>(`${this.baseUrl}/user/eliminar/${userId}`).pipe(
      catchError(error => this.manejarError(error, 'eliminar usuario')),
      finalize(() => this.isLoading.set(false))
    );
  }




  // ======= CORRELATIVOS =======
  corExpediente(): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/correlativos/expediente`, {}
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener correlativo de expediente'))
    );
  }

  corEmergencia(): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/correlativos/emergencia`, {}
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener correlativo de emergencia'))
    );
  }

  corConstanciaNacimiento(): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/correlativos/constancia_nacimiento`, {}
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener correlativo de constancia nacimiento'))
    );
  }

  corConstanciaMedica(): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/correlativos/constancia_medica`, {}
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener correlativo de constancia médica'))
    );
  }

  corDefuncion(): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/correlativos/constancia_defuncion`, {}
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener correlativo de defunción'))
    );
  }

  // ======= MUNICIPIOS =======

  getDepartamentos(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/municipios/departamentos`).pipe(
      catchError(error => this.manejarError(error, 'obtener departamentos'))
    );
  }

  getMunicipios(filtros: any): Observable<any> {
    const params = this.limpiarParametros(filtros);
    return this.http.get<any>(`${this.baseUrl}/municipios/`, { params }).pipe(
      catchError(error => this.manejarError(error, 'obtener municipios'))
    );
  }

  getCodigoMunicipio(codigo: string): Observable<Municipio> {
    const params = new HttpParams()
      .set('codigo', codigo)
      .set('skip', '0')
      .set('limit', '1');

    return this.http.get<Municipio>(`${this.baseUrl}/municipios/`, { params }).pipe(
      catchError(error => this.manejarError(error, 'obtener municipio'))
    );
  }

  createMunicipio(municipio: any): Observable<any> {
    this.isLoading.set(true);
    return this.http.post<any>(`${this.baseUrl}/municipio/crear`, municipio).pipe(
      catchError(error => this.manejarError(error, 'crear municipio')),
      finalize(() => this.isLoading.set(false))
    );
  }

  updateMunicipio(codigo: string, municipio: any): Observable<any> {
    this.isLoading.set(true);
    return this.http.put<any>(`${this.baseUrl}/municipio/actualizar/${codigo}`, municipio).pipe(
      catchError(error => this.manejarError(error, 'actualizar municipio')),
      finalize(() => this.isLoading.set(false))
    );
  }

  deleteMunicipio(codigo: string): Observable<any> {
    this.isLoading.set(true);
    return this.http.delete<any>(`${this.baseUrl}/municipio/eliminar/${codigo}`).pipe(
      catchError(error => this.manejarError(error, 'eliminar municipio')),
      finalize(() => this.isLoading.set(false))
    );
  }

  // ======= PAÍSES ISO =======
  getPaisesIso(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/paises/`).pipe(
      catchError(error => this.manejarError(error, 'obtener países'))
    );
  }

  getRenapITD(filtros: any): Observable<any> {
    const params = this.limpiarParametros(filtros);
    return this.http.get<{ resultado: any }>(`${this.baseUrl}/renap-persona`, { params }).pipe(
      tap(response => response.resultado),
      catchError(error => this.manejarError(error, 'obtener datos RENAP'))
    );
  }

  //======== MEDICOS =============
  getMedicos(filtros: any): Observable<Medico[]> {
    this.isLoading.set(true);
    const params = this.limpiarParametros(filtros);

    return this.http.get<Medico[]>(`${this.baseUrl}/medicos/`, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener datos'))
    );
  }


}
