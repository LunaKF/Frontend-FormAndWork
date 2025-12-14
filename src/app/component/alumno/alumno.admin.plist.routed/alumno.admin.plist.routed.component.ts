import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, Subject, Subscription } from 'rxjs';

import { TrimPipe } from '../../../pipe/trim.pipe';
import { IPage } from '../../../model/model.interface';
import { IAlumno } from '../../../model/alumno.interface';
import { AlumnoService } from '../../../service/alumno.service';
import { BotoneraService } from '../../../service/botonera.service';
import { SessionService } from '../../../service/session.service';

@Component({
  selector: 'app-alumno.admin.plist',
  templateUrl: './alumno.admin.plist.routed.component.html',
  styleUrls: ['./alumno.admin.plist.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TrimPipe, RouterModule],
})
export class AlumnoAdminPlistComponent implements OnInit, OnDestroy {
  oPage: IPage<IAlumno> | null = null;

  // paginación
  nPage = 0;   // 0-based
  nRpp = 12;   // 12 / 24 / 36
  arrBotonera: string[] = [];

  // orden + filtro (si tu backend lo usa)
  strField = '';
  strDir = '';
  strFiltro = '';

  // sesión / rol
  activeSession = false;
  userEmail = '';
  isAdmin = false;
  isEmpresa = false;
  isAlumno = false;

  loading = true;

  // si el usuario toca RPP, no auto-ajustamos
  private userSetRpp = false;

  // debounce filtro
  private debounceSubject = new Subject<string>();
  private subs: Subscription[] = [];

  constructor(
    private oAlumnoService: AlumnoService,
    private oBotoneraService: BotoneraService,
    private oRouter: Router,
    private oSessionService: SessionService
  ) {
    this.subs.push(
      this.debounceSubject.pipe(debounceTime(200)).subscribe(() => {
        this.nPage = 0;
        this.getPage();
      })
    );

    // estado inicial sesión
    this.activeSession = this.oSessionService.isSessionActive();
    if (this.activeSession) {
      this.userEmail = this.oSessionService.getSessionEmail();
      this.setRoleFromSession();
    }
  }

  ngOnInit(): void {
    // sesión “en caliente” (igual que empresas)
    this.subs.push(
      this.oSessionService.onLogin().subscribe({
        next: () => {
          this.activeSession = true;
          this.userEmail = this.oSessionService.getSessionEmail();
          this.setRoleFromSession();
        },
      })
    );

    this.subs.push(
      this.oSessionService.onLogout().subscribe({
        next: () => {
          this.activeSession = false;
          this.userEmail = '';
          this.isAdmin = this.isEmpresa = this.isAlumno = false;
        },
      })
    );

    // mantener RPP válido (sin cosas raras)
    this.syncRppToColumns();
    window.addEventListener('resize', this.syncRppToColumns);

    this.getPage();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.syncRppToColumns);
    this.subs.forEach(s => s.unsubscribe());
  }

  // ========= ROLES =========
  private setRoleFromSession(): void {
    const tipo = (this.oSessionService.getSessionTipoUsuario() || '')
      .toLowerCase()
      .trim();

    this.isAdmin = (tipo === 'admin' || tipo === 'administrador');
    this.isEmpresa = (tipo === 'empresa');
    this.isAlumno = (tipo === 'alumno');
  }

  // Solo admin debe ver acciones de admin
  get canAdmin(): boolean {
    return this.isAdmin;
  }

  // Card clicable a VIEW (en esta pantalla solo entran admins, pero lo dejamos bien)
  get canOpenView(): boolean {
    return this.isAdmin;
  }

  // ========= RPP / columnas =========
  private syncRppToColumns = () => {
    if (this.userSetRpp) return;
    if (![12, 24, 36].includes(this.nRpp)) this.nRpp = 12;
  };

  // ========= DATA =========
  getPage(): void {
    this.loading = true;

    this.oAlumnoService
      .getPage(this.nPage, this.nRpp, this.strField, this.strDir, this.strFiltro)
      .subscribe({
        next: (oPageFromServer: IPage<IAlumno>) => {
          this.oPage = oPageFromServer;
          this.arrBotonera = this.oBotoneraService.getBotonera(
            this.nPage,
            oPageFromServer.totalPages
          );
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        },
      });
  }

  // ========= SCROLL TOP (fix “me manda abajo”) =========
  private scrollToTop(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, 0);
  }

  // ========= ACCIONES =========
  create(): void {
    if (!this.canAdmin) return;
    this.oRouter.navigate(['admin', 'alumno', 'create']).then(() => this.scrollToTop());
  }

  edit(a: IAlumno): void {
    if (!this.canAdmin) return;
    this.oRouter.navigate(['admin', 'alumno', 'edit', a.id]).then(() => this.scrollToTop());
  }

  view(a: IAlumno): void {
    if (!this.canOpenView) return;
    this.oRouter.navigate(['admin', 'alumno', 'view', a.id]).then(() => this.scrollToTop());
  }

  remove(a: IAlumno): void {
    if (!this.canAdmin) return;
    this.oRouter.navigate(['admin', 'alumno', 'delete', a.id]).then(() => this.scrollToTop());
  }

  onCardClick(a: IAlumno): void {
    if (this.canOpenView) this.view(a);
  }

  onCandidaturasClick(a: IAlumno, ev: MouseEvent): void {
    ev.stopPropagation();
    if (!this.canAdmin) return;
    this.oRouter.navigate(['admin', 'candidatura', 'xalumno', 'plist', a.id]).then(() => {
      this.scrollToTop();
    });
  }

  // ========= FILTRO =========
  filter(): void {
    this.debounceSubject.next(this.strFiltro);
  }

  // ========= PAGINACIÓN =========
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

  goToRpp(nrpp: number): boolean {
    this.userSetRpp = true;
    this.nPage = 0;
    this.nRpp = nrpp;
    this.getPage();
    return false;
  }

  sort(field: string): void {
    this.strField = field;
    this.strDir = this.strDir === 'asc' ? 'desc' : 'asc';
    this.getPage();
  }

  hasMultiplePages(): boolean {
    return (this.oPage?.totalPages || 0) > 1;
  }

  trackById(index: number, item: IAlumno): number {
    return item.id;
  }

  // helper UI
  get fullName(): (a: IAlumno) => string {
    return (a: IAlumno) => {
      const parts = [a?.nombre, a?.ape1, a?.ape2].filter(Boolean);
      return parts.join(' ');
    };
  }
}
