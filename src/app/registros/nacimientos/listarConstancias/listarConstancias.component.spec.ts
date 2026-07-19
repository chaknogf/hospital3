import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ListarConstanciasComponent } from './listarConstancias.component';

describe('ListarConstanciasComponent', () => {
  let component: ListarConstanciasComponent;
  let fixture: ComponentFixture<ListarConstanciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ListarConstanciasComponent ],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListarConstanciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
