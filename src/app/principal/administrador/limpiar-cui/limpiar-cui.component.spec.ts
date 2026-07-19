import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { LimpiarCuiComponent } from './limpiar-cui.component';

describe('LimpiarCuiComponent', () => {
  let component: LimpiarCuiComponent;
  let fixture: ComponentFixture<LimpiarCuiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ LimpiarCuiComponent ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LimpiarCuiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
