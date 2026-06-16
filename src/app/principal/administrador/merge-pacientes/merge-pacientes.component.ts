import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../service/api.service';
import { PacienteService } from '../../../registros/patient/paciente.service';
import { Paciente } from '../../../interface/interfaces';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError, finalize } from 'rxjs';

@Component({
  selector: 'app-merge-pacientes',
  templateUrl: './merge-pacientes.component.html',
  styleUrls: ['../admin.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class MergePacientesComponent {
  private router = inject(Router);
  private api = inject(ApiService);
  private pacienteService = inject(PacienteService);

  principalId = signal<number | null>(null);
  principalDetail = signal<Paciente | null>(null);
  loadingPrincipal = signal(false);

  adicionales = signal<number[]>([null!, null!]);
  adicionalesDetails = signal<(Paciente | null)[]>([null, null]);
  loadingAdicional = signal<boolean[]>([]);

  confirmText = signal('');
  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  constructor() {
    this.loadingAdicional.set([false, false]);
  }

  agregarInput(): void {
    this.adicionales.update(arr => [...arr, null!]);
    this.adicionalesDetails.update(arr => [...arr, null]);
    this.loadingAdicional.update(arr => [...arr, false]);
  }

  quitarInput(index: number): void {
    this.adicionales.update(arr => arr.filter((_, i) => i !== index));
    this.adicionalesDetails.update(arr => arr.filter((_, i) => i !== index));
    this.loadingAdicional.update(arr => arr.filter((_, i) => i !== index));
  }

  setAdicional(index: number, value: string): void {
    const num = Number(value);
    this.adicionales.update(arr => {
      arr[index] = value ? num : null!;
      return [...arr];
    });
    this.adicionalesDetails.update(arr => {
      arr[index] = null;
      return [...arr];
    });
  }

  cargarPrincipal(): void {
    const id = this.principalId();
    if (!id) {
      this.error.set('Ingresa el ID del paciente principal');
      return;
    }

    this.error.set(null);
    this.principalDetail.set(null);
    this.loadingPrincipal.set(true);

    this.pacienteService.getPaciente(id).subscribe({
      next: p => {
        this.principalDetail.set(p);
        this.loadingPrincipal.set(false);
      },
      error: err => {
        console.error('error al cargar paciente principal: ', err);
        this.error.set('Error al cargar paciente principal');
        this.loadingPrincipal.set(false);
      }
    });
  }

  cargarAdicional(index: number): void {
    const id = this.adicionales()[index];
    if (!id) {
      this.error.set('Ingresa un ID válido');
      return;
    }

    this.error.set(null);
    this.loadingAdicional.update(arr => {
      arr[index] = true;
      return [...arr];
    });

    this.pacienteService.getPaciente(id).subscribe({
      next: p => {
        this.adicionalesDetails.update(arr => {
          arr[index] = p;
          return [...arr];
        });
        this.loadingAdicional.update(arr => {
          arr[index] = false;
          return [...arr];
        });
      },
      error: err => {
        console.error('error al cargar paciente: ', err);
        this.error.set(`Error al cargar paciente #${index + 1}`);
        this.loadingAdicional.update(arr => {
          arr[index] = false;
          return [...arr];
        });
      }
    });
  }

  todosCargados(): boolean {
    if (!this.principalDetail()) return false;
    const adicionales = this.adicionalesDetails();
    const idsValidos = this.adicionales().filter(id => id !== null && id !== undefined && id > 0);
    if (idsValidos.length < 1) return false;
    const cargados = adicionales.filter(d => d !== null);
    return cargados.length === idsValidos.length;
  }

  fusionar(): void {
    const principal = this.principalId();
    if (!principal) return;

    const adicionalesValidos = this.adicionales().filter(id => id !== null && id !== undefined && id > 0);
    if (adicionalesValidos.length < 1) return;

    this.error.set(null);
    this.success.set(null);
    this.isLoading.set(true);

    const ids = [principal, ...adicionalesValidos];

    this.api.mergePacientes(principal, ids)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          console.error('error al fusionar: ', err);
          this.error.set('Error al fusionar pacientes');
          return [];
        })
      )
      .subscribe(response => {
        if (!response) return;
        this.success.set('Pacientes fusionados exitosamente');
        this.principalId.set(null);
        this.principalDetail.set(null);
        this.adicionales.set([null!, null!]);
        this.adicionalesDetails.set([null, null]);
        this.confirmText.set('');
      });
  }

  volver(): void {
    this.router.navigate(['/adminsys']);
  }
}
