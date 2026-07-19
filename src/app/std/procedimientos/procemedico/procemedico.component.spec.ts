import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ProcemedicoComponent } from './procemedico.component';

describe('ProcemedicoComponent', () => {
  let component: ProcemedicoComponent;
  let fixture: ComponentFixture<ProcemedicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ProcemedicoComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProcemedicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
