import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { EliminarConstanciaComponent } from './eliminar-constancia.component';

describe('EliminarConstanciaComponent', () => {
  let component: EliminarConstanciaComponent;
  let fixture: ComponentFixture<EliminarConstanciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EliminarConstanciaComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EliminarConstanciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
