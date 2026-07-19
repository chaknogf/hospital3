import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CensoCamasListComponent } from './censo-camas-list.component';

describe('CensoCamasListComponent', () => {
  let component: CensoCamasListComponent;
  let fixture: ComponentFixture<CensoCamasListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ CensoCamasListComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CensoCamasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
