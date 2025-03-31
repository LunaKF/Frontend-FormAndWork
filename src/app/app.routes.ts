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

export const routes: Routes = [
    { path: '', component: SharedHomeRoutedComponent },
    { path: 'home', component: SharedHomeRoutedComponent },
    { path: 'menu', component: SharedMenuUnroutedComponent },

    {path: 'admin/sector/plist', component: SectorAdminPlistRoutedComponent, pathMatch: 'full', },

    {path: 'admin/empresa/plist', component: EmpresaAdminPlistRoutedComponent, pathMatch: 'full', },
    { path: 'admin/empresa/create', component: EmpresaAdminCreateRoutedComponent, pathMatch: 'full', },
    {path: 'admin/empresa/edit/:id', component: EmpresaAdminEditRoutedComponent, pathMatch: 'full', },
    {path: 'admin/empresa/view/:id', component: EmpresaAdminViewRoutedComponent, pathMatch: 'full', },
    {path: 'admin/empresa/delete/:id', component: EmpresaAdminDeleteRoutedComponent, pathMatch: 'full', },
   
    
    {path: 'admin/alumno/plist', component: AlumnoAdminPlistComponent, pathMatch: 'full', },
    {path: 'admin/alumno/create', component: AlumnoAdminCreateComponent, pathMatch: 'full', },
    {path: 'admin/alumno/edit/:id', component: AlumnoAdminCreateComponent, pathMatch: 'full', },
    {path: 'admin/alumno/view/:id', component: AlumnoAdminCreateComponent, pathMatch: 'full', },
    {path: 'admin/alumno/delete/:id', component: AlumnoAdminDeleteRoutedComponent, pathMatch: 'full', },

];
