import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InsumosService } from '../../insumos/insumos.service';
import { Unidosis, UnidosisListResponse } from '../../insumos/insumos.model';

@Component({
  selector: 'app-unidosis-farmacia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Unidosis (Farmacia — preparación)</h2>
    <p class="text-sm text-gray-500 mb-4">Plantillas de dosis: 1 cada 8h, 1 cada 12h, 1 cada 24h, 2 cada 8h</p>
    <table class="theme-table w-full text-sm mb-4">
      <thead><tr><th>Número</th><th>Paciente</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody>
        <tr *ngFor="let u of items">
          <td>{{ u.numero }}</td><td>{{ u.paciente_id }}</td><td>{{ u.estado }}</td>
          <td>
            <button *ngIf="u.estado==='preparada'" (click)="administrar(u.id)" class="theme-btn--ghost mr-2" style="color: var(--theme-success)">Administrar</button>
            <button *ngIf="u.estado==='preparada'" (click)="cancelar(u.id)" class="theme-btn--ghost" style="color: var(--theme-danger)">Cancelar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  `,
})
export class UnidosisFarmaciaComponent implements OnInit {
  private svc = inject(InsumosService);
  items: Unidosis[] = [];
  ngOnInit() { this.svc.listarUnidosis({ limit: 100 }).subscribe((r: UnidosisListResponse) => this.items = r.items); }
  administrar(id: number) { this.svc.administrarUnidosis(id).subscribe(() => this.ngOnInit()); }
  cancelar(id: number) { this.svc.cancelarUnidosis(id).subscribe(() => this.ngOnInit()); }
}
