// guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './service/auth.service';

/**
 * Crea un guard que permite navegar solo a los roles indicados.
 * @param rolesPermitidos Roles autorizados para la ruta.
 */
export const roleGuard = (rolesPermitidos: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const rolUsuario = auth.role();

    if (rolUsuario && rolesPermitidos.includes(rolUsuario)) {
      return true;
    }

    router.navigate(['/dash']);
    return false;
  };
};
