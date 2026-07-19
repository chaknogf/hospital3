import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CoexListaComponent } from './coexLista.component';

describe('CoexListaComponent', () => {
  let component: CoexListaComponent;
  let fixture: ComponentFixture<CoexListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ CoexListaComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoexListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
