import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CnAcimientoInformeAuxiliarComponent } from './cnacimiento-informe-auxiliar.component';

describe('CnAcimientoInformeAuxiliarComponent', () => {
  let component: CnAcimientoInformeAuxiliarComponent;
  let fixture: ComponentFixture<CnAcimientoInformeAuxiliarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ CnAcimientoInformeAuxiliarComponent ],
      providers: [
        
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CnAcimientoInformeAuxiliarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
