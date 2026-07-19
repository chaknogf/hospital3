import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HojaDefuncionComponent } from './hoja-defuncion.component';

describe('HojaDefuncionComponent', () => {
  let component: HojaDefuncionComponent;
  let fixture: ComponentFixture<HojaDefuncionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HojaDefuncionComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HojaDefuncionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
