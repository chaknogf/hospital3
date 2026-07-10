import { Component, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../service/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnDestroy {
  loginForm: FormGroup;
  errorMessage: string = '';
  loading = false;

  private destroy$ = new Subject<void>();

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    // ✅ Ya no necesitas inyectar Router aquí, el service lo maneja
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor complete todos los campos.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.value;

    this.apiService.login(username, password).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        // ✅ Solo apagar el loader — la navegación ya la hace ApiService.login()
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.getErrorMessage(error);
        this.cdr.markForCheck();
      }
    });
  }

  getErrorMessage(error: any): string {
    if (!error || error instanceof Error) {
      return error?.message ?? 'Error desconocido. Inténtalo nuevamente.';
    }

    // HttpErrorResponse de Angular
    const status = error?.status;
    const msg = error?.error?.detail ?? error?.error?.message;

    if (msg) return msg;

    switch (status) {
      case 400: return 'Solicitud incorrecta. Verifica los datos ingresados.';
      case 401: return 'Credenciales incorrectas.';
      case 403: return 'No tiene permisos para realizar esta acción.';
      case 404: return 'Recurso no encontrado.';
      case 422: return 'Formato de datos inválido.';
      case 500: return 'Error del servidor. Inténtalo más tarde.';
      default: return `Error inesperado (código ${status}).`;
    }
  }

  reset(): void {
    console.log('CLICK RESET');
    this.router.navigate(['/resetpass']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
