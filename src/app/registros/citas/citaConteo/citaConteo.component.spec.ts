import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitaConteoComponent } from './citaConteo.component';

describe('CitaConteoComponent', () => {
  let component: CitaConteoComponent;
  let fixture: ComponentFixture<CitaConteoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ CitaConteoComponent ],
      providers: [
        
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CitaConteoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
