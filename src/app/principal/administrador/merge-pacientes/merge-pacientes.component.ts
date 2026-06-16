import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../service/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError, finalize } from 'rxjs';

@Component({
  selector: 'app-merge-pacientes',
  templateUrl: './merge-pacientes.component.html',
  styleUrls: ['./merge-pacientes.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class MergePacientesComponent {
  private router = inject(Router);
  private api = inject(ApiService);

  principalId = signal<number | null>(null);
  adicionales = signal<number[]>([null!, null!]);

  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  agregarInput(): void {
    this.adicionales.update(arr => [...arr, null!]);
  }

  quitarInput(index: number): void {
    this.adicionales.update(arr => arr.filter((_, i) => i !== index));
  }

  setAdicional(index: number, value: string): void {
    const num = Number(value);
    this.adicionales.update(arr => {
      arr[index] = value ? num : null!;
      return [...arr];
    });
  }

  fusionar(): void {
    const principal = this.principalId();
    if (!principal) {
      this.error.set('Ingresa el ID del paciente principal');
      return;
    }

    const adicionalesValidos = this.adicionales().filter(id => id !== null && id !== undefined && id > 0);
    if (adicionalesValidos.length < 1) {
      this.error.set('Agrega al menos un ID de paciente a fusionar');
      return;
    }

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
        this.adicionales.set([null!, null!]);
      });
  }

  volver(): void {
    this.router.navigate(['/adminsys']);
  }
}
