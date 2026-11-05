import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InsumosService } from '../../insumos/insumos.service';
import { Atencion, AtencionListResponse, AtencionCreate } from '../../insumos/insumos.model';

@Component({
  selector: 'app-atenciones-insumos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Atenciones con consumo de insumos</h2>
    <form (ngSubmit)="crear()" class="border p-4 rounded mb-4 grid gap-2 max-w-md">
      <input type="number" [(ngModel)]="form.paciente_id" name="pac" placeholder="Paciente ID" class="theme-input" required />
      <input type="number" [(ngModel)]="form.servicio_id" name="svc" placeholder="Servicio ID" class="theme-input" />
      <button type="submit" class="theme-btn theme-btn--primary">Abrir atención</button>
    </form>
    <table class="theme-table w-full text-sm">
      <thead><tr><th >ID</th><th >Paciente</th><th >Estado</th><th >Acciones</th></tr></thead>
      <tbody>
        <tr *ngFor="let a of items">
          <td >{{ a.id }}</td>
          <td >{{ a.paciente_id }}</td>
          <td >{{ a.estado }}</td>
          <td >
            <button *ngIf="a.estado==='abierta'" (click)="finalizar(a.id)" class="theme-btn--ghost" style="color: var(--theme-success)">Finalizar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  `,
})
export class AtencionesInsumosComponent implements OnInit {
  private svc = inject(InsumosService);
  items: Atencion[] = [];
  form: any = { paciente_id: null, servicio_id: null, observaciones: '' };

  ngOnInit() { this.cargar(); }
  cargar() { this.svc.listarAtenciones({ limit: 100 }).subscribe((r: AtencionListResponse) => this.items = r.items); }
  crear() { this.svc.crearAtencion(this.form).subscribe(() => { this.form = { paciente_id: null, servicio_id: null, observaciones: '' }; this.cargar(); }); }
  finalizar(id: number) { this.svc.finalizarAtencion(id).subscribe(() => this.cargar()); }
}
