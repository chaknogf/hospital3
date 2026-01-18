import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { Paciente, Usuarios, Municipio, Totales, PacienteListResponse } from '../interface/interfaces';
import { ConsultaBase, ConsultaCreate, ConsultaOut, ConsultaResponse, ConsultaUpdate, TotalesItem, TotalesResponse } from '../interface/consultas';

interface PaginationState {
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

  // ======= BEHAVIOR SUBJECTS (para datos complejos) =======
  private pacientesSubject = new BehaviorSubject<Paciente[]>([]);
  pacientes$ = this.pacientesSubject.asObservable();

  private consultasSubject = new BehaviorSubject<ConsultaResponse[]>([]);
  consultas$ = this.consultasSubject.asObservable();

  private ordenesSubject = new BehaviorSubject<any>({});
  ordenes$ = this.ordenesSubject.asObservable();

  // ======= ESTADO DE PAGINACIÓN =======
  private ultimoFiltroPaciente: PaginationState = { filtro: { skip: 0, limit: 6 } };
  private ultimoFiltroConsulta: PaginationState = { filtro: { skip: 0, limit: 6 } };

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

  private manejarError(error: any, operacion: string) {
    console.error(`❌ Error al ${operacion}:`, error);
    return throwError(() => new Error(`Error al ${operacion}: ${error.message}`));
  }

  // ======= AUTENTICACIÓN =======
  login(username: string, password: string): Observable<any> {
    this.isLoading.set(true);
    const body = new HttpParams()
      .set('username', username)
      .set('password', password);

    return this.http.post<{ access_token: string }>(
      `${this.baseUrl}/auth/login`,
      body
    ).pipe(
      tap(response => {
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          this.token.set(response.access_token);
          this.getCurrentUser().subscribe();
          this.router.navigate(['/dash']);
        } else {
          throw new Error('No se recibió el token.');
        }
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

  // ======= PACIENTES =======
  getPacientes(filtros: any): Observable<PacienteListResponse> {
    this.ultimoFiltroPaciente.filtro = filtros;
    const params = this.limpiarParametros(filtros);

    return this.http.get<PacienteListResponse>(`${this.baseUrl}/pacientes/`, { params }).pipe(
      tap(response => this.pacientesSubject.next(response.pacientes)),
      catchError(error => this.manejarError(error, 'obtener pacientes'))
    );
  }

  buscarpaciente(q: any): Observable<PacienteListResponse> {
    const params = this.limpiarParametros(q);
    return this.http.get<PacienteListResponse>(`${this.baseUrl}/pacientes/buscar/`, { params }).pipe(
      tap(response => this.pacientesSubject.next(response.pacientes)),
      catchError(error => this.manejarError(error, 'buscar pacientes'))
    );
  }

  getPaciente(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.baseUrl}/pacientes/${id}`).pipe(
      catchError(error => this.manejarError(error, 'obtener paciente'))
    );
  }

  crearPaciente(paciente: Paciente, generar_expediente: boolean = false): Observable<any> {
    this.isLoading.set(true);
    const url = generar_expediente
      ? `${this.baseUrl}/pacientes/?gen_expediente=true`
      : `${this.baseUrl}/pacientes`;

    return this.http.post<any>(url, paciente).pipe(
      tap(() => this.refrescarPacientes()),
      catchError(error => this.manejarError(error, 'crear paciente')),
      finalize(() => this.isLoading.set(false))
    );
  }

  updatePaciente(
    pacienteId: number,
    paciente: any,
    accion: string = 'mantener'
  ): Observable<any> {
    this.isLoading.set(true);
    return this.http.patch<any>(
      `${this.baseUrl}/pacientes/${pacienteId}?accion_expediente=${accion}`,
      paciente
    ).pipe(
      tap(() => this.refrescarPacientes()),
      catchError(error => this.manejarError(error, 'actualizar paciente')),
      finalize(() => this.isLoading.set(false))
    );
  }

  deletePaciente(pacienteId: number): Observable<any> {
    this.isLoading.set(true);
    return this.http.delete<any>(`${this.baseUrl}/paciente/eliminar/${pacienteId}`).pipe(
      tap(() => this.refrescarPacientes()),
      catchError(error => this.manejarError(error, 'eliminar paciente')),
      finalize(() => this.isLoading.set(false))
    );
  }

  private refrescarPacientes(): void {
    this.getPacientes(this.ultimoFiltroPaciente.filtro).subscribe();
  }

  // ======= CORRELATIVOS =======
  corExpediente(): Observable<{ correlativo: string }> {
    return this.http.post<{ correlativo: string }>(
      `${this.baseUrl}/generar/expediente`,
      {}
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener correlativo de expediente'))
    );
  }

  corEmergencia(): Observable<{ correlativo: string }> {
    return this.http.post<{ correlativo: string }>(
      `${this.baseUrl}/generar/emergencia`,
      {}
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener correlativo de emergencia'))
    );
  }

  // ======= MUNICIPIOS =======
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

  // ======= CONSULTAS =======
  enviarOrdenes(ordenes: any): void {
    this.ordenesSubject.next(ordenes);
  }

  getConsultas(filtros: any): Observable<ConsultaResponse[]> {
    this.ultimoFiltroConsulta.filtro = filtros;
    const params = this.limpiarParametros(filtros);

    return this.http.get<ConsultaResponse[]>(`${this.baseUrl}/consultas/`, { params }).pipe(
      tap(response => this.consultasSubject.next(response)),
      catchError(error => this.manejarError(error, 'obtener consultas'))
    );
  }

  getConsulta(filtros: any): Observable<ConsultaBase[]> {
    const params = this.limpiarParametros(filtros);
    return this.http.get<ConsultaBase[]>(`${this.baseUrl}/consultas/`, { params }).pipe(
      catchError(error => this.manejarError(error, 'obtener consulta'))
    );
  }

  getConsultaId(id_consulta: number): Observable<ConsultaBase[]> {
    const params = new HttpParams().set('id_consulta', id_consulta.toString());
    return this.http.get<ConsultaBase[]>(`${this.baseUrl}/consultas/`, { params }).pipe(
      catchError(error => this.manejarError(error, 'obtener consulta por ID'))
    );
  }

  crearConsulta(consulta: ConsultaCreate): Observable<ConsultaOut> {
    this.isLoading.set(true);
    return this.http.post<ConsultaOut>(`${this.baseUrl}/consultas/`, consulta).pipe(
      tap(() => this.refrescarConsultas()),
      catchError(error => this.manejarError(error, 'crear consulta')),
      finalize(() => this.isLoading.set(false))
    );
  }


  updateConsulta(consultaId: number, consulta: ConsultaUpdate): Observable<ConsultaOut> {
    this.isLoading.set(true);
    return this.http.patch<ConsultaOut>(  // ✅ Cambió de put a patch
      `${this.baseUrl}/consultas/${consultaId}`,
      consulta
    ).pipe(
      tap(() => this.refrescarConsultas()),
      catchError(error => this.manejarError(error, 'actualizar consulta')),
      finalize(() => this.isLoading.set(false))
    );
  }

  deleteConsulta(consultaId: number): Observable<any> {
    this.isLoading.set(true);
    return this.http.delete<any>(`${this.baseUrl}/consulta/eliminar/${consultaId}`).pipe(
      tap(() => this.refrescarConsultas()),
      catchError(error => this.manejarError(error, 'eliminar consulta')),
      finalize(() => this.isLoading.set(false))
    );
  }

  private refrescarConsultas(): void {
    this.getConsultas(this.ultimoFiltroConsulta.filtro).subscribe();
  }

  // ======= TOTALES =======
  getTotales(fecha?: string): Observable<TotalesResponse> {
    let params = new HttpParams();

    if (fecha) {
      params = params.set('fecha', fecha);
    }

    return this.http.get<TotalesResponse>(
      `${this.baseUrl}/totales/`,
      { params }
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener totales'))
    );
  }

  // ✅ Método helper para obtener solo el array de totales
  getTotalesArray(fecha?: string): Observable<TotalesItem[]> {
    return this.getTotales(fecha).pipe(
      map(response => response.totales)
    );
  }
}
