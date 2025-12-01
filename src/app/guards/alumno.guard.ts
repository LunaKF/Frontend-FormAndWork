// src/app/guards/alumno.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { SessionService } from '../service/session.service';

@Injectable({ providedIn: 'root' })
export class AlumnoGuard implements CanActivate {

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

    if (tipo === 'alumno') {
      return true;
    }

    // Tiene sesión pero no es alumno → 403
    return this.router.createUrlTree(['/403']);
  }
}
