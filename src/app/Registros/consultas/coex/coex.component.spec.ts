/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CoexComponent } from './coex.component';

describe('CoexComponent', () => {
  let component: CoexComponent;
  let fixture: ComponentFixture<CoexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
