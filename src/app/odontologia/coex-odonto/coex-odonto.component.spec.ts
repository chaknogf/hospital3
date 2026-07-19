import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoexOdontoComponent } from './coex-odonto.component';

describe('CoexOdontoComponent', () => {
  let component: CoexOdontoComponent;
  let fixture: ComponentFixture<CoexOdontoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ CoexOdontoComponent ],
      providers: [
        
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoexOdontoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
