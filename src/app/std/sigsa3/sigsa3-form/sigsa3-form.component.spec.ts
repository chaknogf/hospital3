import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Sigsa3FormComponent } from './sigsa3-form.component';

describe('Sigsa3FormComponent', () => {
  let component: Sigsa3FormComponent;
  let fixture: ComponentFixture<Sigsa3FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ Sigsa3FormComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Sigsa3FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
