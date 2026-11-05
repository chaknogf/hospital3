import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InsumosService } from '../../insumos/insumos.service';
import { AuthService } from '../../service/auth.service';
import { Requisicion, RequisicionListResponse } from '../../insumos/insumos.model';

@Component({
  selector: 'app-requisiciones',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Requisiciones (Farmacia)</h2>
    <div class="mb-2">
      <button (click)="filtrar('pendiente')" class="px-3 py-1 border rounded mr-1">Pendientes</button>
      <button (click)="filtrar('aprobada')" class="px-3 py-1 border rounded mr-1">Aprobadas</button>
      <button (click)="filtrar('despachada')" class="px-3 py-1 border rounded mr-1">Despachadas</button>
      <button (click)="filtrar(undefined)" class="px-3 py-1 border rounded">Todas</button>
    </div>
    <table class="theme-table w-full text-sm">
      <thead><tr><th >Número</th><th >Servicio</th><th >Estado</th><th >Acciones</th></tr></thead>
      <tbody>
        <tr *ngFor="let r of items">
          <td >{{ r.numero }}</td>
          <td >{{ r.servicio_solicitante_id }}</td>
          <td >{{ r.estado }}</td>
          <td >
            <button *ngIf="esJefe && r.estado==='pendiente'" (click)="aprobar(r.id)" class="theme-btn--ghost mr-2" style="color: var(--theme-success)">Aprobar</button>
            <button *ngIf="esJefe && r.estado==='pendiente'" (click)="rechazar(r.id)" class="theme-btn--ghost" style="color: var(--theme-danger)">Rechazar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  `,
})
export class RequisicionesComponent implements OnInit {
  private svc = inject(InsumosService);
  private auth = inject(AuthService);
  items: Requisicion[] = [];
  estado: string | undefined = 'pendiente';
  get esJefe(): boolean { const r = this.auth.getUsuarioActual().role; return r === 'admin' || r === 'jefe_farmacia'; }

  ngOnInit() { this.cargar(); }

  cargar() { this.svc.listarRequisiciones({ estado: this.estado, limit: 100 }).subscribe((r: RequisicionListResponse) => this.items = r.items); }
  filtrar(e: string | undefined) { this.estado = e; this.cargar(); }
  aprobar(id: number) { this.svc.aprobarRequisicion(id).subscribe(() => this.cargar()); }
  rechazar(id: number) { this.svc.rechazarRequisicion(id).subscribe(() => this.cargar()); }
}
