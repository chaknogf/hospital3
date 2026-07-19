import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ListaNacimientosComponent } from './lista-nacimientos.component';

describe('ListaNacimientosComponent', () => {
  let component: ListaNacimientosComponent;
  let fixture: ComponentFixture<ListaNacimientosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ListaNacimientosComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListaNacimientosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
