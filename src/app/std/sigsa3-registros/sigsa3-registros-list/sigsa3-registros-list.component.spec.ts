import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Sigsa3RegistrosListComponent } from './sigsa3-registros-list.component';

describe('Sigsa3RegistrosListComponent', () => {
  let component: Sigsa3RegistrosListComponent;
  let fixture: ComponentFixture<Sigsa3RegistrosListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ Sigsa3RegistrosListComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sigsa3RegistrosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
