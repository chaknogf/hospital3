import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Sigsa3DxFrecuentesComponent } from './sigsa3-dx-frecuentes.component';

describe('Sigsa3DxFrecuentesComponent', () => {
  let component: Sigsa3DxFrecuentesComponent;
  let fixture: ComponentFixture<Sigsa3DxFrecuentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ Sigsa3DxFrecuentesComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Sigsa3DxFrecuentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
