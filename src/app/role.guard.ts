// guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './service/auth.service';

/**
 * Crea un guard que permite navegar a los roles indicados.
 * El rol 'read_only' siempre puede acceder a las vistas (solo lectura),
 * pero el backend retornará 403 en cualquier POST/PUT/PATCH/DELETE.
 * @param rolesPermitidos Roles autorizados para la ruta (además de read_only).
 */
export const roleGuard = (rolesPermitidos: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const rolUsuario = auth.role();

    // El rol de solo lectura puede ingresar a cualquier módulo para ver,
    // pero no puede editar/crear/eliminar (backend retorna 403).
    if (rolUsuario === 'read_only') {
      return true;
    }

    if (rolUsuario && rolesPermitidos.includes(rolUsuario)) {
      return true;
    }

    router.navigate(['/dash']);
    return false;
  };
};
