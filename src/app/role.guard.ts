// guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from './service/api.service';

export const roleGuard = (rolesPermitidos: string[]): CanActivateFn => {
  return () => {
    const api = inject(ApiService);
    const router = inject(Router);

    // Usa el signal del ApiService (ya lo cargas desde localStorage en el constructor)
    const rolUsuario = api.role();

    if (rolUsuario && rolesPermitidos.includes(rolUsuario)) {
      return true;
    }

    router.navigate(['/dash']); // sin permiso → redirige al dashboard
    return false;
  };
};
