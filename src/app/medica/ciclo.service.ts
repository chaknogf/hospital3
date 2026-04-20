
// consulta.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { BaseApiService, PaginationState } from './../service/base-api.service';
import { FiltroConsulta } from './../interface/filtros.model';
import {
  CicloConsulta,
} from './../interface/ciclo';

@Injectable({ providedIn: 'root' })
export class ConsultaService extends BaseApiService {

  // ======= BEHAVIOR SUBJECTS =======
  private ciclosSubject = new BehaviorSubject<CicloConsulta[]>([]);
  consultas$ = this.ciclosSubject.asObservable();

  private ordenesSubject = new BehaviorSubject<any>({});
  ordenes$ = this.ordenesSubject.asObservable();

  // ======= ESTADO DE PAGINACIÓN =======
  private ultimoFiltroCiclo: PaginationState = {
    filtro: { skip: 0, limit: 20 }
  };

  constructor(http: HttpClient, router: Router) {
    super(http, router);
  }

  // ======= PRIVADOS =======

  private refrescarCiclos(): void {
    this.getCiclosDeConsulta(this.ultimoFiltroCiclo.filtro).subscribe();
  }

  // ======= UTILIDADES =======

  /**
   * Envía órdenes al BehaviorSubject (funcionalidad legacy)
   */
  enviarOrdenes(ordenes: any): void {
    this.ordenesSubject.next(ordenes);
  }

  // ======= CONSULTAS — LECTURA =======

  /**
   * Lista consultas con filtros múltiples
   * GET /consultas/
   */
  getCiclosDeConsulta(consulta_id: number): Observable<CicloConsulta[]> {


    return this.http.get<CicloConsulta[]>(
      `${this.baseUrl}/ciclos/consulta/${consulta_id}?activo=true`,
    ).pipe(
      tap(response => this.ciclosSubject.next(response as any)),
      catchError(error => this.manejarError(error, 'obtener ciclos'))
    );
  }


  /**
   * Obtiene la primera consulta que coincida con los filtros
   * GET /consultas/
   */
  getCiclo(id: number): Observable<CicloConsulta> {
    return this.http.get<CicloConsulta>(
      `${this.baseUrl}/ciclos/${id}`,
    ).pipe(
      catchError(error => this.manejarError(error, 'obtener ciclo por ID'))
    );
  }



  iniciarClico(ciclo: CicloConsulta): Observable<any> {
    this.isLoading.set(true);
    return this.http.post<any>(`${this.baseUrl}/ciclos/`, ciclo).pipe(
      tap(() => this.refrescarCiclos()),
      catchError(error => this.manejarError(error, 'al crear ciclo')),
      finalize(() => this.isLoading.set(false))
    );
  }

}
