import { Component, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { PacienteService } from '../../../registros/patient/paciente.service';
import { Paciente } from '../../../interface/interfaces';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-limpiar-cui',
  templateUrl: './limpiar-cui.component.html',
  styleUrls: ['../admin.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule]
})
export class LimpiarCuiComponent implements OnDestroy {
  private router = inject(Router);
  private http = inject(HttpClient);
  private pacienteService = inject(PacienteService);

  private destroy$ = new Subject<void>();

  pacienteId = signal<number | null>(null);
  pacienteDetail = signal<Paciente | null>(null);
  loadingDetail = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  cargar(): void {
    const id = this.pacienteId();
    if (!id) {
      this.error.set('Ingresa el ID del paciente');
      return;
    }

    this.error.set(null);
    this.success.set(null);
    this.pacienteDetail.set(null);
    this.loadingDetail.set(true);

    this.pacienteService.getPaciente(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: p => {
        this.pacienteDetail.set(p);
        this.loadingDetail.set(false);
      },
      error: err => {
        console.error('error al cargar paciente: ', err);
        this.error.set('Error al cargar paciente');
        this.loadingDetail.set(false);
      }
    });
  }

  limpiarCui(): void {
    const id = this.pacienteId();
    if (!id) return;

    this.error.set(null);
    this.success.set(null);
    this.isLoading.set(true);

    this.http.patch(`${environment.apiUrl}/pacientes/${id}/limpiar-cui`, {})
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: () => {
          this.success.set('CUI eliminado del paciente exitosamente');
          this.pacienteDetail.set(null);
          this.pacienteId.set(null);
        },
        error: err => {
          console.error('error al limpiar CUI: ', err);
          this.error.set(err.error?.detail || 'Error al limpiar CUI del paciente');
        }
      });
  }

  volver(): void {
    this.router.navigate(['/adminsys']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
