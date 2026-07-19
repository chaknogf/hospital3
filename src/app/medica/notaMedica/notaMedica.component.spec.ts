import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NotaMedicaComponent } from './notaMedica.component';

describe('NotaMedicaComponent', () => {
  let component: NotaMedicaComponent;
  let fixture: ComponentFixture<NotaMedicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ NotaMedicaComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NotaMedicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
