import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PersonalHospitalListComponent } from './personal-hospital-list.component';

describe('PersonalHospitalListComponent', () => {
  let component: PersonalHospitalListComponent;
  let fixture: ComponentFixture<PersonalHospitalListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ PersonalHospitalListComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonalHospitalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
