/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CitadosComponent } from './citados.component';

describe('CitadosComponent', () => {
  let component: CitadosComponent;
  let fixture: ComponentFixture<CitadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CitadosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CitadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
