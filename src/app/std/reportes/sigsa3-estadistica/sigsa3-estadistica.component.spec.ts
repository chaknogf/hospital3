import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Sigsa3EstadisticaComponent } from './sigsa3-estadistica.component';

describe('Sigsa3EstadisticaComponent', () => {
  let component: Sigsa3EstadisticaComponent;
  let fixture: ComponentFixture<Sigsa3EstadisticaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ Sigsa3EstadisticaComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Sigsa3EstadisticaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
