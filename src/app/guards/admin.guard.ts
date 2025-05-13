import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { SessionService } from "../service/session.service";

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private oSessionService: SessionService,
    private oRouter: Router
  ) { }

canActivate(): boolean {
    if (this.oSessionService.isSessionActive()) {
      const tipoUsuario = this.oSessionService.getSessionTipoUsuario();
      if (tipoUsuario === 'admin' || tipoUsuario === 'Administrador' || tipoUsuario === 'Admin') {
        return true;
      } else {
        this.oRouter.navigate(['/login']);
        return false;
      }
    } else {
      this.oRouter.navigate(['/login']);
      return false;
    }
  }
}
