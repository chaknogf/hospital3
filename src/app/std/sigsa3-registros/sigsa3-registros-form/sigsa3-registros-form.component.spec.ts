import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Sigsa3RegistrosFormComponent } from './sigsa3-registros-form.component';

describe('Sigsa3RegistrosFormComponent', () => {
  let component: Sigsa3RegistrosFormComponent;
  let fixture: ComponentFixture<Sigsa3RegistrosFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ Sigsa3RegistrosFormComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sigsa3RegistrosFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
