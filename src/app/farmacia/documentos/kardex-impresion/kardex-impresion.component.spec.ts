import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { KardexImpresionComponent } from './kardex-impresion.component';
import { InsumosService } from '../../../insumos/insumos.service';
import { mockInsumosService } from '../../../insumos/insumos.service.mock';
import { Kardex } from '../../../insumos/insumos.model';

const MOVIMIENTOS: Kardex[] = [
  {
    id: 1,
    lote_id: 3,
    almacen_id: 1,
    tipo_movimiento: 'entrada',
    cantidad: 100,
    saldo_resultante: 100,
    costo_unitario: 2.5,
    referencia_tipo: 'ingreso',
    referencia_id: 9,
    observacion: '',
    fecha: '2026-11-07T08:00:00',
    lote_numero: 'L-001',
    insumo_nombre: 'Paracetamol',
    presentacion_nombre: 'Caja x 10',
    almacen_nombre: 'Bodega central',
  },
  {
    id: 2,
    lote_id: 3,
    almacen_id: 1,
    tipo_movimiento: 'salida',
    cantidad: 10,
    saldo_resultante: 90,
    costo_unitario: 2.5,
    referencia_tipo: 'despacho',
    referencia_id: 7,
    observacion: '',
    fecha: '2026-11-07T10:00:00',
    lote_numero: 'L-001',
    insumo_nombre: 'Paracetamol',
    presentacion_nombre: 'Caja x 10',
    almacen_nombre: 'Bodega central',
  },
];

describe('KardexImpresionComponent', () => {
  let fixture: ComponentFixture<KardexImpresionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KardexImpresionComponent],
      providers: [
        provideRouter([]),
        {
          provide: InsumosService,
          useValue: {
            ...mockInsumosService,
            listarKardex: () => of({ total: MOVIMIENTOS.length, items: MOVIMIENTOS }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(KardexImpresionComponent);
    fixture.detectChanges();
  });

  it('acumula los movimientos del periodo', () => {
    expect(fixture.componentInstance.items().length).toBe(2);
    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Paracetamol');
    expect(texto).toContain('Kardex de movimientos');
  });

  it('resume entradas y salidas', () => {
    const resumen = fixture.componentInstance.resumen();
    expect(resumen.find((k) => k.etiqueta === 'Entradas')?.valor).toBe(1);
    expect(resumen.find((k) => k.etiqueta === 'Salidas / consumos')?.valor).toBe(1);
  });
});
