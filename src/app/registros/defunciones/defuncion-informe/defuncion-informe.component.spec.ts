import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefuncionInformeComponent } from './defuncion-informe.component';

describe('DefuncionInformeComponent', () => {
  let component: DefuncionInformeComponent;
  let fixture: ComponentFixture<DefuncionInformeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ DefuncionInformeComponent ],
      providers: [
        
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DefuncionInformeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
