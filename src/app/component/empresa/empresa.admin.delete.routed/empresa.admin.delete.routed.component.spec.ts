/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Empresa.admin.delete.routedComponent } from './empresa.admin.delete.routed.component';

describe('Empresa.admin.delete.routedComponent', () => {
  let component: Empresa.admin.delete.routedComponent;
  let fixture: ComponentFixture<Empresa.admin.delete.routedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Empresa.admin.delete.routedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Empresa.admin.delete.routedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
