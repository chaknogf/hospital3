/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EmergenciaComponent } from './emergencia.component';

describe('EmergenciaComponent', () => {
  let component: EmergenciaComponent;
  let fixture: ComponentFixture<EmergenciaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmergenciaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmergenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
