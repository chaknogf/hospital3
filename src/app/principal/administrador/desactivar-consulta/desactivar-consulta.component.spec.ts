import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DesactivarConsultaComponent } from './desactivar-consulta.component';

describe('DesactivarConsultaComponent', () => {
  let component: DesactivarConsultaComponent;
  let fixture: ComponentFixture<DesactivarConsultaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ DesactivarConsultaComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DesactivarConsultaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
