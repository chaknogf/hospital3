import { Component, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConsultaService } from '../../../registros/consultas/consultas.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-eliminar-consulta',
  templateUrl: './eliminar-consulta.component.html',
  styleUrls: ['../admin.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class EliminarConsultaComponent implements OnDestroy {
  private router = inject(Router);
  private consultaService = inject(ConsultaService);

  private destroy$ = new Subject<void>();

  consultaId = signal<number | null>(null);
  consultaDetail = signal<any | null>(null);
  confirmText = signal('');
  loadingDetail = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  cargar(): void {
    const id = this.consultaId();
    if (!id) {
      this.error.set('Ingresa el ID de la consulta');
      return;
    }

    this.error.set(null);
    this.success.set(null);
    this.consultaDetail.set(null);
    this.loadingDetail.set(true);

    this.consultaService.getConsultaId(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: consulta => {
        this.consultaDetail.set(consulta);
        this.loadingDetail.set(false);
      },
      error: err => {
        console.error('error al cargar consulta: ', err);
        this.error.set('Error al cargar consulta');
        this.loadingDetail.set(false);
      }
    });
  }

  eliminar(): void {
    const id = this.consultaId();
    if (!id) return;

    this.error.set(null);
    this.success.set(null);
    this.isLoading.set(true);

    this.consultaService.deleteConsulta(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.success.set('Consulta eliminada exitosamente');
        this.consultaId.set(null);
        this.consultaDetail.set(null);
        this.confirmText.set('');
      },
      error: err => {
        console.error('error al eliminar: ', err);
        this.error.set('Error al eliminar consulta');
        this.isLoading.set(false);
      },
      complete: () => this.isLoading.set(false)
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
