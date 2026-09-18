import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { GestionEspecialidadesComponent } from './gestion-especialidades.component';

describe('GestionEspecialidadesComponent', () => {
  let component: GestionEspecialidadesComponent;
  let fixture: ComponentFixture<GestionEspecialidadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ GestionEspecialidadesComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionEspecialidadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
