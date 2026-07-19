import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { CoexFiltradoComponent } from './coexFiltrado.component';

describe('CoexFiltradoComponent', () => {
  let component: CoexFiltradoComponent;
  let fixture: ComponentFixture<CoexFiltradoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ CoexFiltradoComponent ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoexFiltradoComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('especialidad', 'TEST');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
