import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { PrestamosService } from './prestamos.service';

describe('Service: Prestamos', () => {
  let service: PrestamosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PrestamosService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ]
    });
    service = TestBed.inject(PrestamosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('GET prestamos actualiza subject total y items', () => {
    const respuesta = {
      total: 1,
      items: [
        {
          id: 7,
          id_paciente: 3,
          expediente: 'EXP-1',
          solicitante: 'Ana',
          tipo_documento: 'EXPEDIENTE',
          activo: true,
          created_at: '2026-01-01T10:00:00',
          updated_at: '2026-01-01T10:00:00',
        },
      ],
    };

    let recibido: any = null;
    service.getPrestamos({ activo: true }).subscribe(r => (recibido = r));

    const req = httpMock.expectOne(r => r.url.endsWith('/prestamos/') && r.method === 'GET');
    expect(req.request.params.get('activo')).toBe('true');
    req.flush(respuesta);

    expect(recibido.total).toBe(1);
    expect(service.total()).toBe(1);

    let items: any[] = [];
    service.prestamos$.subscribe(v => (items = v));
    expect(items.length).toBe(1);
  });

  it('POST prestamos/ crea y refresca', () => {
    const nuevo = { id_paciente: 3, solicitante: 'Ana', expediente: 'EXP-1' };
    const respuesta = { ...nuevo, id: 9, created_at: '2026-01-01', updated_at: '2026-01-01' };

    service.crearPrestamo(nuevo).subscribe();

    const post = httpMock.expectOne(r => r.url.endsWith('/prestamos/') && r.method === 'POST');
    expect(post.request.body).toEqual(jasmine.objectContaining({ id_paciente: 3 }));
    post.flush(respuesta);

    // refresco interno → GET
    httpMock.expectOne(r => r.url.endsWith('/prestamos/') && r.method === 'GET').flush({ total: 0, items: [] });
  });

  it('PUT actualiza préstamo con id correcto', () => {
    service.actualizarPrestamo(5, { motivo: 'x' }).subscribe();

    const req = httpMock.expectOne(r => r.url.endsWith('/prestamos/5') && r.method === 'PUT');
    expect(req.request.body).toEqual({ motivo: 'x' });
    req.flush({
      id: 5,
      id_paciente: 1,
      solicitante: 'A',
      motivo: 'x',
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    });

    httpMock.expectOne(r => r.url.endsWith('/prestamos/') && r.method === 'GET').flush({ total: 0, items: [] });
  });

  it('DELETE /prestamos/{id} desactiva', () => {
    let respuesta: any = null;
    service.eliminarPrestamo(5).subscribe(r => (respuesta = r));

    const req = httpMock.expectOne(r => r.url.endsWith('/prestamos/5') && r.method === 'DELETE');
    req.flush({ detail: 'Préstamo desactivado correctamente' });

    expect(respuesta?.detail).toContain('desactivado');

    httpMock.expectOne(r => r.url.endsWith('/prestamos/') && r.method === 'GET').flush({ total: 0, items: [] });
  });
});