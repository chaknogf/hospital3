import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HojaCoexComponent } from './HojaCoex.component';

describe('HojaCoexComponent', () => {
  let component: HojaCoexComponent;
  let fixture: ComponentFixture<HojaCoexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HojaCoexComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HojaCoexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
