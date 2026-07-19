import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HojaCoexOdontoComponent } from './HojaCoexOdonto.component';

describe('HojaCoexOdontoComponent', () => {
  let component: HojaCoexOdontoComponent;
  let fixture: ComponentFixture<HojaCoexOdontoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HojaCoexOdontoComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HojaCoexOdontoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
