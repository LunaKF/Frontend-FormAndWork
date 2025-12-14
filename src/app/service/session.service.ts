import { Injectable } from "@angular/core";
import { IJwt } from "../model/jwt.interface";
import { Subject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class SessionService {

  subjectLogin: Subject<void> = new Subject<void>();
  subjectLogout: Subject<void> = new Subject<void>();

  public getToken(): string | null {
    return localStorage.getItem('token');
  }

  private deleteToken(): void {
    localStorage.removeItem('token');
  }

  isSessionActive(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const parsed: any = this.parseJwt(token);
    const now = Date.now() / 1000;

    if (parsed?.exp && parsed.exp > now) return true;

    this.deleteToken();
    return false;
  }

  getSessionEmail(): string {
    const token = this.getToken();
    if (!token || !this.isSessionActive()) return '';

    const parsed: any = this.parseJwt(token);
    return String(parsed.email ?? parsed.mail ?? parsed.userEmail ?? '');
  }

  // ✅ ROBUSTO: detecta rol aunque cambie el nombre del campo
  getSessionTipoUsuario(): string {
    const token = this.getToken();
    if (!token || !this.isSessionActive()) return '';

    const parsed: any = this.parseJwt(token);

    const raw =
      parsed.tipoUsuario ??
      parsed.role ??
      parsed.rol ??
      parsed.userRole ??
      parsed.tipo ??
      '';

    return String(raw);
  }

  // ✅ ROBUSTO: detecta id aunque venga como sub/subject/userId/etc.
  getSessionId(): number {
    const token = this.getToken();
    if (!token || !this.isSessionActive()) return 0;

    const parsed: any = this.parseJwt(token);

    const possible =
      parsed.id ??
      parsed.userId ??
      parsed.alumnoId ??
      parsed.empresaId ??
      parsed.sub ??          // estándar JWT
      parsed.subject ??      // si lo llamaste así
      parsed.subjectId ??
      0;

    const n = Number(possible);
    return Number.isFinite(n) ? n : 0;
  }

  private parseJwt(token: string): IJwt {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64).split('').map((c) =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')
    );
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
