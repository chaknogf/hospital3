import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CensoCamasImportComponent } from './censo-camas-import.component';

describe('CensoCamasImportComponent', () => {
  let component: CensoCamasImportComponent;
  let fixture: ComponentFixture<CensoCamasImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ CensoCamasImportComponent ],
      providers: [
        
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CensoCamasImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
