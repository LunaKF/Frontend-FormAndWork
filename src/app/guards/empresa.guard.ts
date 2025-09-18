
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { SessionService } from '../service/session.service';   
import { EmpresaService } from '../service/empresa.service';     
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })

export class EmpresaGuard implements CanActivate {

  constructor(
    private session: SessionService,
    private router: Router,
    private empresaSrv: EmpresaService
  ) {}

  canActivate(): Observable<boolean | UrlTree> | boolean | UrlTree {
    if (!this.session.isSessionActive()) {
      return this.router.createUrlTree(
        ['/login'],
        { queryParams: { redirectTo: location.pathname } }
      );
    }

    const tipo = (this.session.getSessionTipoUsuario() || '').toLowerCase();
    if (tipo !== 'empresa') {
      return this.router.createUrlTree(['/403']);
    }

    const email = this.session.getSessionEmail();
    if (!email) return this.router.createUrlTree(['/403']);

    // Verificación remota de empresa
    return this.empresaSrv.getEmpresaByEmail(email).pipe(
      map(emp => emp ? true : this.router.createUrlTree(['/403'])),
      catchError(() => of(this.router.createUrlTree(['/403'])))
    );
  }
}
