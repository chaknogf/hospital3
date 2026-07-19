import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HospitalizacionInfantilComponent } from './hospitalizacion-infantil.component';

describe('HospitalizacionInfantilComponent', () => {
  let component: HospitalizacionInfantilComponent;
  let fixture: ComponentFixture<HospitalizacionInfantilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HospitalizacionInfantilComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HospitalizacionInfantilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
