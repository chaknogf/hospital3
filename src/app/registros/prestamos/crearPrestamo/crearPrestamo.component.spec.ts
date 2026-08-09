import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CrearPrestamoComponent } from './crearPrestamo.component';

describe('CrearPrestamoComponent', () => {
  let component: CrearPrestamoComponent;
  let fixture: ComponentFixture<CrearPrestamoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearPrestamoComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearPrestamoComponent);
    component = fixture.componentInstance;
    // Evita cargar consultas/préstamos al inicializar (sin router params reales)
    component.modoEditar = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('validarFechas rechaza fecha limite anterior al prestamo', () => {
    component.modoEditar = false;
    component.form.fecha_prestamo = '2026-08-10T10:00';
    component.form.fecha_limite = '2026-08-09T10:00';
    expect(component.validarFechas()).toContain('fecha límite');
  });

  it('validarFechas permite rango correcto', () => {
    component.modoEditar = false;
    component.form.fecha_prestamo = '2026-08-10T10:00';
    component.form.fecha_limite = '2026-08-12T10:00';
    expect(component.validarFechas()).toBeNull();
  });

  it('guardar exige id_paciente y solicitante', () => {
    component.form.id_paciente = 0;
    component.form.solicitante = '';
    spyOn(component as any, 'mostrarMensaje').and.callThrough();
    component.guardar();
    expect(component.mensaje()?.tipo).toBe('error');
  });

  it('validarFechas rechaza devolucion anterior', () => {
    component.modoEditar = true;
    component.form.fecha_prestamo = '2026-08-10T10:00';
    component.formUpdate.fecha_devolucion = '2026-08-09T10:00';
    expect(component.validarFechas()).toContain('devolución');
  });

  it('aDateTimeLocal devuelve "" para null/vacio', () => {
    const h = (component as any).aDateTimeLocal;
    expect(h(null)).toBe('');
    expect(h(undefined)).toBe('');
    expect(h('')).toBe('');
  });

  it('aDateTimeLocal convierte ISO con zona horaria a YYYY-MM-DDTHH:mm', () => {
    const h = (component as any).aDateTimeLocal;
    const out = h('2026-06-11T09:17:50.917279-06:00');
    expect(out).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  it('rellenarFormDesde convierte fechas y mantiene resto de campos', () => {
    const prestamo: any = {
      id_paciente: 56704,
      id_consulta: null,
      expediente: '26A-1547',
      fecha_prestamo: '2026-06-11T09:17:50.917279-06:00',
      fecha_limite: '2026-06-15T08:00:00-06:00',
      fecha_devolucion: null,
      solicitante: 'DRA. PEREZ',
      motivo: 'consulta externa',
      tipo_documento: 'EXPEDIENTE',
      activo: true,
      ubicacion: 'Archivo central',
      nota: '',
      usuario_entrega: 'admin',
      usuario_recibe: null,
    };
    (component as any).rellenarFormDesde(prestamo);
    expect(component.form.id_paciente).toBe(56704);
    expect(component.form.expediente).toBe('26A-1547');
    expect(component.form.fecha_prestamo).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    expect(component.form.fecha_limite).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    expect(component.formUpdate.fecha_devolucion).toBe('');
    expect(component.form.solicitante).toBe('DRA. PEREZ');
    expect(component.usuarioEntrega).toBe('admin');
    expect(component.usuarioRecibe).toBeNull();
  });

  it('rellenarFormDesde con fecha_devolucion set la convierte', () => {
    const prestamo: any = {
      id_paciente: 1,
      id_consulta: null,
      expediente: '',
      fecha_prestamo: '2026-06-02T08:22:00-06:00',
      fecha_limite: null,
      fecha_devolucion: '2026-06-02T09:39:00-06:00',
      solicitante: 'ENFERM. LOPEZ',
      motivo: '',
      tipo_documento: 'EXPEDIENTE',
      activo: false,
      ubicacion: '',
      nota: '',
      usuario_entrega: 'admin',
      usuario_recibe: 'supervisor',
    };
    (component as any).rellenarFormDesde(prestamo);
    expect(component.formUpdate.fecha_devolucion).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    expect(component.form.activo).toBe(false);
    expect(component.usuarioRecibe).toBe('supervisor');
  });
});