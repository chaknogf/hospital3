import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ConstanciaDefuncionComponent } from './constanciaDefuncion.component';

describe('ConstanciaDefuncionComponent', () => {
  let component: ConstanciaDefuncionComponent;
  let fixture: ComponentFixture<ConstanciaDefuncionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ConstanciaDefuncionComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConstanciaDefuncionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
