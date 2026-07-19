import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HojaCnacimientoComponent } from './hoja-cnacimiento.component';

describe('HojaCnacimientoComponent', () => {
  let component: HojaCnacimientoComponent;
  let fixture: ComponentFixture<HojaCnacimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HojaCnacimientoComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HojaCnacimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
