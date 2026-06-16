import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { catchError, finalize, takeUntil } from 'rxjs';
import { Subject } from 'rxjs';
import { ConsultaService } from '../../../registros/consultas/consultas.service';

@Component({
  selector: 'app-desactivar-consulta',
  templateUrl: './desactivar-consulta.component.html',
  styleUrls: ['./desactivar-consulta.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class DesactivarConsultaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private consultaService = inject(ConsultaService);
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

  ngOnInit() {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private crearFormulario(): FormGroup {
    return this.fb.group({
      consulta_id: ['']
    });
  }

  desactivar(): void {
    if (this.form.invalid) return;

    const consulta_id = Number(this.form.get('consulta_id')?.value);

    if (!consulta_id) {
      this.error.set('Ingresa el ID de la consulta');
      return;
    }

    this.error.set(null);
    this.success.set(null);
    this.isLoading.set(true);

    this.consultaService.updateConsulta(consulta_id, { ciclo: { estado: 'descartado' } })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          console.error('error al desactivar: ', err);
          this.error.set('Error al desactivar consulta');
          return [];
        })
      )
      .subscribe(response => {
        if (!response) return;
        this.success.set('Consulta desactivada exitosamente');
        this.form.reset();
      });
  }

  volver(): void {
    this.router.navigate(['/adminsys']);
  }
}
