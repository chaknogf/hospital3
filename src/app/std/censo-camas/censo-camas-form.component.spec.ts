import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CensoCamasFormComponent } from './censo-camas-form.component';

describe('CensoCamasFormComponent', () => {
  let component: CensoCamasFormComponent;
  let fixture: ComponentFixture<CensoCamasFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ CensoCamasFormComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CensoCamasFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
