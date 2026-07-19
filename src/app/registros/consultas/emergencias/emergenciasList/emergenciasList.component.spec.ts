import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { EmergenciasListComponent } from './emergenciasList.component';

describe('EmergenciasListComponent', () => {
  let component: EmergenciasListComponent;
  let fixture: ComponentFixture<EmergenciasListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EmergenciasListComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmergenciasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
