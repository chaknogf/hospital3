import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InsumosService } from '../../insumos/insumos.service';
import { Unidosis, UnidosisListResponse } from '../../insumos/insumos.model';

@Component({
  selector: 'app-unidosis-enfermeria',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Unidosis — Administración (pie de cama)</h2>
    <div class="grid gap-3">
      <div *ngFor="let u of items" class="theme-card p-4">
        <div class="flex justify-between items-center">
          <div>
            <p class="font-bold">{{ u.numero || 'Sin número' }}</p>
            <p class="text-sm text-gray-500">Paciente #{{ u.paciente_id }} — {{ u.estado }}</p>
          </div>
          <button *ngIf="u.estado==='preparada'"
                  (click)="administrar(u.id)"
                  class="theme-btn theme-btn--primary"
                  style="min-width: 120px; min-height: 48px; font-size: 1rem;">
            ✓ Administrar
          </button>
        </div>
      </div>
    </div>
  </div>
  `,
})
export class UnidosisEnfermeriaComponent implements OnInit {
  private svc = inject(InsumosService);
  items: Unidosis[] = [];
  ngOnInit() { this.svc.listarUnidosis({ limit: 100 }).subscribe((r: UnidosisListResponse) => this.items = r.items); }
  administrar(id: number) { this.svc.administrarUnidosis(id).subscribe(() => this.ngOnInit()); }
}
