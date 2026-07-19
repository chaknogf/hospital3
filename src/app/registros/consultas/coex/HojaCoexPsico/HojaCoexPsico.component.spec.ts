import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HojaCoexPsicoComponent } from './HojaCoexPsico.component';

describe('HojaCoexPsicoComponent', () => {
  let component: HojaCoexPsicoComponent;
  let fixture: ComponentFixture<HojaCoexPsicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HojaCoexPsicoComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HojaCoexPsicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
