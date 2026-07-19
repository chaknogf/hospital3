import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ImprimirCoexComponent } from './imprimirCoex.component';

describe('ImprimirCoexComponent', () => {
  let component: ImprimirCoexComponent;
  let fixture: ComponentFixture<ImprimirCoexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ImprimirCoexComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImprimirCoexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
