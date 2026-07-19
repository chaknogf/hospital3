import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PersonalSaludFormComponent } from './personal-salud-form.component';

describe('PersonalSaludFormComponent', () => {
  let component: PersonalSaludFormComponent;
  let fixture: ComponentFixture<PersonalSaludFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ PersonalSaludFormComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonalSaludFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
