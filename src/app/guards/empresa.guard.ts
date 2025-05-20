import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { SessionService } from "../service/session.service";
import { EmpresaService } from "../service/empresa.service";
import { IEmpresa } from "../model/empresa.interface";
import { map, Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class EmpresaGuard implements CanActivate {

    constructor(private oSessionService: SessionService,
        private oEmpresaService: EmpresaService,
        private oRouter: Router) { }

    canActivate(): Observable<boolean> {
        if (this.oSessionService.isSessionActive()) {
            //email del token
            let email: string = this.oSessionService.getSessionEmail();
            // llamar al servidor para obtener el tipo de usuario a partir del email
            return this.oEmpresaService.getEmpresaByEmail(email).pipe(
                map((oEmpresa: IEmpresa) => {
                    if (oEmpresa) {
                        return true;
                    } else {
                        this.oRouter.navigate(['/login']);
                        return false;
                    }
                })
            );

            

            
        } else {
            this.oRouter.navigate(['/login']);
            return new Observable<boolean>(observer => {
                observer.next(false);
                observer.complete();
            });
        }
    }

}





