import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MergePacientesComponent } from './merge-pacientes.component';

describe('MergePacientesComponent', () => {
  let component: MergePacientesComponent;
  let fixture: ComponentFixture<MergePacientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MergePacientesComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MergePacientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
