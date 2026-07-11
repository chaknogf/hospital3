// sigsa3-import.component.ts

import { Location } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Sigsa3Service } from '../sigsa3.service';
import { IconService } from '../../../service/icon.service';

@Component({
  selector: 'app-sigsa3-import',
  templateUrl: './sigsa3-import.component.html',
  styleUrls: ['./sigsa3-import.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule]
})
export class Sigsa3ImportComponent {

  private location = inject(Location);

  archivoSeleccionado: File | null = null;
  arrastrando = false;
  procesando = false;
  resultado: any = null;
  error: string | null = null;

  icons: { [key: string]: any } = {};

  constructor(
    private api: Sigsa3Service,
    private iconService: IconService
  ) {
    this.icons = {
      menu: this.iconService.getIcon('menuIcon'),
    };
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
      this.resultado = null;
      this.error = null;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.arrastrando = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.arrastrando = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.arrastrando = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.archivoSeleccionado = event.dataTransfer.files[0];
      this.resultado = null;
      this.error = null;
    }
  }

  importar(): void {
    if (!this.archivoSeleccionado) return;
    this.procesando = true;
    this.error = null;
    this.resultado = null;

    this.api.importarExcel(this.archivoSeleccionado).subscribe({
      next: (res) => { this.resultado = res; this.procesando = false; },
      error: (err) => {
        this.error = err.error?.detail || 'Error al importar archivo';
        this.procesando = false;
      }
    });
  }

  volver(): void { this.location.back(); }
}
