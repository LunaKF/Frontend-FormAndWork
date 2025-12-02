import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { SessionService } from '../service/session.service';

@Injectable({ providedIn: 'root' })
export class AdminEmpresaGuard implements CanActivate {

  constructor(
    private session: SessionService,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    if (!this.session.isSessionActive()) {
      return this.router.createUrlTree(
        ['/login'],
        { queryParams: { redirectTo: location.pathname } }
      );
    }

    const tipo = (this.session.getSessionTipoUsuario() || '').toLowerCase();

    if (tipo === 'admin' || tipo === 'administrador' || tipo === 'empresa') {
      return true;
    }

    return this.router.createUrlTree(['/403']);
  }
}
