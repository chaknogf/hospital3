import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { DespachoImpresionComponent } from './despacho-impresion.component';
import { InsumosService } from '../../../insumos/insumos.service';
import { mockInsumosService } from '../../../insumos/insumos.service.mock';
import { Despacho } from '../../../insumos/insumos.model';

const DESPACHO: Despacho = {
  id: 7,
  numero: 'DES-2026-000007',
  tipo: 'servicio',
  almacen_origen_id: 1,
  almacen_origen_nombre: 'Bodega central',
  servicio_destino_id: 2,
  servicio_destino_nombre: 'Emergencia',
  estado: 'despachado',
  fecha: '2026-11-07T10:30:00',
  observaciones: 'Entrega de turno',
  activo: true,
  created_at: '2026-11-07T10:30:00',
  updated_at: '2026-11-07T10:30:00',
  detalles: [
    {
      id: 1,
      lote_id: 3,
      cantidad: 10,
      costo_unitario: 2.5,
      lote_numero: 'L-001',
      presentacion_codigo: 'TP-001',
      presentacion_nombre: 'Caja x 10',
      insumo_nombre: 'Paracetamol',
      created_at: '2026-11-07T10:30:00',
    },
  ],
};

describe('DespachoImpresionComponent', () => {
  let fixture: ComponentFixture<DespachoImpresionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DespachoImpresionComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '7' }) } },
        },
        {
          provide: InsumosService,
          useValue: { ...mockInsumosService, obtenerDespacho: () => of(DESPACHO) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DespachoImpresionComponent);
    fixture.detectChanges();
  });

  it('carga el despacho y muestra su número', () => {
    const texto = fixture.nativeElement.textContent as string;
    expect(fixture.componentInstance.despacho()?.id).toBe(7);
    expect(texto).toContain('DES-2026-000007');
    expect(texto).toContain('Paracetamol');
  });

  it('calcula unidades y costo totales', () => {
    expect(fixture.componentInstance.totalUnidades()).toBe(10);
    expect(fixture.componentInstance.totalCosto()).toBe(25);
  });
});
