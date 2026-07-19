import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MenuNutriComponent } from './menu-nutri.component';

describe('MenuNutriComponent', () => {
  let component: MenuNutriComponent;
  let fixture: ComponentFixture<MenuNutriComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MenuNutriComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MenuNutriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
