import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordConectComponent } from './wordConect.component';

describe('WordConectComponent', () => {
  let component: WordConectComponent;
  let fixture: ComponentFixture<WordConectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ WordConectComponent ],
      providers: [
        
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WordConectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
