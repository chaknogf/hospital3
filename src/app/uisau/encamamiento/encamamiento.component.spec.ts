import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { EncamamientoComponent } from './encamamiento.component';

describe('EncamamientoComponent', () => {
  let component: EncamamientoComponent;
  let fixture: ComponentFixture<EncamamientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EncamamientoComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EncamamientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
