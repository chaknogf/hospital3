import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sigsa3ImportComponent } from './sigsa3-import.component';

describe('Sigsa3ImportComponent', () => {
  let component: Sigsa3ImportComponent;
  let fixture: ComponentFixture<Sigsa3ImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ Sigsa3ImportComponent ],
      providers: [
        
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Sigsa3ImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
