/* import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { SessionService } from "../service/session.service";
import { AlumnoService } from "../service/alumno.service";
import { IAlumno } from "../model/alumno.interface";
import { map, Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class AuditorGuard implements CanActivate {

    constructor(private oSessionService: SessionService,
        private oAlumnoService: AlumnoService,
        private oRouter: Router) { }

   canActivate(): Observable<boolean> {
        if (this.oSessionService.isSessionActive()) {
            let email: string = this.oSessionService.getSessionEmail();
            // llamar al servidor para obtener el rol del alumno
            return this.oAlumnoService.getAlumnoByEmail(email).pipe(
               
            
            
            
            map((data: IAlumno) => {
                    if (data.tipoalumno.descripcion === 'Auditor') {
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

}*/