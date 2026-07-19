import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PersonalSaludListComponent } from './personal-salud-list.component';

describe('PersonalSaludListComponent', () => {
  let component: PersonalSaludListComponent;
  let fixture: ComponentFixture<PersonalSaludListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ PersonalSaludListComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonalSaludListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
