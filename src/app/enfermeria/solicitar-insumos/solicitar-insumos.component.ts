import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InsumosService } from '../../insumos/insumos.service';
import { Requisicion, RequisicionListResponse, RequisicionCreate, Presentacion, PresentacionListResponse } from '../../insumos/insumos.model';

@Component({
  selector: 'app-solicitar-insumos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Solicitar insumos (Enfermería)</h2>
    <form (ngSubmit)="enviar()" class="border p-4 rounded mb-4 grid gap-2 max-w-md">
      <select [(ngModel)]="form.servicio_solicitante_id" class="theme-input">
        <option [ngValue]="null">Servicio solicitante</option>
        <option *ngFor="let s of servicios" [ngValue]="s.id">{{ s.nombre || s.codigo }}</option>
      </select>
      <div class="flex gap-2">
        <select [(ngModel)]="linea.presentacion_id" class="theme-input">
          <option [ngValue]="null">Presentación</option>
          <option *ngFor="let p of presentaciones" [ngValue]="p.id">{{ p.codigo_presentacion }}</option>
        </select>
        <input type="number" [(ngModel)]="linea.cantidad_solicitada" placeholder="Cantidad" class="theme-input" />
        <button type="button" (click)="agregarLinea()" class="theme-btn">Agregar</button>
      </div>
      <ul class="text-sm"><li *ngFor="let l of form.detalles">Pres {{ l.presentacion_id }} — {{ l.cantidad_solicitada }}</li></ul>
      <button type="submit" class="theme-btn theme-btn--primary">Enviar requisición</button>
    </form>
    <h3 class="font-semibold">Mis requisiciones</h3>
    <table class="theme-table w-full text-sm">
      <thead><tr><th>Número</th><th>Estado</th></tr></thead>
      <tbody><tr *ngFor="let r of items"><td>{{ r.numero }}</td><td>{{ r.estado }}</td></tr></tbody>
    </table>
  </div>
  `,
})
export class SolicitarInsumosComponent implements OnInit {
  private svc = inject(InsumosService);
  items: Requisicion[] = [];
  servicios: any[] = [];
  presentaciones: Presentacion[] = [];
  form: any = { servicio_solicitante_id: null, detalles: [] };
  linea: any = { presentacion_id: null, cantidad_solicitada: 0 };

  ngOnInit() {
    this.cargar();
    this.svc.listarServicios().subscribe((r: any) => this.servicios = Array.isArray(r) ? r : (r?.items || []));
    this.svc.listarPresentaciones({ limit: 500 }).subscribe((r: PresentacionListResponse) => this.presentaciones = r.items);
  }
  cargar() { this.svc.listarRequisiciones({ limit: 100 }).subscribe((r: RequisicionListResponse) => this.items = r.items); }
  agregarLinea() { this.form.detalles.push({ presentacion_id: this.linea.presentacion_id, cantidad_solicitada: this.linea.cantidad_solicitada }); }
  enviar() {
    const body: RequisicionCreate = { servicio_solicitante_id: this.form.servicio_solicitante_id, detalles: this.form.detalles };
    this.svc.crearRequisicion(body).subscribe(() => { this.form = { servicio_solicitante_id: null, detalles: [] }; this.cargar(); });
  }
}
