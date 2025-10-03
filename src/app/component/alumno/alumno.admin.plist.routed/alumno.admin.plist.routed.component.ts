import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { TrimPipe } from '../../../pipe/trim.pipe';
import { IPage } from '../../../model/model.interface';
import { IAlumno } from '../../../model/alumno.interface';
import { AlumnoService } from '../../../service/alumno.service';
import { BotoneraService } from '../../../service/botonera.service';

@Component({
  selector: 'app-alumno.admin.plist',
  templateUrl: './alumno.admin.plist.routed.component.html',
  styleUrls: ['./alumno.admin.plist.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TrimPipe, RouterModule],
})
export class AlumnoAdminPlistComponent implements OnInit, OnDestroy {

  oPage: IPage<IAlumno> | null = null;
  nPage: number = 0;
  nRpp: number = 12;   // múltiplo de 3 para cuadrar filas
  strField: string = '';
  strDir: string = '';
  strFiltro: string = '';
  arrBotonera: string[] = [];

  isAdmin: boolean = false;
  isEmpresa: boolean = false;

  private debounceSubject = new Subject<string>();
  private userSetRpp = false;

  constructor(
    private oAlumnoService: AlumnoService,
    private oBotoneraService: BotoneraService,
    private oRouter: Router
  ) {
    this.debounceSubject.pipe(debounceTime(200)).subscribe(() => {
      this.nPage = 0;
      this.getPage();
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    this.syncRppToColumns();
    this.getPage();
    window.addEventListener('resize', this.syncRppToColumns);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.syncRppToColumns);
  }

  private getCols = () => {
    const w = window.innerWidth;
    if (w >= 1200) return 3;
    if (w >= 768) return 2;
    return 1;
  };

  private syncRppToColumns = () => {
    if (this.userSetRpp) return;
    const cols = this.getCols();
    const ideal = cols * 4;
    if (this.nRpp !== ideal) {
      this.nRpp = ideal;
      if (this.oPage) this.getPage();
    }
  };

  private loadRoles(): void {
    const roleFromStorage =
      localStorage.getItem('role') ||
      sessionStorage.getItem('role') ||
      '';

    let roleFromToken = '';
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token && token.split('.').length === 3) {
        const payload = this.safeJwtDecode(token);
        if (payload) {
          if (payload.role) {
            roleFromToken = String(payload.role);
          } else if (Array.isArray(payload.authorities) && payload.authorities.length) {
            roleFromToken = String(payload.authorities[0]);
          }
        }
      }
    } catch {}

    const role = (roleFromStorage || roleFromToken || '').toUpperCase();
    this.isAdmin = role.includes('ADMIN');
    this.isEmpresa = !this.isAdmin && role.includes('EMPRESA');
  }

  private safeJwtDecode(token: string): any | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(this.padBase64(base64))
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  private padBase64(b64: string): string {
    const m = b64.length % 4;
    return m ? b64 + '='.repeat(4 - m) : b64;
  }

  getPage(): void {
    this.oAlumnoService
      .getPage(this.nPage, this.nRpp, this.strField, this.strDir, this.strFiltro)
      .subscribe({
        next: (oPageFromServer: IPage<IAlumno>) => {
          this.oPage = oPageFromServer;
          this.arrBotonera = this.oBotoneraService.getBotonera(
            this.nPage,
            oPageFromServer.totalPages
          );
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  edit(oAlumno: IAlumno): void {
    this.oRouter.navigate(['admin/alumno/edit', oAlumno.id]);
  }

  view(oAlumno: IAlumno): void {
    this.oRouter.navigate(['admin/alumno/view', oAlumno.id]);
  }

  remove(oAlumno: IAlumno): void {
    this.oRouter.navigate(['admin/alumno/delete', oAlumno.id]);
  }

  goToPage(p: number): boolean {
    if (p) {
      this.nPage = p - 1;
      this.getPage();
    }
    return false;
  }

  goToNext(): boolean {
    this.nPage++;
    this.getPage();
    return false;
  }

  goToPrev(): boolean {
    this.nPage--;
    this.getPage();
    return false;
  }

  sort(field: string): void {
    this.strField = field;
    this.strDir = this.strDir === 'asc' ? 'desc' : 'asc';
    this.getPage();
  }

  goToRpp(nrpp: number): boolean {
    this.userSetRpp = true;
    this.nPage = 0;
    this.nRpp = nrpp;
    this.getPage();
    return false;
  }

  filter(_: KeyboardEvent): void {
    this.debounceSubject.next(this.strFiltro);
  }
}
