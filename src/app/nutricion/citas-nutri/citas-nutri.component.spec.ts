import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { CitasNutriComponent } from './citas-nutri.component';

describe('CitasNutriComponent', () => {
  let component: CitasNutriComponent;
  let fixture: ComponentFixture<CitasNutriComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ CitasNutriComponent ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CitasNutriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
