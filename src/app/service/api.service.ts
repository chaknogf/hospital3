// api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, finalize, map } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { AuthService } from './auth.service';
import { EstadisticasService } from './estadisticas.service';
import { PacienteListResponse } from '../interface/interfaces';
import { ConsultaListResponse } from '../interface/consultas';
import { Medico } from '../interface/medicos.interface';
import { Usuario, UsuarioOut, UsersListResponse } from '../interface/usuarios.interface';

/** Fachada de endpoints consumidos por los módulos; reutiliza caché y cola offline. */
@Injectable({ providedIn: 'root' })
export class ApiService extends BaseApiService {
  private estadisticas = inject(EstadisticasService);

  // Signals delegados a AuthService (compatibilidad con componentes existentes)
  get token() { return this.auth.token; }
  get username() { return this.auth.username; }
  get role() { return this.auth.role; }
  get nombreUsuario() { return this.auth.nombreUsuario; }

  private precacheCancelado = false;
  private readonly precacheMaxRegistros = 5000;

  private usuariosSubject = new BehaviorSubject<UsuarioOut[]>([]);
  usuarios$ = this.usuariosSubject.asObservable();

  constructor(
    http: HttpClient,
    router: Router
  ) {
    super(http, router);
  }

  // ── Precache (privado) ──────────────────────────────────
  private async cacheEstaFresco(key: string): Promise<boolean> {
    const cached = await this.sync.getCachedData<any>(key);
    return cached !== null;
  }

  private preCacheAllPatients(): void {
    this.precacheCancelado = false;
    if (!this.sync.isOnline()) return;
    const limit = 100;
    const url = `${this.baseUrl}/pacientes/`;
    const ttl = 30 * 60 * 1000;
    const firstKey = this.sync.cacheKey(url, new HttpParams().set('skip', '0').set('limit', String(limit)));

    this.cacheEstaFresco(firstKey).then(fresco => {
      if (fresco) return;
      this.http.get<PacienteListResponse>(url, { params: new HttpParams().set('skip', '0').set('limit', String(limit)) }).pipe(
        catchError(() => of(null))
      ).subscribe(firstResponse => {
        if (!firstResponse) return;
        const total = Math.min(firstResponse.total, this.precacheMaxRegistros);
        this.sync.setCachedData(firstKey, firstResponse, ttl);
        this.preCachePageSequentially(url, limit, limit, total, ttl);
      });
    });
  }

  private preCachePageSequentially(url: string, skip: number, limit: number, total: number, ttl: number): void {
    if (skip >= total || this.precacheCancelado) return;
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
    this.precacheCancelado = false;
    if (!this.sync.isOnline()) return;
    const limit = 100;
    const url = `${this.baseUrl}/consultas/`;
    const ttl = 30 * 60 * 1000;
    const firstKey = this.sync.cacheKey(url, new HttpParams().set('skip', '0').set('limit', String(limit)));

    this.cacheEstaFresco(firstKey).then(fresco => {
      if (fresco) return;
      this.http.get<ConsultaListResponse>(url, { params: new HttpParams().set('skip', '0').set('limit', String(limit)) }).pipe(
        catchError(() => of(null))
      ).subscribe(firstResponse => {
        if (!firstResponse) return;
        const total = Math.min(firstResponse.total, this.precacheMaxRegistros);
        this.sync.setCachedData(firstKey, firstResponse, ttl);
        this.preCachePageSequentially(url, limit, limit, total, ttl);
      });
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
    setTimeout(() => this.preCacheAllPatients(), 2000);
    setTimeout(() => this.preCacheAllConsultations(), 5000);
  }

  // ── Autenticación (delegado a AuthService) ──────────────
  /** Delega el inicio de sesión y expone el estado compartido de carga. */
  login(username: string, password: string): Observable<any> {
    this.isLoading.set(true);
    return this.auth.login(username, password).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  getCurrentUser(): Observable<any> {
    return this.auth.getCurrentUser();
  }

  getUsuarioActual(): { username: string; role: string; nombre: string } {
    return this.auth.getUsuarioActual();
  }

  /** Delega el cierre de sesión conservando las mutaciones offline pendientes. */
  logOut(): void {
    this.auth.logOut();
  }

  // ── Usuarios ────────────────────────────────────────────
  getUsers(filtros: any): Observable<UsersListResponse> {
    const params = this.limpiarParametros(filtros);
    const key = this.cacheKey(`${this.baseUrl}/users/`, params);
    return this.cacheGet(key,
      this.http.get<UsersListResponse>(`${this.baseUrl}/users/`, { params }).pipe(
        tap(response => this.usuariosSubject.next(response.usuarios)),
        catchError(error => this.manejarError(error, 'obtener usuarios'))
      )
    );
  }

  getAuditLog(filtros: any): Observable<any> {
    const params = this.limpiarParametros(filtros);
    const key = this.cacheKey(`${this.baseUrl}/audit-log/`, params);
    return this.cacheGet(key,
      this.http.get<any>(`${this.baseUrl}/audit-log/`, { params }).pipe(
        catchError(error => this.manejarError(error, 'obtener auditoría'))
      ),
      30 * 60 * 1000
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

  solicitarRecuperacion(email: string): Observable<any> {
    this.isLoading.set(true);
    return this.http.post<any>(
      `${this.baseUrl}/users/recuperar/solicitar`, { email }
    ).pipe(
      catchError(error => this.manejarError(error, 'solicitar recuperación de contraseña')),
      finalize(() => this.isLoading.set(false))
    );
  }

  confirmarRecuperacion(email: string, token: string, password: string): Observable<any> {
    this.isLoading.set(true);
    return this.http.post<any>(
      `${this.baseUrl}/users/recuperar/confirmar`, { email, token, password }
    ).pipe(
      catchError(error => this.manejarError(error, 'confirmar recuperación de contraseña')),
      finalize(() => this.isLoading.set(false))
    );
  }

  updateUser(userId: number, user: any): Observable<any> {
    this.isLoading.set(true);
    return this.offMutation('PUT', `${this.baseUrl}/users/${userId}`, user).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  // ── Correlativos ────────────────────────────────────────
  corDefuncion(): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/correlativos/constancia_defuncion`, {}
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener correlativo de defunción'))
    );
  }

  // ── Municipios ──────────────────────────────────────────
  getMunicipios(filtros: any): Observable<any> {
    const params = this.limpiarParametros(filtros);
    const key = this.cacheKey(`${this.baseUrl}/municipios/`, params);
    return this.cacheGet(key,
      this.http.get<any>(`${this.baseUrl}/municipios/`, { params }).pipe(
        catchError(error => this.manejarError(error, 'obtener municipios'))
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

  // ── Encamamiento ────────────────────────────────────────
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

  // ── Países ISO ──────────────────────────────────────────
  getPaisesIso(): Observable<any> {
    const key = this.cacheKey(`${this.baseUrl}/paises/`);
    return this.cacheGet(key,
      this.http.get<any>(`${this.baseUrl}/paises/`).pipe(
        catchError(error => this.manejarError(error, 'obtener países'))
      ),
      30 * 60 * 1000
    );
  }

  getRenapITD(filtros: any): Observable<any> {
    const params = this.limpiarParametros(filtros);
    const key = this.cacheKey(`${this.baseUrl}/renap-persona`, params);
    return this.cacheGet(key,
      this.http.get<{ resultado: any }>(`${this.baseUrl}/renap-persona`, { params }).pipe(
        tap(response => response.resultado),
        catchError(error => this.manejarError(error, 'obtener datos RENAP'))
      ),
      10 * 60 * 1000
    );
  }

  // ── Pacientes Merge ─────────────────────────────────────
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

  // ── Estadísticas / Reportes (delegado a EstadisticasService) ──
  getPacientesAtendidos(desde: string, hasta: string): Observable<any> {
    return this.estadisticas.getPacientesAtendidos(desde, hasta);
  }

  getHospitalizacionInfantil(desde: string, hasta: string): Observable<any> {
    return this.estadisticas.getHospitalizacionInfantil(desde, hasta);
  }

  getPromedioDiario(desde: string, hasta: string): Observable<any> {
    return this.estadisticas.getPromedioDiario(desde, hasta);
  }

  getPersonalHospital(desde: string, hasta: string, skip = 0, limit = 100): Observable<any> {
    return this.estadisticas.getPersonalHospital(desde, hasta, skip, limit);
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
    return this.estadisticas.getPersonalHospitalPacientes(filtros);
  }

  getEstudiantePublico(desde: string, hasta: string): Observable<any> {
    return this.estadisticas.getEstudiantePublico(desde, hasta);
  }

  getReingresos(desde: string, hasta: string): Observable<any> {
    return this.estadisticas.getReingresos(desde, hasta);
  }

  getReingresosTipo3(skip = 0, limit = 50): Observable<ConsultaListResponse> {
    return this.estadisticas.getReingresosTipo3(skip, limit);
  }

  getActivosMayores7Dias(skip = 0, limit = 50): Observable<ConsultaListResponse> {
    return this.estadisticas.getActivosMayores7Dias(skip, limit);
  }

  getEstadisticasNacimientos(desde: string, hasta: string): Observable<any> {
    return this.estadisticas.getEstadisticasNacimientos(desde, hasta);
  }

  getReporteProcedimientos(filtros: {
    desde?: string; hasta?: string; especialidad?: string;
    lugar_servicio?: string; sexo?: string;
  }): Observable<any> {
    return this.estadisticas.getReporteProcedimientos(filtros);
  }

  getResumenProcedimientos(filtros?: { anio?: number; mes?: number }): Observable<any> {
    return this.estadisticas.getResumenProcedimientos(filtros);
  }

  // ── Médicos ─────────────────────────────────────────────
  getMedicos(filtros: any): Observable<Medico[]> {
    this.isLoading.set(true);
    const params = this.limpiarParametros(filtros);
    const key = this.cacheKey(`${this.baseUrl}/personal-atencion/`, params);

    return this.cacheGet(key,
      this.http.get<{ total: number; personal_atencion: Medico[] }>(`${this.baseUrl}/personal-atencion/`, { params }).pipe(
        map(r => r.personal_atencion),
        finalize(() => this.isLoading.set(false)),
        catchError(error => this.manejarError(error, 'obtener datos'))
      )
    );
  }
}
