import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NacimientoFormComponent } from './nacimiento-form.component';

describe('NacimientoFormComponent', () => {
  let component: NacimientoFormComponent;
  let fixture: ComponentFixture<NacimientoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ NacimientoFormComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NacimientoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
