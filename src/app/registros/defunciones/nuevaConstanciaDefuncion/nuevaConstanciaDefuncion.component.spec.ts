import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NuevaConstanciaDefuncionComponent } from './nuevaConstanciaDefuncion.component';

describe('NuevaConstanciaDefuncionComponent', () => {
  let component: NuevaConstanciaDefuncionComponent;
  let fixture: ComponentFixture<NuevaConstanciaDefuncionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ NuevaConstanciaDefuncionComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NuevaConstanciaDefuncionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
