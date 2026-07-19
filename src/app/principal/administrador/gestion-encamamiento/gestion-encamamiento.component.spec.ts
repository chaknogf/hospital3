import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { GestionEncamamientoComponent } from './gestion-encamamiento.component';

describe('GestionEncamamientoComponent', () => {
  let component: GestionEncamamientoComponent;
  let fixture: ComponentFixture<GestionEncamamientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ GestionEncamamientoComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionEncamamientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
