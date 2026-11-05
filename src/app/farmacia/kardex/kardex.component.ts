import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InsumosService } from '../../insumos/insumos.service';
import { Kardex, KardexListResponse } from '../../insumos/insumos.model';

@Component({
  selector: 'app-kardex',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Kardex (libro mayor)</h2>
    <table class="theme-table w-full text-sm">
      <thead><tr><th >Fecha</th><th >Lote</th><th >Almacén</th><th >Tipo</th><th >Cantidad</th><th >Saldo</th><th >Ref</th></tr></thead>
      <tbody><tr *ngFor="let k of items"><td >{{ k.fecha | date:'short' }}</td><td >{{ k.lote_id }}</td><td >{{ k.almacen_id }}</td><td >{{ k.tipo_movimiento }}</td><td >{{ k.cantidad }}</td><td >{{ k.saldo_resultante }}</td><td >{{ k.referencia_tipo }}#{{ k.referencia_id }}</td></tr></tbody>
    </table>
    <p class="mt-2 text-sm text-gray-500">Total: {{ total }}</p>
  </div>
  `,
})
export class KardexComponent implements OnInit {
  private svc = inject(InsumosService);
  items: Kardex[] = [];
  total = 0;
  ngOnInit() { this.svc.listarKardex({ limit: 200 }).subscribe((r: KardexListResponse) => { this.items = r.items; this.total = r.total; }); }
}
