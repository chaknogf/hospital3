import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InsumosService } from '../../insumos/insumos.service';
import { Almacen, AlmacenListResponse, Lote, LoteListResponse } from '../../insumos/insumos.model';

@Component({
  selector: 'app-almacenes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Almacenes y Lotes</h2>
    <h3 class="font-semibold">Almacenes</h3>
    <table class="w-full border-collapse mb-6">
      <thead><tr><th >Código</th><th >Nombre</th><th >Tipo</th></tr></thead>
      <tbody><tr *ngFor="let a of almacenes"><td >{{ a.codigo }}</td><td >{{ a.nombre }}</td><td >{{ a.tipo }}</td></tr></tbody>
    </table>
    <h3 class="font-semibold">Lotes (stock)</h3>
    <table class="theme-table w-full">
      <thead><tr><th >ID</th><th >Presentación</th><th >Almacén</th><th >Lote</th><th >Cantidad</th><th >Vencimiento</th></tr></thead>
      <tbody><tr *ngFor="let l of lotes">
        <td>{{ l.id }}</td><td>{{ l.presentacion_id }}</td><td>{{ l.almacen_id }}</td><td>{{ l.numero_lote }}</td>
        <td>{{ l.cantidad_actual }} <span *ngIf="l.cantidad_actual <= 0" class="theme-badge theme-badge--danger">Sin stock</span></td>
        <td>{{ l.fecha_vencimiento }} <span *ngIf="proximoAVencer(l)" class="theme-badge theme-badge--warning">Por vencer</span></td>
      </tr></tbody>
    </table>
    <h3 class="font-semibold mt-6">Ingreso de lote</h3>
    <form (ngSubmit)="ingresar()" class="grid gap-2 max-w-md">
      <input type="number" [(ngModel)]="ingreso.presentacion_id" name="p" placeholder="Presentación ID" class="theme-input" />
      <input type="number" [(ngModel)]="ingreso.almacen_id" name="a" placeholder="Almacén ID" class="theme-input" />
      <input [(ngModel)]="ingreso.numero_lote" name="l" placeholder="Número lote" class="theme-input" />
      <input type="number" [(ngModel)]="ingreso.cantidad" name="c" placeholder="Cantidad" class="theme-input" />
      <input type="number" [(ngModel)]="ingreso.costo_unitario" name="cu" placeholder="Costo unitario" class="theme-input" />
      <button type="submit" class="theme-btn theme-btn--primary">Ingresar</button>
    </form>
  </div>
  `,
})
export class AlmacenesComponent implements OnInit {
  private svc = inject(InsumosService);
  almacenes: Almacen[] = [];
  lotes: Lote[] = [];
  ingreso: any = { presentacion_id: null, almacen_id: null, numero_lote: '', cantidad: 0, costo_unitario: 0, observacion: '' };

  ngOnInit() {
    this.svc.listarAlmacenes({ limit: 100 }).subscribe((r: AlmacenListResponse) => this.almacenes = r.items);
    this.svc.listarLotes({ limit: 200 }).subscribe((r: LoteListResponse) => this.lotes = r.items);
  }

  ingresar() {
    this.svc.ingresarLote(this.ingreso).subscribe(() => {
      this.svc.listarLotes({ limit: 200 }).subscribe((r: LoteListResponse) => this.lotes = r.items);
    });
  }

  proximoAVencer(l: Lote): boolean {
    if (!l.fecha_vencimiento) return false;
    const hoy = new Date();
    const venc = new Date(l.fecha_vencimiento);
    const diff = (venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }
}
