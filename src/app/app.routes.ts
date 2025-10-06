// src/app/app.routes.ts
import { Routes, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from './service/session.service'; // ajusta si tu path real es otro

// 403
import ForbiddenComponent from './component/errors/forbidden.component';

import { SharedMenuUnroutedComponent } from './component/shared/shared.menu.unrouted/shared.menu.unrouted.component';
import { SharedHomeRoutedComponent } from './component/shared/shared.home.routed/shared.home.routed.component';
import { SharedLoginRoutedComponent } from './component/shared/shared.login.routed/shared.login.routed.component';
import { SharedLogoutRoutedComponent } from './component/shared/shared.logout.routed/shared.logout.routed.component';

// ALUMNO (login)
import { AlumnoAlumnoPlistComponent } from './component/alumno/alumno.alumno.plist.routed/alumno.alumno.plist.routed.component';

// --- ADMIN ---
import { EmpresaAdminEditRoutedComponent } from './component/empresa/empresa.admin.edit.routed/empresa.admin.edit.routed.component';
import { EmpresaAdminCreateRoutedComponent } from './component/empresa/empresa.admin.create.routed/empresa.admin.create.routed.component';
import { EmpresaAdminPlistRoutedComponent } from './component/empresa/empresa.admin.plist.routed/empresa.admin.plist.routed.component';
import { EmpresaAdminDeleteRoutedComponent } from './component/empresa/empresa.admin.delete.routed/empresa.admin.delete.routed.component';
import { EmpresaAdminViewRoutedComponent } from './component/empresa/empresa.admin.view.routed/empresa.admin.view.routed.component';

import { SectorAdminPlistRoutedComponent } from './component/sector/sector.admin.plist.routed/sector.admin.plist.routed.component';

import { AlumnoAdminPlistComponent } from './component/alumno/alumno.admin.plist.routed/alumno.admin.plist.routed.component';
import { AlumnoAdminCreateComponent } from './component/alumno/alumno.admin.create.routed/alumno.admin.create.routed.component';
import { AlumnoAdminDeleteRoutedComponent } from './component/alumno/alumno.admin.delete.routed/alumno.admin.delete.routed.component';
import { AlumnoAdminEditRoutedComponent } from './component/alumno/alumno.admin.edit.routed/alumno.admin.edit.routed.component';

import { AlumnoXsectorAdminPlistComponent } from './component/alumno/alumno.xsector.admin.plist.routed/alumno.xsector.admin.plist.routed.component';
import { EmpresaXsectorAdminPlistComponent } from './component/empresa/empresa.xsector.admin.plist.routed/empresa.xsector.admin.plist.routed.component';
import { OfertaXsectorAdminPlistRoutedComponent } from './component/oferta/oferta.xsector.admin.plist.routed/oferta.xsector.admin.plist.routed.component';

import { CandidaturaAdminPlistRoutedComponent } from './component/candidatura/candidatura.admin.plist.routed/candidatura.admin.plist.routed.component';
import { CandidaturaAdminViewRoutedComponent } from './component/candidatura/candidatura.admin.view.routed/candidatura.admin.view.routed.component';
import { CandidaturaAdminDeleteRoutedComponent } from './component/candidatura/candidatura.admin.delete.routed/candidatura.admin.delete.routed.component';
import { CandidaturaXofertaAdminPlistRoutedComponent } from './component/candidatura/candidatura.xoferta.admin.plist.routed/candidatura.xoferta.admin.plist.routed.component';
import { CandidaturaXalumnoAdminPlistRoutedComponent } from './component/candidatura/candidatura.xalumno.admin.plist.routed/candidatura.xalumno.admin.plist.routed.component';

import { OfertaAdminPlistRoutedComponent } from './component/oferta/oferta.admin.plist.routed/oferta.admin.plist.routed.component';
import { OfertaAdminViewRoutedComponent } from './component/oferta/oferta.admin.view.routed/oferta.admin.view.routed.component';
import { OfertaAdminDeleteRoutedComponent } from './component/oferta/oferta.admin.delete.routed/oferta.admin.delete.routed.component';
import { OfertaAdminCreateRoutedComponent } from './component/oferta/oferta.admin.create.routed/oferta.admin.create.routed.component';
import { OfertaAdminEditRoutedComponent } from './component/oferta/oferta.admin.edit.routed/oferta.admin.edit.routed.component';
import { OfertaXempresaAdminPlistRoutedComponent } from './component/oferta/oferta.xempresa.admin.plist.routed/oferta.xempresa.admin.plist.routed.component';
import { AlumnoAdminViewRoutedComponent } from './component/alumno/alumno.admin.view.routed/alumno.admin.view.routed.component';

// --- Guard funcional inline: permite pasar a cualquiera que esté loggeado (admin, empresa o alumno)
const authGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);
  return session.isSessionActive()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { redirectTo: location.pathname } });
};

export const routes: Routes = [
  { path: '', component: SharedHomeRoutedComponent, pathMatch: 'full' },
  { path: 'home', component: SharedHomeRoutedComponent },
  { path: 'menu', component: SharedMenuUnroutedComponent },
  { path: 'login', component: SharedLoginRoutedComponent },
  { path: 'logout', component: SharedLogoutRoutedComponent },

  // Acceso denegado
  { path: '403', component: ForbiddenComponent },

  // ===== Todo lo "admin" (y también empresa/alumno) protegido por "estar loggeado" =====
  {
    path: 'admin',
    canActivate: [authGuard],   // ← cambia el antiguo AdminGuard por este guard de "login requerido"
    children: [
      { path: 'sector/plist', component: SectorAdminPlistRoutedComponent },

      { path: 'empresa/plist', component: EmpresaAdminPlistRoutedComponent },
      { path: 'empresa/create', component: EmpresaAdminCreateRoutedComponent },
      { path: 'empresa/edit/:id', component: EmpresaAdminEditRoutedComponent },
      { path: 'empresa/view/:id', component: EmpresaAdminViewRoutedComponent },
      { path: 'empresa/delete/:id', component: EmpresaAdminDeleteRoutedComponent },

      { path: 'alumno/plist', component: AlumnoAdminPlistComponent },
      { path: 'alumno/create', component: AlumnoAdminCreateComponent },
      { path: 'alumno/edit/:id', component: AlumnoAdminEditRoutedComponent },
      { path: 'alumno/view/:id', component: AlumnoAdminViewRoutedComponent },
      { path: 'alumno/delete/:id', component: AlumnoAdminDeleteRoutedComponent },

      { path: 'oferta/plist', component: OfertaAdminPlistRoutedComponent },
      { path: 'oferta/create', component: OfertaAdminCreateRoutedComponent },
      { path: 'oferta/edit/:id', component: OfertaAdminEditRoutedComponent },
      { path: 'oferta/view/:id', component: OfertaAdminViewRoutedComponent },
      { path: 'oferta/delete/:id', component: OfertaAdminDeleteRoutedComponent },

      { path: 'candidatura/plist', component: CandidaturaAdminPlistRoutedComponent },
      { path: 'candidatura/view/:id', component: CandidaturaAdminViewRoutedComponent },
      { path: 'candidatura/delete/:id', component: CandidaturaAdminDeleteRoutedComponent },

      // POR SECTOR
      { path: 'alumno/xsector/plist/:id', component: AlumnoXsectorAdminPlistComponent },
      { path: 'empresa/xsector/plist/:id', component: EmpresaXsectorAdminPlistComponent },
      { path: 'oferta/xsector/plist/:id', component: OfertaXsectorAdminPlistRoutedComponent },

      // POR EMPRESA
      { path: 'oferta/xempresa/plist/:id', component: OfertaXempresaAdminPlistRoutedComponent },

      // POR OFERTA
      { path: 'candidatura/xoferta/plist/:id', component: CandidaturaXofertaAdminPlistRoutedComponent },

      // POR ALUMNO
      { path: 'candidatura/xalumno/plist/:id', component: CandidaturaXalumnoAdminPlistRoutedComponent },
    ],
  },

  // Lista de ofertas pública (sin login)
  { path: 'oferta/plist', component: OfertaAdminPlistRoutedComponent },

  // (Opcional) listado de alumno público como lo tenías
  { path: 'alumno/alumno/plist', component: AlumnoAlumnoPlistComponent },

  // fallback
  { path: '**', redirectTo: '' },
];
