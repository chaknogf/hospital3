// api.service.ts
import { ConsultasIdPaciente } from './../interface/consultas';
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { OfflineSyncService } from './offline-sync.service';
import { Paciente, Usuarios, Municipio, Totales, PacienteListResponse, Hijode, PacienteJoin, Encamamiento } from '../interface/interfaces';
import { ConstanciaNacimientoOut, ConstanciaNacimientoCreate, ConstanciaNacHistorial, ConstanciaNacimientoUpdate } from '../interface/consNac';
import { ConsultaBase, ConsultaCreate, ConsultaListResponse, ConsultaOut, ConsultaResponse, ConsultaUpdate, Egreso, Indicador, RegistroConsultaCreate, RegistroConsultaResponse, TotalesItem, TotalesResponse } from '../interface/consultas';
import { CicloClinico, EstadoCiclo } from '../interface/consultas';
import { FiltroConsulta, FiltroCitas } from '../interface/filtros.model';
import { CitaCreate, CitaResponse, Citas, CitasBase, CitaUpdate } from '../interface/citas';
import { Medico } from '../interface/medicos.interface';
import { Usuario, UsuarioOut, UsersListResponse } from '../interface/usuarios.interface';
import { environment } from '@environments/environment';

export interface PaginationState {
  filtro: any;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  public readonly baseUrl = environment.apiUrl;
  // ======= SIGNALS =======
  token = signal<string | null>(null);
  username = signal<string | null>(null);
  role = signal<string | null>(null);
  nombreUsuario = signal<string | null>(null);
  isLoading = signal(false);

  private usuariosSubject = new BehaviorSubject<UsuarioOut[]>([]);
  usuarios$ = this.usuariosSubject.asObservable();



  // ======= ESTADO DE PAGINACIÓN =======
  private hoy(): string {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    private sync: OfflineSyncService
  ) {
    this.cargarTokenDelStorage();
  }

  private offMutation<T>(method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', url: string, body?: any): Observable<any> {
    const operacion = url.split('/').pop() || 'operación';
    if (!this.sync.isOnline()) {
      this.sync.enqueueMutation(method, url, body);
      return of({ queued: true, mensaje: 'Guardado localmente, se sincronizará cuando haya conexión' });
    }
    let req$: Observable<any>;
    switch (method) {
      case 'POST': req$ = this.http.post(url, body); break;
      case 'PUT': req$ = this.http.put(url, body); break;
      case 'PATCH': req$ = this.http.patch(url, body); break;
      case 'DELETE': req$ = this.http.delete(url); break;
    }
    return req$.pipe(
      catchError(error => {
        if (error.status === 0 || error.status === 502 || error.status === 503) {
          this.sync.enqueueMutation(method, url, body);
          return of({ queued: true, mensaje: 'Guardado localmente, se sincronizará cuando haya conexión' });
        }
        return this.manejarError(error, operacion);
      })
    );
  }

  // ======= UTILITARIOS =======
  private cargarTokenDelStorage(): void {
    const token = localStorage.getItem('access_token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const nombreUsuario = localStorage.getItem('nombreUsuario')

    if (token) {
      this.token.set(token);
      this.username.set(username);
      this.role.set(role);
      this.nombreUsuario.set(nombreUsuario)
    }
  }

  private limpiarParametros(filtros: any): HttpParams {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
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

  private preCacheAllPatients(): void {
    if (!this.sync.isOnline()) return;
    const limit = 100;
    const url = `${this.baseUrl}/pacientes/`;
    const ttl = 30 * 60 * 1000;

    this.http.get<PacienteListResponse>(url, { params: new HttpParams().set('skip', '0').set('limit', String(limit)) }).pipe(
      catchError(() => of(null))
    ).subscribe(firstResponse => {
      if (!firstResponse) return;
      const total = firstResponse.total;
      this.sync.setCachedData(
        this.sync.cacheKey(url, new HttpParams().set('skip', '0').set('limit', String(limit))),
        firstResponse, ttl
      );
      this.preCachePageSequentially(url, limit, limit, total, ttl);
    });
  }

  private preCachePageSequentially(url: string, skip: number, limit: number, total: number, ttl: number): void {
    if (skip >= total) return;
    const params = new HttpParams().set('skip', String(skip)).set('limit', String(limit));
    this.http.get<PacienteListResponse>(url, { params }).pipe(
      catchError(() => of(null))
    ).subscribe(data => {
      if (data) {
        this.sync.setCachedData(this.sync.cacheKey(url, params), data, ttl);
      }
      this.preCachePageSequentially(url, skip + limit, limit, total, ttl);
    });
  }

  private preCacheAllConsultations(): void {
    if (!this.sync.isOnline()) return;
    const limit = 100;
    const url = `${this.baseUrl}/consultas/`;
    const ttl = 30 * 60 * 1000;

    this.http.get<ConsultaListResponse>(url, { params: new HttpParams().set('skip', '0').set('limit', String(limit)) }).pipe(
      catchError(() => of(null))
    ).subscribe(firstResponse => {
      if (!firstResponse) return;
      const total = firstResponse.total;
      this.sync.setCachedData(
        this.sync.cacheKey(url, new HttpParams().set('skip', '0').set('limit', String(limit))),
        firstResponse, ttl
      );
      this.preCachePageSequentially(url, limit, limit, total, ttl);
    });
  }

  private preCacheReferenceData(): void {
    const ttl = 60 * 60 * 1000;
    this.sync.preCache(
      this.sync.cacheKey(`${this.baseUrl}/municipios/departamentos`),
      this.http.get(`${this.baseUrl}/municipios/departamentos`),
      ttl
    );
    this.sync.preCache(
      this.sync.cacheKey(`${this.baseUrl}/paises/`),
      this.http.get(`${this.baseUrl}/paises/`),
      ttl
    );
    this.preCacheAllPatients();
    this.preCacheAllConsultations();
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

        this.preCacheReferenceData();

        this.getCurrentUser().subscribe({
          next: () => this.router.navigate(['/dash']),
          error: () => this.router.navigate(['/dash'])
        });
      }),
      catchError(error => this.manejarError(error, 'iniciar sesión')),
      finalize(() => this.isLoading.set(false))
    );
  }

  getCurrentUser(): Observable<any> {
    return this.http.get<{ username: string; role: string, nombre: string }>(
      `${this.baseUrl}/auth/me`,
      {
        headers: {
          usuario: this.username() || '',
          rol: this.role() || '',
          nombre: this.nombreUsuario() || ''
        }
      }
    ).pipe(
      tap(response => {
        localStorage.setItem('username', response.username);
        localStorage.setItem('role', response.role);
        localStorage.setItem('nombreUsuario', response.nombre);
        this.username.set(response.username);
        this.role.set(response.role);
        this.nombreUsuario.set(response.nombre);

      }),
      catchError(error => this.manejarError(error, 'obtener usuario actual'))
    );
  }

  getUsuarioActual(): { username: string; role: string, nombre: string } {
    return {
      username:
        this.username() ??
        localStorage.getItem('username') ??
        'sistema',

      role:
        this.role() ??
        localStorage.getItem('role') ??
        'SIN_ROL',

      nombre:
        this.nombreUsuario() ??
        localStorage.getItem('nombreUsuario') ??
        ''
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
  getUsers(filtros: any): Observable<UsersListResponse> {
    const params = this.limpiarParametros(filtros);
    const key = this.sync.cacheKey(`${this.baseUrl}/users/`, params);
    return this.sync.cacheGet(key,
      this.http.get<UsersListResponse>(`${this.baseUrl}/users/`, { params }).pipe(
        tap(response => this.usuariosSubject.next(response.usuarios)),
        catchError(error => this.manejarError(error, 'obtener usuarios'))
      )
    );
  }

  getUser(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/users/${id}`).pipe(
      catchError(error => this.manejarError(error, 'obtener usuario'))
    );
  }

  createUser(user: any): Observable<any> {
    this.isLoading.set(true);
    return this.offMutation('POST', `${this.baseUrl}/users/`, user).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  passReset(user: any): Observable<any> {
    this.isLoading.set(true);
    return this.offMutation('PATCH', `${this.baseUrl}/users/recuperar`, user).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  updateUser(userId: number, user: any): Observable<any> {
    this.isLoading.set(true);
    return this.offMutation('PUT', `${this.baseUrl}/users/${userId}`, user).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  deleteUser(userId: number | string): Observable<any> {
    this.isLoading.set(true);
    return this.offMutation('DELETE', `${this.baseUrl}/user/eliminar/${userId}`).pipe(
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
    const key = this.sync.cacheKey(`${this.baseUrl}/municipios/departamentos`);
    return this.sync.cacheGet(key,
      this.http.get<any>(`${this.baseUrl}/municipios/departamentos`).pipe(
        catchError(error => this.manejarError(error, 'obtener departamentos'))
      ),
      30 * 60 * 1000
    );
  }

  getMunicipios(filtros: any): Observable<any> {
    const params = this.limpiarParametros(filtros);
    const key = this.sync.cacheKey(`${this.baseUrl}/municipios/`, params);
    return this.sync.cacheGet(key,
      this.http.get<any>(`${this.baseUrl}/municipios/`, { params }).pipe(
        catchError(error => this.manejarError(error, 'obtener municipios'))
      ),
      30 * 60 * 1000
    );
  }

  getCodigoMunicipio(codigo: string): Observable<Municipio> {
    const params = new HttpParams()
      .set('codigo', codigo)
      .set('skip', '0')
      .set('limit', '1');
    const key = this.sync.cacheKey(`${this.baseUrl}/municipios/`, params);
    return this.sync.cacheGet(key,
      this.http.get<Municipio>(`${this.baseUrl}/municipios/`, { params }).pipe(
        catchError(error => this.manejarError(error, 'obtener municipio'))
      ),
      30 * 60 * 1000
    );
  }

  createMunicipio(municipio: any): Observable<any> {
    this.isLoading.set(true);
    return this.http.post<any>(`${this.baseUrl}/municipios/`, municipio).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'crear municipio'))
    );
  }

  updateMunicipio(codigo: string, municipio: any): Observable<any> {
    this.isLoading.set(true);
    return this.http.put<any>(`${this.baseUrl}/municipios/${codigo}`, municipio).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'actualizar municipio'))
    );
  }

  deleteMunicipio(codigo: string): Observable<any> {
    this.isLoading.set(true);
    return this.http.delete<any>(`${this.baseUrl}/municipios/${codigo}`).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'eliminar municipio'))
    );
  }

  // ======= ENCAMAMIENTO =======
  getServiciosEncamamiento(activo?: boolean | null): Observable<any> {
    this.isLoading.set(true);
    let params = new HttpParams();
    if (activo !== null && activo !== undefined) {
      params = params.set('activo', activo.toString());
    }
    return this.http.get<any>(`${this.baseUrl}/encamamiento/`, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener servicios encamamiento'))
    );
  }

  createServicioEncamamiento(data: any): Observable<any> {
    this.isLoading.set(true);
    return this.http.post<any>(`${this.baseUrl}/encamamiento/`, data).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'crear servicio encamamiento'))
    );
  }

  updateServicioEncamamiento(id: number, data: any): Observable<any> {
    this.isLoading.set(true);
    return this.http.patch<any>(`${this.baseUrl}/encamamiento/${id}`, data).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'actualizar servicio encamamiento'))
    );
  }

  deleteServicioEncamamiento(id: number): Observable<any> {
    this.isLoading.set(true);
    return this.http.delete<any>(`${this.baseUrl}/encamamiento/${id}`).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'eliminar servicio encamamiento'))
    );
  }

  // ======= PAÍSES ISO =======
  getPaisesIso(): Observable<any> {
    const key = this.sync.cacheKey(`${this.baseUrl}/paises/`);
    return this.sync.cacheGet(key,
      this.http.get<any>(`${this.baseUrl}/paises/`).pipe(
        catchError(error => this.manejarError(error, 'obtener países'))
      ),
      30 * 60 * 1000
    );
  }

  getRenapITD(filtros: any): Observable<any> {
    const params = this.limpiarParametros(filtros);
    const key = this.sync.cacheKey(`${this.baseUrl}/renap-persona`, params);
    return this.sync.cacheGet(key,
      this.http.get<{ resultado: any }>(`${this.baseUrl}/renap-persona`, { params }).pipe(
        tap(response => response.resultado),
        catchError(error => this.manejarError(error, 'obtener datos RENAP'))
      ),
      10 * 60 * 1000
    );
  }

  // ======= PACIENTES MERGE =======
  mergePacientes(principalId: number, ids: number[]): Observable<any> {
    this.isLoading.set(true);
    let params = new HttpParams()
      .set('principal_id', principalId.toString());
    ids.forEach(id => {
      params = params.append('ids', id.toString());
    });
    return this.http.post<any>(`${this.baseUrl}/pacientes/merge`, null, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'fusionar pacientes'))
    );
  }

  // ======= ESTADÍSTICAS / REPORTES (back_sys/modules/estadisticas/) =======
  getPacientesAtendidos(desde: string, hasta: string): Observable<any> {
    this.isLoading.set(true);
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<any>(`${this.baseUrl}/estadisticas/consultas/pacientesAtendidos`, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener pacientes atendidos'))
    );
  }

  getHospitalizacionInfantil(desde: string, hasta: string): Observable<any> {
    this.isLoading.set(true);
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<any>(`${this.baseUrl}/estadisticas/consultas/hospitalizacion-infantil`, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener hospitalización infantil'))
    );
  }

  getPromedioDiario(desde: string, hasta: string): Observable<any> {
    this.isLoading.set(true);
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<any>(`${this.baseUrl}/estadisticas/consultas/promedioDiario`, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener promedio diario'))
    );
  }

  getPersonalHospital(desde: string, hasta: string): Observable<any> {
    this.isLoading.set(true);
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<any>(`${this.baseUrl}/estadisticas/consultas/personal-hospital`, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener personal hospital'))
    );
  }

  getPersonalHospitalPacientes(filtros: {
    skip?: number;
    limit?: number;
    expediente?: string | null;
    cui?: string | null;
    primer_nombre?: string | null;
    segundo_nombre?: string | null;
    primer_apellido?: string | null;
    segundo_apellido?: string | null;
  } = {}): Observable<PacienteListResponse> {
    const { skip = 0, limit = 50, ...rest } = filtros;
    let params = new HttpParams().set('skip', skip.toString()).set('limit', limit.toString());
    for (const [key, value] of Object.entries(rest)) {
      if (value != null && value !== '') {
        params = params.set(key, value);
      }
    }
    return this.http.get<PacienteListResponse>(`${this.baseUrl}/pacientes/personal-hospital`, { params }).pipe(
      catchError(error => this.manejarError(error, 'obtener lista personal hospital'))
    );
  }

  getEstudiantePublico(desde: string, hasta: string): Observable<any> {
    this.isLoading.set(true);
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<any>(`${this.baseUrl}/estadisticas/consultas/estudiante-publico`, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener estudiante público'))
    );
  }

  getReingresos(desde: string, hasta: string): Observable<any> {
    this.isLoading.set(true);
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<any>(`${this.baseUrl}/estadisticas/consultas/reingresos`, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener reingresos'))
    );
  }

  getReingresosTipo3(skip = 0, limit = 50): Observable<any> {
    this.isLoading.set(true);
    const params = new HttpParams().set('skip', String(skip)).set('limit', String(limit));
    return this.http.get<any>(`${this.baseUrl}/estadisticas/consultas/reingresos-tipo3`, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener reingresos tipo 3'))
    );
  }

  getActivosMayores30Dias(skip = 0, limit = 50): Observable<any> {
    this.isLoading.set(true);
    const params = new HttpParams().set('skip', String(skip)).set('limit', String(limit));
    return this.http.get<any>(`${this.baseUrl}/estadisticas/consultas/activos-mayores-a-30-dias`, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener activos >30 días'))
    );
  }

  getEstadisticasNacimientos(desde: string, hasta: string): Observable<any> {
    this.isLoading.set(true);
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<any>(`${this.baseUrl}/estadisticas/nacimientos`, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener estadísticas de nacimientos'))
    );
  }

  // ======= PROCEDIMIENTOS / REPORTES =======
  getReporteProcedimientos(filtros: {
    desde?: string; hasta?: string; especialidad?: string;
    lugar_servicio?: string; sexo?: string;
  }): Observable<any> {
    this.isLoading.set(true);
    const params = this.limpiarParametros(filtros);
    return this.http.get<any>(`${this.baseUrl}/procedimientos/reporte`, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener reporte de procedimientos'))
    );
  }

  getResumenProcedimientos(filtros?: { anio?: number; mes?: number }): Observable<any> {
    this.isLoading.set(true);
    const params = this.limpiarParametros(filtros || {});
    return this.http.get<any>(`${this.baseUrl}/procedimientos/estadisticas/resumen`, { params }).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(error => this.manejarError(error, 'obtener resumen de procedimientos'))
    );
  }

  //======== MEDICOS =============
  getMedicos(filtros: any): Observable<Medico[]> {
    this.isLoading.set(true);
    const params = this.limpiarParametros(filtros);
    const key = this.sync.cacheKey(`${this.baseUrl}/medicos/`, params);

    return this.sync.cacheGet(key,
      this.http.get<Medico[]>(`${this.baseUrl}/medicos/`, { params }).pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(error => this.manejarError(error, 'obtener datos'))
      )
    );
  }


}
