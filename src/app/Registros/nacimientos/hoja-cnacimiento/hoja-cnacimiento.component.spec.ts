/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { HojaCnacimientoComponent } from './hoja-cnacimiento.component';

describe('HojaCnacimientoComponent', () => {
  let component: HojaCnacimientoComponent;
  let fixture: ComponentFixture<HojaCnacimientoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HojaCnacimientoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HojaCnacimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
