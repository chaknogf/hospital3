import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ImprimirCitasComponent } from './imprimirCitas.component';

describe('ImprimirCitasComponent', () => {
  let component: ImprimirCitasComponent;
  let fixture: ComponentFixture<ImprimirCitasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ImprimirCitasComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImprimirCitasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
