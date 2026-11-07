import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { InformePeriodoComponent } from './informe-periodo.component';
import { InsumosService } from '../../../insumos/insumos.service';
import { mockInsumosService } from '../../../insumos/insumos.service.mock';
import { Despacho, Kardex } from '../../../insumos/insumos.model';

const DESPACHOS: Despacho[] = [
  {
    id: 7,
    numero: 'DES-2026-000007',
    tipo: 'servicio',
    almacen_origen_id: 1,
    almacen_origen_nombre: 'Bodega central',
    servicio_destino_id: 2,
    servicio_destino_nombre: 'Emergencia',
    estado: 'despachado',
    fecha: '2026-11-07T10:30:00',
    observaciones: '',
    activo: true,
    created_at: '2026-11-07T10:30:00',
    updated_at: '2026-11-07T10:30:00',
    detalles: [
      {
        id: 1,
        lote_id: 3,
        cantidad: 10,
        costo_unitario: 0,
        lote_numero: 'L-001',
        presentacion_codigo: 'TP-001',
        presentacion_nombre: 'Caja x 10',
        insumo_nombre: 'Paracetamol',
        created_at: '2026-11-07T10:30:00',
      },
    ],
  },
];

const KARDEX: Kardex[] = [
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

describe('InformePeriodoComponent', () => {
  let fixture: ComponentFixture<InformePeriodoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InformePeriodoComponent],
      providers: [
        provideRouter([]),
        {
          provide: InsumosService,
          useValue: {
            ...mockInsumosService,
            listarDespachos: () => of({ total: DESPACHOS.length, items: DESPACHOS }),
            listarKardex: () => of({ total: KARDEX.length, items: KARDEX }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InformePeriodoComponent);
    fixture.detectChanges();
  });

  it('combina despachos y kardex', () => {
    expect(fixture.componentInstance.despachos().length).toBe(1);
    expect(fixture.componentInstance.kardex().length).toBe(1);
    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Informe de farmacia por periodo');
    expect(texto).toContain('DES-2026-000007');
  });

  it('calcula unidades y líneas despachadas', () => {
    expect(fixture.componentInstance.totalUnidades()).toBe(10);
    expect(fixture.componentInstance.totalLineas()).toBe(1);
  });
});
