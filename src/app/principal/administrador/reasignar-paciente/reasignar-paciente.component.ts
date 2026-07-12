import { Component, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

import { ConsultaService } from '../../../registros/consultas/consultas.service';
import { PacienteService } from '../../../registros/patient/paciente.service';
import { ConsultaOut } from '../../../interface/consultas';
import { Paciente } from '../../../interface/interfaces';

@Component({
  selector: 'app-reasignar-paciente',
  templateUrl: './reasignar-paciente.component.html',
  styleUrls: ['../admin.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CommonModule]
})
export class ReasignarPacienteComponent implements OnDestroy {
  private router = inject(Router);
  private consultaService = inject(ConsultaService);
  private pacienteService = inject(PacienteService);

  private destroy$ = new Subject<void>();

  consultaId = signal<number | null>(null);
  consulta = signal<ConsultaOut | null>(null);
  loadingConsulta = signal(false);

  nuevoPacienteId = signal<number | null>(null);
  nuevoPaciente = signal<Paciente | null>(null);
  loadingPaciente = signal(false);

  saving = signal(false);
  confirmText = signal('');
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  cargarConsulta(): void {
    const id = this.consultaId();
    if (!id) { this.error.set('Ingresa el ID de la consulta'); return; }

    this.error.set(null);
    this.success.set(null);
    this.loadingConsulta.set(true);
    this.consulta.set(null);

    this.consultaService.getConsultaId(id).pipe(
      catchError(() => { this.error.set('Error al cargar consulta'); return of(null); }),
      takeUntil(this.destroy$)
    ).subscribe(data => {
      this.loadingConsulta.set(false);
      if (data) this.consulta.set(data);
    });
  }

  cargarPaciente(): void {
    const id = this.nuevoPacienteId();
    if (!id) { this.error.set('Ingresa el ID del paciente'); return; }

    this.error.set(null);
    this.success.set(null);
    this.loadingPaciente.set(true);
    this.nuevoPaciente.set(null);

    this.pacienteService.getPaciente(id).pipe(
      catchError(() => { this.error.set('Error al cargar paciente'); return of(null); }),
      takeUntil(this.destroy$)
    ).subscribe(data => {
      this.loadingPaciente.set(false);
      if (data) this.nuevoPaciente.set(data);
    });
  }

  reasignar(): void {
    const cid = this.consultaId();
    const pid = this.nuevoPacienteId();
    if (!cid || !pid) return;

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    this.consultaService.reasignarPaciente(cid, pid).pipe(
      catchError(err => {
        this.error.set('Error al reasignar paciente');
        this.saving.set(false);
        return of(null);
      }),
      takeUntil(this.destroy$)
    ).subscribe(result => {
      this.saving.set(false);
      if (result) {
        this.success.set('Paciente reasignado exitosamente');
        this.consulta.set(result);
        this.nuevoPaciente.set(null);
        this.confirmText.set('');
      }
    });
  }

  volver(): void {
    this.router.navigate(['/adminsys']);
  }

  get nombreActual(): string {
    const p = this.consulta()?.paciente;
    if (!p?.nombre) return '—';
    const n = p.nombre;
    return [n.primer_nombre, n.segundo_nombre, n.otro_nombre, n.primer_apellido, n.segundo_apellido].filter(Boolean).join(' ');
  }

  get nombreNuevo(): string {
    const p = this.nuevoPaciente();
    if (!p?.nombre) return '';
    const n = p.nombre;
    return [n.primer_nombre, n.segundo_nombre, n.otro_nombre, n.primer_apellido, n.segundo_apellido].filter(Boolean).join(' ');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
