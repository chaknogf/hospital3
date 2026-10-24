import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MenuEnfermeriaComponent } from './menu-enfermeria.component';

describe('MenuEnfermeriaComponent', () => {
  let component: MenuEnfermeriaComponent;
  let fixture: ComponentFixture<MenuEnfermeriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuEnfermeriaComponent],
      providers: [
        provideRouter([]),
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MenuEnfermeriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
