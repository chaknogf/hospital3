import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MenutsComponent } from './menuts.component';

describe('MenutsComponent', () => {
  let component: MenutsComponent;
  let fixture: ComponentFixture<MenutsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MenutsComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MenutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
