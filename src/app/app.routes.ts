import { Routes } from '@angular/router';
import { SharedHomeRoutedComponent } from './component/shared/shared.home.routed/shared.home.routed.component';
import { EmpresaAdminCreateRoutedComponent } from './component/empresa/empresa.admin.create.routed/empresa.admin.create.routed.component';

export const routes: Routes = [
    { path: '', component: SharedHomeRoutedComponent },
    { path: 'home', component: SharedHomeRoutedComponent },

    { path: 'admin/empresa/create', component: EmpresaAdminCreateRoutedComponent, pathMatch: 'full', },

];
