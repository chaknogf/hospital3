/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CitaConteoComponent } from './citaConteo.component';

describe('CitaConteoComponent', () => {
  let component: CitaConteoComponent;
  let fixture: ComponentFixture<CitaConteoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CitaConteoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CitaConteoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
