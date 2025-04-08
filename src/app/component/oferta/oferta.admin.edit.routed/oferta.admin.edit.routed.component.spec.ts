/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Oferta.admin.edit.routedComponent } from './oferta.admin.edit.routed.component';

describe('Oferta.admin.edit.routedComponent', () => {
  let component: Oferta.admin.edit.routedComponent;
  let fixture: ComponentFixture<Oferta.admin.edit.routedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Oferta.admin.edit.routedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Oferta.admin.edit.routedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
