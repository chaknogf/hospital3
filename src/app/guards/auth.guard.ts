import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(): boolean {
    const token = localStorage.getItem('access_token');
    const username = localStorage.getItem('username');
    if (!token || !username) {
      this.router.navigate(['/inicio']);
      return false;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        this.router.navigate(['/inicio']);
        return false;
      }
    } catch {
      this.router.navigate(['/inicio']);
      return false;
    }
    return true;
  }
}
