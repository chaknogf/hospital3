import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { RenapComponent } from './renap.component';

describe('RenapComponent', () => {
  let component: RenapComponent;
  let fixture: ComponentFixture<RenapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ RenapComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RenapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
