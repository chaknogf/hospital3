import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { GestionMunicipiosComponent } from './gestion-municipios.component';

describe('GestionMunicipiosComponent', () => {
  let component: GestionMunicipiosComponent;
  let fixture: ComponentFixture<GestionMunicipiosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ GestionMunicipiosComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionMunicipiosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
