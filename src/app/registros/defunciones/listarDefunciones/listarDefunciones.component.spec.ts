import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ListarDefuncionesComponent } from './listarDefunciones.component';

describe('ListarDefuncionesComponent', () => {
  let component: ListarDefuncionesComponent;
  let fixture: ComponentFixture<ListarDefuncionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ListarDefuncionesComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListarDefuncionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
