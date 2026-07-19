import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CitadosComponent } from './citados.component';

describe('CitadosComponent', () => {
  let component: CitadosComponent;
  let fixture: ComponentFixture<CitadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ CitadosComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CitadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
