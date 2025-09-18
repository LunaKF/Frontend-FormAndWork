// src/app/guards/admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { SessionService } from '../service/session.service'; // <-- ajusta el path a tu proyecto

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {

  constructor(
    private session: SessionService,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    // sin sesión -> login
    if (!this.session.isSessionActive()) {
      return this.router.createUrlTree(
        ['/login'],
        { queryParams: { redirectTo: location.pathname } }
      );
    }

    const tipo = (this.session.getSessionTipoUsuario() || '').toLowerCase();
    if (tipo === 'admin' || tipo === 'administrador') {
      return true;
    }

    // con sesión pero sin rol -> 403
    return this.router.createUrlTree(['/403']);
  }
}
