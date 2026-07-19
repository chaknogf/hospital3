import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PacientesAtendidosComponent } from './pacientesAtendidos.component';

describe('PacientesAtendidosComponent', () => {
  let component: PacientesAtendidosComponent;
  let fixture: ComponentFixture<PacientesAtendidosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ PacientesAtendidosComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PacientesAtendidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
