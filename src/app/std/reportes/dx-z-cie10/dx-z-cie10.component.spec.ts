import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DxZCie10Component } from './dx-z-cie10.component';

describe('DxZCie10Component', () => {
  let component: DxZCie10Component;
  let fixture: ComponentFixture<DxZCie10Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ DxZCie10Component ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DxZCie10Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
