import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CatalogoprocedimientoComponent } from './catalogoprocedimiento.component';

describe('CatalogoprocedimientoComponent', () => {
  let component: CatalogoprocedimientoComponent;
  let fixture: ComponentFixture<CatalogoprocedimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ CatalogoprocedimientoComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CatalogoprocedimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
