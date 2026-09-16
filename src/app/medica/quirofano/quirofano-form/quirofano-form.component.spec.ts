import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { QuirofanoFormComponent } from './quirofano-form.component';

describe('QuirofanoFormComponent', () => {
  let component: QuirofanoFormComponent;
  let fixture: ComponentFixture<QuirofanoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ QuirofanoFormComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuirofanoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});