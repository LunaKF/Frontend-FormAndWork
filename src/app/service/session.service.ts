import { inject, Injectable } from "@angular/core";
import { IJwt } from "../model/jwt.interface";
import { Subject } from "rxjs";


@Injectable({
    providedIn: 'root'
})

export class SessionService {

    subjectLogin: Subject<void> = new Subject<void>();
    subjectLogout: Subject<void> = new Subject<void>();

    public getToken(): string | null {
        return localStorage.getItem('token');
    }

    private deleteToken(): void {
        localStorage.removeItem('token');
    }

    getSessionTipoUsuario(): string {
        //Comprueba si hay un token y si la sesión sigue activa.
        const token = this.getToken();
        if (token && this.isSessionActive()) {
            //Si es así, lo parsea y devuelve el campo tipoUsuario.
            const parsedToken: IJwt = this.parseJwt(token);
            return parsedToken.tipoUsuario;
        } else {
            //Si no, devuelve una cadena vacía (''), para que el guard AdminGuard redirija correctamente al login
            return '';
        }
    }


    isSessionActive(): boolean {
        // comprobar si el token no ha expirado
        const token = this.getToken();
        if (token) {
            let parsedToken: IJwt;
            parsedToken = this.parseJwt(token);
            const now = Date.now() / 1000;
            if (parsedToken.exp > now) {
                return true;
            } else {
                this.deleteToken();
                return false;
            }
        } else {
            return false;
        }
    }

    getSessionEmail(): string {
        const token = this.getToken();
        if (token) {
            if (this.isSessionActive()) {
                let parsedToken: IJwt;
                parsedToken = this.parseJwt(token);
                return parsedToken.email;
            } else {
                return '';
            }
        } else {
            return '';
        }
    }

    private parseJwt(token: string): IJwt {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    onLogin(): Subject<void> {
        return this.subjectLogin;
    }

    onLogout(): Subject<void> {
        return this.subjectLogout;
    }

    private setToken(strToken: string): void {
        localStorage.setItem('token', strToken);
    }

    login(strToken: string): void {
        this.setToken(strToken);
        this.subjectLogin.next();
    }

    logout(): void {
        this.deleteToken();
        this.subjectLogout.next();
    }


}