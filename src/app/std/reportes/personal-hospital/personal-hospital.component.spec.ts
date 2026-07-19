import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PersonalHospitalComponent } from './personal-hospital.component';

describe('PersonalHospitalComponent', () => {
  let component: PersonalHospitalComponent;
  let fixture: ComponentFixture<PersonalHospitalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ PersonalHospitalComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonalHospitalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
