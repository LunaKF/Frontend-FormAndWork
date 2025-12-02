import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { SessionService } from '../service/session.service';

@Injectable({ providedIn: 'root' })
export class AdminAlumnoGuard implements CanActivate {

  constructor(
    private session: SessionService,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    // Sin sesión → al login
    if (!this.session.isSessionActive()) {
      return this.router.createUrlTree(
        ['/login'],
        { queryParams: { redirectTo: location.pathname } }
      );
    }

    const tipo = (this.session.getSessionTipoUsuario() || '').toLowerCase();

    // Solo admin o alumno
    if (tipo === 'admin' || tipo === 'administrador' || tipo === 'alumno') {
      return true;
    }

    // Empresa u otro → 403
    return this.router.createUrlTree(['/403']);
  }
}
