/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SignosVitalesComponent } from './signosVitales.component';

describe('SignosVitalesComponent', () => {
  let component: SignosVitalesComponent;
  let fixture: ComponentFixture<SignosVitalesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignosVitalesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignosVitalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
