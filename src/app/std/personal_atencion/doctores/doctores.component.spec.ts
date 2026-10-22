import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DoctoresComponent } from './doctores.component';

describe('DoctoresComponent', () => {
  let component: DoctoresComponent;
  let fixture: ComponentFixture<DoctoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ DoctoresComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DoctoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
