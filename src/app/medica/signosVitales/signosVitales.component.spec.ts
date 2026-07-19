import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignosVitalesComponent } from './signosVitales.component';

describe('SignosVitalesComponent', () => {
  let component: SignosVitalesComponent;
  let fixture: ComponentFixture<SignosVitalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SignosVitalesComponent ],
      providers: [
        
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SignosVitalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
