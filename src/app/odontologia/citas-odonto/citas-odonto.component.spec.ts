import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { CitasOdontoComponent } from './citas-odonto.component';

describe('CitasOdontoComponent', () => {
  let component: CitasOdontoComponent;
  let fixture: ComponentFixture<CitasOdontoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ CitasOdontoComponent ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CitasOdontoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
