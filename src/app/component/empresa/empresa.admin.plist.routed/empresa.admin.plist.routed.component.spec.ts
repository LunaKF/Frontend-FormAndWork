/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Empresa.admin.plist.routedComponent } from './empresa.admin.plist.routed.component';

describe('Empresa.admin.plist.routedComponent', () => {
  let component: Empresa.admin.plist.routedComponent;
  let fixture: ComponentFixture<Empresa.admin.plist.routedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Empresa.admin.plist.routedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Empresa.admin.plist.routedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
