import { of } from 'rxjs';
import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../service/api.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { catchError, finalize, takeUntil } from 'rxjs';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.component.html',
  styleUrls: ['./recuperar.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ReactiveFormsModule, FormsModule]
})

/** Permite solicitar el restablecimiento de una cuenta desde la pantalla pública. */
export class RecuperarComponent implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  private destroy$ = new Subject<void>();

  // ======= SEÑALES =======
  modo = signal<'solicitar' | 'restablecer'>('solicitar');
  enviado = signal(false);
  restablecido = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);

  solicitarForm: FormGroup;
  restablecerForm: FormGroup;

  emailEnlace = '';
  verPassword = false;
  verConfirmacion = false;

  constructor() {
    this.solicitarForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.restablecerForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(4)]],
      confirmacion: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.emailEnlace = params.get('email') ?? '';
      const token = params.get('token') ?? '';
      if (token && this.emailEnlace) {
        this.modo.set('restablecer');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ======= PASO 1: SOLICITAR ENLACE =======
  solicitar(): void {
    if (this.solicitarForm.invalid) {
      this.error.set('Ingresa un correo electrónico válido');
      return;
    }

    const email = this.solicitarForm.value.email as string;
    this.isLoading.set(true);
    this.error.set(null);

    this.api.solicitarRecuperacion(email)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          console.error('error al solicitar recuperación: ', err);
          this.error.set('Hubo un problema. Intenta nuevamente en unos momentos.');
          return of(null);
        })
      )
      .subscribe(response => {
        if (!response) return;
        this.enviado.set(true);
      });
  }

  // ======= PASO 2: RESTABLECER CON EL ENLACE =======
  guardar(): void {
    const f = this.restablecerForm.value;
    if (this.restablecerForm.invalid) {
      this.error.set('La contraseña debe tener al menos 4 caracteres');
      return;
    }
    if (f.password !== f.confirmacion) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    const token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.isLoading.set(true);
    this.error.set(null);

    this.api.confirmarRecuperacion(this.emailEnlace, token, f.password)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          console.error('error al restablecer: ', err);
          this.error.set(
            err?.error?.detail ?? 'El enlace es inválido o ha expirado. Solicita uno nuevo.'
          );
          return of(null);
        })
      )
      .subscribe(response => {
        if (!response) return;
        this.restablecido.set(true);
      });
  }

  volverAlInicio(): void {
    this.router.navigate(['/']);
  }

  solicitarOtraVez(): void {
    this.enviado.set(false);
    this.solicitarForm.reset();
  }

}
