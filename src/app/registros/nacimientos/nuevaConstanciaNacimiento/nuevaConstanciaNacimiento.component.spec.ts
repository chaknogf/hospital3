/* tslint:disable:no-unused-variable */
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NuevaConstanciaNacimientoComponent } from './nuevaConstanciaNacimiento.component';

describe('NuevaConstanciaNacimientoComponent', () => {
  let component: NuevaConstanciaNacimientoComponent;
  let fixture: ComponentFixture<NuevaConstanciaNacimientoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NuevaConstanciaNacimientoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NuevaConstanciaNacimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
