import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ReingresosComponent } from './reingresos.component';

describe('ReingresosComponent', () => {
  let component: ReingresosComponent;
  let fixture: ComponentFixture<ReingresosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ReingresosComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReingresosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
