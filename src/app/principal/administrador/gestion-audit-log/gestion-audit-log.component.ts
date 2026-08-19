import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../service/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuditLogResponse, AuditLogEntry } from '../../../interface/interfaces';
import { FechasPipe } from '../../../pipes/fecha.pipe';

@Component({
  selector: 'app-gestion-audit-log',
  templateUrl: './gestion-audit-log.component.html',
  styleUrls: [],
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
  filtros: any = {
    tabla: '',
    username: '',
    desde: '',
    hasta: '',
    skip: 0,
    limit: 50,
  };

  constructor() { }

  ngOnInit() {
    this.cargarAuditLogs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargar(): void {
    this.cargarAuditLogs();
  }

  volver(): void {
    this.router.navigate(['/adminsys']);
  }

  cargarAuditLogs(): void {
    this.loading = true;
    this.api.getAuditLog(this.filtros).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: AuditLogResponse) => {
        this.auditLogs = (response.logs || []).sort((a: AuditLogEntry, b: AuditLogEntry) => 
          new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime()
        );
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

  limpiarFiltros(): void {
    this.filtros = {
      tabla: '', username: '', desde: '', hasta: '',
      skip: 0, limit: 50,
    }
    this.cargarAuditLogs();
  }
}