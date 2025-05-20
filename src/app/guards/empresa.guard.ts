import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { SessionService } from "../service/session.service";
import { EmpresaService } from "../service/empresa.service";
import { IEmpresa } from "../model/empresa.interface";
import { map, Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class ContableGuard implements CanActivate {

    constructor(private oSessionService: SessionService,
        private oEmpresaService: EmpresaService,
        private oRouter: Router) { }

    canActivate(): Observable<boolean> {
        if (this.oSessionService.isSessionActive()) {
            //email del token
            let email: string = this.oSessionService.getSessionEmail();
            //si el email no es vacio
            if (email !== '') {
                //comparar los emails, si el email aparece en alguna empresa devolver true (usar getAll)
                return this.oEmpresaService.getAll().pipe(
                    map((empresas: IEmpresa[]) => {
                        return empresas.some((empresa: IEmpresa) => empresa.email === email);
                    })
                );
            } else {
                this.oRouter.navigate(['/login']);
                return new Observable<boolean>(observer => {
                    observer.next(false);
                    observer.complete();
                });
            }

        } else {
            this.oRouter.navigate(['/login']);
            return new Observable<boolean>(observer => {
                observer.next(false);
                observer.complete();
            });
        }
    }

}





