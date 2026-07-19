import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MenuOdontoComponent } from './menu-odonto.component';

describe('MenuOdontoComponent', () => {
  let component: MenuOdontoComponent;
  let fixture: ComponentFixture<MenuOdontoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MenuOdontoComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MenuOdontoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
