import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CatalogoproComponent } from './catalogopro.component';

describe('CatalogoproComponent', () => {
  let component: CatalogoproComponent;
  let fixture: ComponentFixture<CatalogoproComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ CatalogoproComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CatalogoproComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
