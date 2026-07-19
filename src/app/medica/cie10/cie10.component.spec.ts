import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { Cie10Component } from './cie10.component';

describe('Cie10Component', () => {
  let component: Cie10Component;
  let fixture: ComponentFixture<Cie10Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ Cie10Component ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Cie10Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
