import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { catchError, finalize, takeUntil } from 'rxjs';
import { Subject } from 'rxjs';
import { ConstanciasService } from '../../../registros/nacimientos/constancias.service';

@Component({
  selector: 'app-eliminar-constancia',
  templateUrl: './eliminar-constancia.component.html',
  styleUrls: ['../admin.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ReactiveFormsModule, FormsModule]
})
export class EliminarConstanciaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private constanciaService = inject(ConstanciasService);
  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);

  form: FormGroup;
  private destroy$ = new Subject<void>();

  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  constructor() {
    this.form = this.crearFormulario();
  }

  ngOnInit() { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private crearFormulario(): FormGroup {
    return this.fb.group({
      constancia_id: ['']
    });
  }

  eliminar(): void {
    if (this.form.invalid) return;

    const constancia_id = Number(this.form.get('constancia_id')?.value);

    if (!constancia_id) {
      this.error.set('Ingresa el ID de la constancia');
      return;
    }

    this.error.set(null);
    this.success.set(null);
    this.isLoading.set(true);

    this.constanciaService.deleteConstancia(constancia_id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          console.error('error al eliminar: ', err);
          this.error.set('Error al eliminar constancia de nacimiento');
          return [];
        })
      )
      .subscribe(response => {
        if (!response) return;
        this.success.set('Constancia de nacimiento eliminada exitosamente');
        this.form.reset();
      });
  }

  volver(): void {
    this.router.navigate(['/adminsys']);
  }
}
