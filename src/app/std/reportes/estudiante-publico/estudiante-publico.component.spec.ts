import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { EstudiantePublicoComponent } from './estudiante-publico.component';

describe('EstudiantePublicoComponent', () => {
  let component: EstudiantePublicoComponent;
  let fixture: ComponentFixture<EstudiantePublicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EstudiantePublicoComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EstudiantePublicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
