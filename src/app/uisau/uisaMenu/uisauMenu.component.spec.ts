import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { UisauMenuComponent } from './uisauMenu.component';

describe('UisauMenuComponent', () => {
  let component: UisauMenuComponent;
  let fixture: ComponentFixture<UisauMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ UisauMenuComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UisauMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
