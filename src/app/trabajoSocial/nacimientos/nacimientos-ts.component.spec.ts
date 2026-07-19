import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NacimientosTsComponent } from './nacimientos-ts.component';

describe('NacimientosTsComponent', () => {
  let component: NacimientosTsComponent;
  let fixture: ComponentFixture<NacimientosTsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ NacimientosTsComponent ],
      providers: [
        
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NacimientosTsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
