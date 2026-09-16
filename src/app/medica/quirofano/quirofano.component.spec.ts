import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { QuirofanoComponent } from './quirofano.component';

describe('QuirofanoComponent', () => {
  let component: QuirofanoComponent;
  let fixture: ComponentFixture<QuirofanoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ QuirofanoComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuirofanoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});