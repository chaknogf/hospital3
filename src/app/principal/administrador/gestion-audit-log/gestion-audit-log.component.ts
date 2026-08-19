import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../service/api.service';
import { FechasPipe } from '../../../pipes/fecha.pipe';
import { AuditLogResponse, AuditLogEntry } from '../../../interface/interfaces';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-gestion-audit-log',
  templateUrl: './gestion-audit-log.component.html',
  styleUrls: ['./gestion-audit-log.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, FechasPipe]
})
export class GestionAuditLogComponent implements OnInit, OnDestroy {

  private router = inject(Router);
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  private destroy$ = new Subject<void>();

  auditLogs: AuditLogEntry[] = [];
  totalRegistros = 0;
  loading = false;

  filtros = {
    tabla: '',
    username: '',
    desde: '',
    hasta: '',
    skip: 0,
    limit: 50,
  };

  ngOnInit() {
    this.cargarAuditLogs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargar() {
    this.cargarAuditLogs();
  }

  volver() {
    this.router.navigate(['/adminsys']);
  }

  limpiarFiltros() {
    this.filtros = {
      tabla: '', username: '', desde: '', hasta: '',
      skip: 0, limit: 50,
    };
    this.cargarAuditLogs();
  }

  sortLogs(): AuditLogEntry[] {
    return [...this.auditLogs].sort((a: AuditLogEntry, b: AuditLogEntry) => 
      new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime()
    );
  }

  cargarAuditLogs(): void {
    this.loading = true;
    this.api.getAuditLog(this.filtros).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: AuditLogResponse) => {
        this.auditLogs = response.logs || [];
        this.totalRegistros = response.total || 0;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error al cargar auditoría:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}