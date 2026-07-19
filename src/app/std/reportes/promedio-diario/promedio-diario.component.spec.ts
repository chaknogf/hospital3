import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PromedioDiarioComponent } from './promedio-diario.component';

describe('PromedioDiarioComponent', () => {
  let component: PromedioDiarioComponent;
  let fixture: ComponentFixture<PromedioDiarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ PromedioDiarioComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PromedioDiarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
