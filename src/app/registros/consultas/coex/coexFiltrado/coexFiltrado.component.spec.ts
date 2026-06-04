/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CoexFiltradoComponent } from './coexFiltrado.component';

describe('CoexFiltradoComponent', () => {
  let component: CoexFiltradoComponent;
  let fixture: ComponentFixture<CoexFiltradoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoexFiltradoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoexFiltradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
