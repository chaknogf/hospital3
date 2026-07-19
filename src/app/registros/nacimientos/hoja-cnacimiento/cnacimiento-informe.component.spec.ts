import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CnAcimientoInformeComponent } from './cnacimiento-informe.component';

describe('CnAcimientoInformeComponent', () => {
  let component: CnAcimientoInformeComponent;
  let fixture: ComponentFixture<CnAcimientoInformeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ CnAcimientoInformeComponent ],
      providers: [
        
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CnAcimientoInformeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
