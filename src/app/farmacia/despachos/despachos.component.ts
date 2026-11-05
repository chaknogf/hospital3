import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InsumosService } from '../../insumos/insumos.service';
import { AuthService } from '../../service/auth.service';
import { Despacho, DespachoListResponse, DespachoCreate, Lote, LoteListResponse, Almacen, AlmacenListResponse, Presentacion, PresentacionListResponse } from '../../insumos/insumos.model';

@Component({
  selector: 'app-despachos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">Despachos de almacén</h2>
      <button (click)="abrirForm()" class="theme-btn theme-btn--primary">Nuevo despacho</button>
    </div>

    <div *ngIf="mostrarForm" class="border p-4 rounded mb-4 grid gap-2">
      <select [(ngModel)]="form.tipo" class="theme-input">
        <option value="servicio">Servicio</option>
        <option value="paciente">Paciente</option>
        <option value="traslado">Traslado</option>
      </select>
      <select [(ngModel)]="form.almacen_origen_id" class="theme-input">
        <option [ngValue]="null">Almacén origen</option>
        <option *ngFor="let a of almacenes" [ngValue]="a.id">{{ a.codigo }} — {{ a.nombre }}</option>
      </select>
      <select *ngIf="form.tipo==='traslado'" [(ngModel)]="form.almacen_destino_id" class="theme-input">
        <option [ngValue]="null">Almacén destino</option>
        <option *ngFor="let a of almacenes" [ngValue]="a.id">{{ a.codigo }} — {{ a.nombre }}</option>
      </select>
      <select *ngIf="form.tipo==='servicio'" [(ngModel)]="form.servicio_destino_id" class="theme-input">
        <option [ngValue]="null">Servicio destino</option>
        <option *ngFor="let s of servicios" [ngValue]="s.id">{{ s.nombre || s.codigo }}</option>
      </select>
      <input *ngIf="form.tipo==='paciente'" type="number" [(ngModel)]="form.paciente_id" placeholder="Paciente ID" class="theme-input" />

      <div class="border p-2 rounded">
        <p class="text-sm font-semibold mb-1">Líneas (por presentación / código)</p>
        <div class="flex gap-2 mb-2">
          <select [(ngModel)]="linea.presentacion_id" (ngModelChange)="onPresentacionChange()" class="theme-input">
            <option [ngValue]="null">Seleccionar presentación</option>
            <option *ngFor="let p of presentaciones" [ngValue]="p.id">{{ p.codigo_presentacion }} — {{ p.nombre }}</option>
          </select>
          <select [(ngModel)]="linea.lote_id" class="theme-input">
            <option [ngValue]="null">Lote (FEFO sugerido: {{ sugeridoFEFO() }})</option>
            <option *ngFor="let l of lotesDePresentacion" [ngValue]="l.id">{{ l.id }} — {{ l.numero_lote }} (vence {{ l.fecha_vencimiento }}, stock {{ l.cantidad_actual }})</option>
          </select>
          <input type="number" [(ngModel)]="linea.cantidad" placeholder="Cantidad" class="theme-input" />
          <button type="button" (click)="agregarLinea()" class="theme-btn">Agregar</button>
        </div>
        <ul class="text-sm"><li *ngFor="let l of form.detalles">Lote {{ l.lote_id }} — {{ l.cantidad }}</li></ul>
      </div>
      <div class="flex gap-2">
        <button (click)="guardar()" class="theme-btn theme-btn--primary">Crear despacho</button>
        <button (click)="cerrarForm()" class="theme-btn">Cancelar</button>
      </div>
    </div>

    <table class="theme-table w-full text-sm">
      <thead><tr><th>Número</th><th>Tipo</th><th>Origen</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody>
        <tr *ngFor="let d of items">
          <td>{{ d.numero }}</td><td>{{ d.tipo }}</td><td>{{ d.almacen_origen_id }}</td><td>{{ d.estado }}</td>
          <td>
            <button *ngIf="esJefe && d.estado==='borrador'" (click)="despachar(d.id)" class="theme-btn--ghost mr-2" style="color: var(--theme-success)">Despachar</button>
            <button *ngIf="esJefe && d.estado==='borrador'" (click)="anular(d.id)" class="theme-btn--ghost" style="color: var(--theme-danger)">Anular</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  `,
})
export class DespachosComponent implements OnInit {
  private svc = inject(InsumosService);
  private auth = inject(AuthService);
  items: Despacho[] = [];
  lotes: Lote[] = [];
  almacenes: Almacen[] = [];
  presentaciones: Presentacion[] = [];
  servicios: any[] = [];
  mostrarForm = false;
  form: any = { tipo: 'servicio', almacen_origen_id: null, almacen_destino_id: null, servicio_destino_id: null, paciente_id: null, personal_receptor_id: null, observaciones: '', detalles: [] };
  linea: any = { presentacion_id: null, lote_id: null, cantidad: 0 };

  get esJefe(): boolean { const r = this.auth.getUsuarioActual().role; return r === 'admin' || r === 'jefe_farmacia'; }
  get lotesConStock(): Lote[] { return this.lotes.filter(l => l.cantidad_actual > 0); }
  get lotesDePresentacion(): Lote[] {
    if (!this.linea.presentacion_id) return [];
    return this.lotesConStock.filter(l => l.presentacion_id === this.linea.presentacion_id);
  }

  ngOnInit() {
    this.cargar();
    this.svc.listarLotes({ limit: 500 }).subscribe((r: LoteListResponse) => this.lotes = r.items);
    this.svc.listarAlmacenes({ limit: 100 }).subscribe((r: AlmacenListResponse) => this.almacenes = r.items);
    this.svc.listarPresentaciones({ limit: 500 }).subscribe((r: PresentacionListResponse) => this.presentaciones = r.items);
    this.svc.listarServicios().subscribe((r: any) => this.servicios = Array.isArray(r) ? r : (r?.items || []));
  }

  cargar() { this.svc.listarDespachos({ limit: 100 }).subscribe((r: DespachoListResponse) => this.items = r.items); }

  onPresentacionChange() {
    const sugerido = this.sugeridoFEFO();
    if (sugerido) this.linea.lote_id = sugerido;
  }

  sugeridoFEFO(): number | null {
    const candidatos = this.lotesDePresentacion
      .filter(l => !this.form.almacen_origen_id || l.almacen_id === this.form.almacen_origen_id)
      .sort((a, b) => new Date(a.fecha_vencimiento || '9999-12-31').getTime() - new Date(b.fecha_vencimiento || '9999-12-31').getTime());
    return candidatos.length ? candidatos[0].id : null;
  }

  abrirForm() { this.mostrarForm = true; this.form = { tipo: 'servicio', almacen_origen_id: null, almacen_destino_id: null, servicio_destino_id: null, paciente_id: null, personal_receptor_id: null, observaciones: '', detalles: [] }; this.linea = { presentacion_id: null, lote_id: null, cantidad: 0 }; }
  cerrarForm() { this.mostrarForm = false; }

  agregarLinea() {
    if (!this.linea.lote_id || !this.linea.cantidad) return;
    this.form.detalles.push({ lote_id: this.linea.lote_id, cantidad: this.linea.cantidad, costo_unitario: 0 });
    this.linea = { presentacion_id: null, lote_id: null, cantidad: 0 };
  }

  guardar() {
    const body: DespachoCreate = {
      tipo: this.form.tipo,
      almacen_origen_id: this.form.almacen_origen_id,
      almacen_destino_id: this.form.almacen_destino_id,
      servicio_destino_id: this.form.servicio_destino_id,
      paciente_id: this.form.paciente_id,
      personal_receptor_id: this.form.personal_receptor_id,
      observaciones: this.form.observaciones,
      detalles: this.form.detalles,
    };
    this.svc.crearDespacho(body).subscribe(() => { this.cerrarForm(); this.cargar(); });
  }

  despachar(id: number) { this.svc.despachar(id).subscribe(() => this.cargar()); }
  anular(id: number) { this.svc.anularDespacho(id).subscribe(() => this.cargar()); }
}
