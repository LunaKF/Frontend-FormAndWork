/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Empresa.admin.view.routedComponent } from './empresa.admin.view.routed.component';

describe('Empresa.admin.view.routedComponent', () => {
  let component: Empresa.admin.view.routedComponent;
  let fixture: ComponentFixture<Empresa.admin.view.routedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Empresa.admin.view.routedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Empresa.admin.view.routedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
