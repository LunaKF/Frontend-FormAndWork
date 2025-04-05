import { Routes } from '@angular/router';
import { SharedMenuUnroutedComponent } from "./component/shared/shared.menu.unrouted/shared.menu.unrouted.component";
import { SharedHomeRoutedComponent } from "./component/shared/shared.home.routed/shared.home.routed.component";

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
import { AlumnoAdminViewRoutedComponent } from './component/alumno/alumno.admin.view.routed/alumno.admin.view.routed.component';
import { OfertaAdminPlistRoutedComponent } from './component/oferta/oferta.admin.plist.routed/oferta.admin.plist.routed.component';
import { AlumnoXsectorAdminPlistComponent } from './component/alumno/alumno.xsector.admin.plist.routed/alumno.xsector.admin.plist.routed.component';


import { CandidaturaAdminPlistRoutedComponent } from './component/candidatura/candidatura.admin.plist.routed/candidatura.admin.plist.routed.component';
import { CandidaturaAdminViewRoutedComponent } from './component/candidatura/candidatura.admin.view.routed/candidatura.admin.view.routed.component';
import { OfertaAdminViewRoutedComponent } from './component/oferta/oferta.admin.view.routed/oferta.admin.view.routed.component';
export const routes: Routes = [
    { path: '', component: SharedHomeRoutedComponent },
    { path: 'home', component: SharedHomeRoutedComponent },
    { path: 'menu', component: SharedMenuUnroutedComponent },

    {path: 'admin/sector/plist', component: SectorAdminPlistRoutedComponent, pathMatch: 'full', },

    {path: 'admin/empresa/plist', component: EmpresaAdminPlistRoutedComponent, pathMatch: 'full', },
    {path: 'admin/empresa/create', component: EmpresaAdminCreateRoutedComponent, pathMatch: 'full', },
    {path: 'admin/empresa/edit/:id', component: EmpresaAdminEditRoutedComponent, pathMatch: 'full', },
    {path: 'admin/empresa/view/:id', component: EmpresaAdminViewRoutedComponent, pathMatch: 'full', },
    {path: 'admin/empresa/delete/:id', component: EmpresaAdminDeleteRoutedComponent, pathMatch: 'full', },
   
    
    {path: 'admin/alumno/plist', component: AlumnoAdminPlistComponent, pathMatch: 'full', },
    {path: 'admin/alumno/xsector/plist/:id', component: AlumnoXsectorAdminPlistComponent, pathMatch: 'full', },
    {path: 'admin/alumno/create', component: AlumnoAdminCreateComponent, pathMatch: 'full', },
    {path: 'admin/alumno/edit/:id', component: AlumnoAdminEditRoutedComponent, pathMatch: 'full', },
    {path: 'admin/alumno/view/:id', component: AlumnoAdminViewRoutedComponent, pathMatch: 'full', },
    {path: 'admin/alumno/delete/:id', component: AlumnoAdminDeleteRoutedComponent, pathMatch: 'full', },


    {path: 'admin/oferta/plist', component: OfertaAdminPlistRoutedComponent, pathMatch: 'full', },
    //{path: 'admin/oferta/create', component: OfertaAdminCreateRoutedComponent, pathMatch: 'full', },
   // {path: 'admin/oferta/edit/:id', component: OfertaAdminEditRoutedComponent, pathMatch: 'full', },
    {path: 'admin/oferta/view/:id', component: OfertaAdminViewRoutedComponent, pathMatch: 'full', },


    {path: 'admin/candidatura/plist', component: CandidaturaAdminPlistRoutedComponent, pathMatch: 'full', },
   // {path: 'admin/candidatura/create', component: CandidaturaAdminCreateRoutedComponent, pathMatch: 'full', },
   // {path: 'admin/candidatura/edit/:id', component: CandidaturaAdminEditRoutedComponent, pathMatch: 'full', },
    {path: 'admin/candidatura/view/:id', component: CandidaturaAdminViewRoutedComponent, pathMatch: 'full', },
  //  {path: 'admin/candidatura/delete/:id', component: CandidaturaAdminDeleteRoutedComponent, pathMatch: 'full', },
    
];
