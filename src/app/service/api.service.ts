import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { Paciente, Usuarios, Municipio, Totales, PacienteListResponse } from '../interface/interfaces';
import { ConsultaBase, ConsultaCreate, ConsultaOut, ConsultaResponse, ConsultaUpdate, Egreso, Indicador, RegistroConsultaCreate, RegistroConsultaResponse, SignosVitales, TotalesItem, TotalesResponse } from '../interface/consultas';
import { CicloClinico, EstadoCiclo } from '../interface/consultas';
import { FiltroConsulta } from '../interface/filtros.model';
import { Console } from 'console';
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
  private ultimoFiltroPaciente: PaginationState = { filtro: { skip: 0, limit: 8 } };
  private ultimoFiltroConsulta: PaginationState = { filtro: { skip: 0, limit: 8 } };

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

  /**
   * Envía órdenes al BehaviorSubject (funcionalidad legacy)
   */
  enviarOrdenes(ordenes: any): void {
    this.ordenesSubject.next(ordenes);
  }

  /**
   * Busca consultas con filtros múltiples
   * GET /consultas/
   */
  getConsultas(filtros: FiltroConsulta): Observable<ConsultaOut[]> {
    this.ultimoFiltroConsulta.filtro = filtros;
    const params = this.limpiarParametros(filtros);
    // console.log(params);

    return this.http.get<ConsultaOut[]>(`${this.baseUrl}/consultas/`, { params }).pipe(
      tap(response => {
        // Convertir a ConsultaResponse si necesitas agregar datos del paciente
        this.consultasSubject.next(response as any);
      }),
      catchError(error => this.manejarError(error, 'obtener consultas'))
    );
  }

  /**
   * Obtiene una sola consulta según filtros (la primera que coincida)
   * GET /consultas/
   */
  getConsulta(filtros: FiltroConsulta): Observable<ConsultaOut | null> {
    const params = this.limpiarParametros(filtros);
    return this.http.get<ConsultaOut[]>(`${this.baseUrl}/consultas/`, { params }).pipe(
      map(consultas => consultas && consultas.length > 0 ? consultas[0] : null),
      catchError(error => this.manejarError(error, 'obtener consulta'))
    );
  }

  /**
   * Obtiene una consulta por su ID
   * GET /consultas/{consulta_id}
   */
  getConsultaId(consultaId: number): Observable<ConsultaOut> {
    return this.http.get<ConsultaOut>(`${this.baseUrl}/consultas/${consultaId}`).pipe(
      catchError(error => this.manejarError(error, 'obtener consulta por ID'))
    );
  }

  /**
   * Registro rápido de consulta (admisión)
   * POST /consultas/registro
   * El backend genera automáticamente: expediente, documento, fecha/hora, ciclo inicial, orden
   */
  registrarAdmision(datos: RegistroConsultaCreate): Observable<RegistroConsultaResponse> {
    this.isLoading.set(true);
    return this.http.post<RegistroConsultaResponse>(
      `${this.baseUrl}/consultas/registro`,
      datos
    ).pipe(
      tap(() => this.refrescarConsultas()),
      catchError(error => this.manejarError(error, 'registrar admisión',)),
      finalize(() => this.isLoading.set(false))
    );
  }

  /**
   * Actualiza una consulta (PATCH)
   * IMPORTANTE: Si envías 'ciclo', se AGREGA al historial, no sobrescribe
   * PATCH /consultas/{consulta_id}
   */
  updateConsulta(consultaId: number, datos: ConsultaUpdate): Observable<ConsultaOut> {
    this.isLoading.set(true);
    return this.http.patch<ConsultaOut>(
      `${this.baseUrl}/consultas/${consultaId}`,
      datos
    ).pipe(
      tap(() => this.refrescarConsultas()),
      catchError(error => this.manejarError(error, 'actualizar consulta')),
      finalize(() => this.isLoading.set(false))
    );
  }

  /**
   * Agrega un nuevo registro al ciclo clínico
   * El backend automáticamente agrega: registro (timestamp), usuario
   */
  agregarCiclo(
    consultaId: number,
    estado: EstadoCiclo,
    datosCiclo?: Partial<CicloClinico>
  ): Observable<ConsultaOut> {
    const ciclo: Partial<CicloClinico> = {
      estado,
      ...datosCiclo
    };

    return this.updateConsulta(consultaId, { ciclo: ciclo as CicloClinico });
  }

  /**
   * Actualiza indicadores (merge con los existentes)
   */
  actualizarIndicadores(
    consultaId: number,
    indicadores: Partial<Indicador>
  ): Observable<ConsultaOut> {
    return this.updateConsulta(consultaId, {
      indicadores: indicadores as Indicador
    });
  }


  /**
   * Refresca la lista de consultas con los últimos filtros usados
   */
  private refrescarConsultas(): void {
    this.getConsultas(this.ultimoFiltroConsulta.filtro).subscribe();
  }

  // ======= MÉTODOS HELPER PARA CICLO CLÍNICO =======

  /**
   * Registra signos vitales en el ciclo
   */
  registrarSignosVitales(
    consultaId: number,
    signos: SignosVitales
  ): Observable<ConsultaOut> {
    return this.agregarCiclo(consultaId, 'signos', {
      signos_vitales: signos
    });
  }

  /**
   * Completa la consulta médica con diagnóstico y tratamiento
   */
  completarConsulta(
    consultaId: number,
    datos: {
      impresion_clinica?: any;
      tratamiento?: any;
      ordenes?: any;
      estudios?: any;
    }
  ): Observable<ConsultaOut> {
    return this.agregarCiclo(consultaId, 'consulta', datos);
  }

  /**
   * Registra egreso del paciente
   */
  registrarEgreso(
    consultaId: number,
    egreso: Egreso
  ): Observable<ConsultaOut> {
    return this.agregarCiclo(consultaId, 'egreso', {
      egreso: egreso
    });
  }

  /**
   * Cambia el estado de la consulta sin datos adicionales
   */
  cambiarEstado(
    consultaId: number,
    estado: EstadoCiclo
  ): Observable<ConsultaOut> {
    return this.agregarCiclo(consultaId, estado);
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
