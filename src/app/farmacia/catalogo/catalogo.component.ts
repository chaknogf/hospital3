import { Component, OnInit, inject, signal, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InsumosService } from '../../insumos/insumos.service';
import { AuthService } from '../../service/auth.service';
import { Insumo, InsumoListResponse } from '../../insumos/insumos.model';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Catálogo de Insumos</h2>
    <div class="flex flex-wrap gap-2 mb-4">
      <input [(ngModel)]="filtro" (ngModelChange)="onFiltroChange($event)" placeholder="Buscar código/nombre (Ctrl+K)" class="theme-input" #searchInput autofocus />
      <button (click)="cargar()" class="theme-btn theme-btn--primary">Buscar</button>
      <button (click)="mostrarForm = !mostrarForm" class="theme-btn theme-btn--primary">Nuevo insumo</button>
      <label *ngIf="esAdmin" class="theme-btn theme-btn--primary cursor-pointer">
        Importar CSV
        <input type="file" accept=".csv" (change)="onFile($event)" class="hidden" />
      </label>
    </div>
    <div *ngIf="mensajeImport()" class="mb-4 text-sm text-gray-700">{{ mensajeImport() }}</div>
    <form *ngIf="mostrarForm" (ngSubmit)="guardar()" class="border p-4 mb-4 rounded grid gap-2">
      <input [(ngModel)]="nuevo.renglon" name="renglon" placeholder="Renglón (261)" class="theme-input" required />
      <input [(ngModel)]="nuevo.codigo_insumo" name="codigo_insumo" placeholder="Código insumo" class="theme-input" required />
      <input [(ngModel)]="nuevo.nombre" name="nombre" placeholder="Nombre" class="theme-input" required />
      <textarea [(ngModel)]="nuevo.caracteristicas" name="caracteristicas" placeholder="Características" class="theme-input"></textarea>
      <button type="submit" class="theme-btn theme-btn--primary">Guardar</button>
    </form>
    <table class="theme-table w-full">
      <thead><tr><th >Código</th><th >Nombre</th><th >Renglón</th><th >Activo</th></tr></thead>
      <tbody>
        <tr *ngFor="let i of insumos">
          <td >{{ i.codigo_insumo }}</td>
          <td >{{ i.nombre }}</td>
          <td >{{ i.renglon }}</td>
          <td >{{ i.activo ? 'Sí' : 'No' }}</td>
        </tr>
      </tbody>
    </table>
    <p class="mt-2 text-sm text-gray-500">Total: {{ total }}</p>
  </div>
  `,
})
export class CatalogoComponent implements OnInit {
  private svc = inject(InsumosService);
  private auth = inject(AuthService);
  insumos: Insumo[] = [];
  total = 0;
  filtro = '';
  mostrarForm = false;
  private filtroTimer: any;
  mensajeImport = signal('');
  nuevo: any = { renglon: '', codigo_insumo: '', nombre: '', caracteristicas: '', activo: true };
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;
  get esAdmin(): boolean { return this.auth.getUsuarioActual().role === 'admin'; }

  @HostListener('document:keydown.control.k', ['$event'])
  onCtrlK(ev: Event) { ev.preventDefault(); this.searchInput?.nativeElement.focus(); }

  onFiltroChange(val: string) {
    this.filtro = val;
    clearTimeout(this.filtroTimer);
    this.filtroTimer = setTimeout(() => this.cargar(), 300);
  }

  ngOnInit() { this.cargar(); }

  cargar() {
    this.svc.listarInsumos({ search: this.filtro, limit: 100 }).subscribe((r: InsumoListResponse) => {
      this.insumos = r.items; this.total = r.total;
    });
  }

  guardar() {
    this.svc.crearInsumo(this.nuevo).subscribe(() => { this.mostrarForm = false; this.nuevo = { renglon: '', codigo_insumo: '', nombre: '', caracteristicas: '', activo: true }; this.cargar(); });
  }

  onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.svc.importarCsv(file).subscribe({
      next: (r: any) => { this.mensajeImport.set(`Importado: ${r.insumos_creados} creados, ${r.presentaciones_creadas} presentaciones, ${r.errores?.length || 0} errores`); this.cargar(); },
      error: () => this.mensajeImport.set('Error al importar CSV'),
    });
    input.value = '';
  }
}
