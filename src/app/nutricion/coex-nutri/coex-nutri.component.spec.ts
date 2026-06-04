/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CoexNutriComponent } from './coex-nutri.component';

describe('CoexNutriComponent', () => {
  let component: CoexNutriComponent;
  let fixture: ComponentFixture<CoexNutriComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoexNutriComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoexNutriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
