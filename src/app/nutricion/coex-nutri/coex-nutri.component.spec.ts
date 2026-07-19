import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoexNutriComponent } from './coex-nutri.component';

describe('CoexNutriComponent', () => {
  let component: CoexNutriComponent;
  let fixture: ComponentFixture<CoexNutriComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ CoexNutriComponent ],
      providers: [
        
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoexNutriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
