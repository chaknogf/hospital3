import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ActivosMayores7DiasComponent } from './activos-mayores-7-dias.component';

describe('ActivosMayores7DiasComponent', () => {
  let component: ActivosMayores7DiasComponent;
  let fixture: ComponentFixture<ActivosMayores7DiasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ActivosMayores7DiasComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActivosMayores7DiasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
