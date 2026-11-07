import { EMPTY, Observable, expand, map, toArray } from 'rxjs';

export interface Pagina<T> {
  total: number;
  items: T[];
}

/**
 * Recorre todas las páginas de un listado paginado y devuelve los ítems
 * acumulados. Útil para reportes que deben imprimir el periodo completo y no
 * solo la primera página del endpoint.
 */
export function cargarTodasLasPaginas<T>(
  cargar: (params: Record<string, unknown>) => Observable<Pagina<T>>,
  params: Record<string, unknown> = {},
  limite = 200,
): Observable<T[]> {
  const primera = cargar({ ...params, skip: 0, limit: limite });
  return primera.pipe(
    expand((pagina, index) => {
      const siguientes = (index + 1) * limite;
      if (siguientes >= pagina.total) {
        return EMPTY;
      }
      return cargar({ ...params, skip: siguientes, limit: limite });
    }),
    toArray(),
    map((paginas) => paginas.flatMap((pagina) => pagina.items)),
  );
}
