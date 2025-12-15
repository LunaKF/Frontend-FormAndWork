import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { debounceTime, Subject, Subscription } from 'rxjs';

import { IEmpresa } from '../../../model/empresa.interface';
import { IPage } from '../../../model/model.interface';
import { ISector } from '../../../model/sector.interface';

import { EmpresaService } from '../../../service/empresa.service';
import { SectorService } from '../../../service/sector.service';
import { BotoneraService } from '../../../service/botonera.service';
import { SessionService } from '../../../service/session.service';

import { TrimPipe } from '../../../pipe/trim.pipe';

@Component({
  selector: 'app-empresa-xsector-admin-plist',
  templateUrl: './empresa.xsector.admin.plist.routed.component.html',
  styleUrls: ['./empresa.xsector.admin.plist.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TrimPipe],
})
export class EmpresaXsectorAdminPlistComponent implements OnInit, OnDestroy {
  // data
  oPage: IPage<IEmpresa> | null = null;
  oSector: ISector | null = null;

  // route param
  sectorId = 0;

  // paginación
  nPage = 0;   // 0-based
  nRpp = 12;   // 12 / 24 / 36

  // filtro (como guía)
  query = '';

  // orden
  strField = '';
  strDir = '';

  // botonera
  arrBotonera: string[] = [];

  // sesión / rol
  activeSession = false;
  userEmail = '';
  isAdmin = false;
  isEmpresa = false;
  isAlumno = false;

  loading = true;

  // si usuario toca RPP manualmente
  private userSetRpp = false;

  // debounce filtro
  private debounceSubject = new Subject<string>();
  private subs: Subscription[] = [];

  constructor(
    private oEmpresaService: EmpresaService,
    private oSectorService: SectorService,
    private oBotoneraService: BotoneraService,
    private oActivatedRoute: ActivatedRoute,
    private oRouter: Router,
    private oSessionService: SessionService
  ) {
    // estado inicial sesión
    this.activeSession = this.oSessionService.isSessionActive();
    if (this.activeSession) {
      this.userEmail = this.oSessionService.getSessionEmail();
      this.setRoleFromSession();
    }

    // debounce query (igual idea que los plists pro)
    this.subs.push(
      this.debounceSubject.pipe(debounceTime(200)).subscribe(() => {
        this.nPage = 0;
        this.getPage();
      })
    );
  }

  ngOnInit(): void {
    this.sectorId = +this.oActivatedRoute.snapshot.params['id'] || 0;

    // sesión en caliente
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

    // rpp válido
    this.syncRppToColumns();
    window.addEventListener('resize', this.syncRppToColumns);

    // cargar sector (para el hero)
    this.loadSector();

    // cargar empresas
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

  // permisos (igual filosofía que guía)
  get canManageEmpresa(): boolean {
    return this.isAdmin;
  }

  get canOpenView(): boolean {
    // si quieres que alumnos puedan abrir view, cambia a:
    // return this.activeSession && (this.isAdmin || this.isAlumno);
    return this.isAdmin;
  }

  // ========= RPP =========
  private syncRppToColumns = () => {
    if (this.userSetRpp) return;
    if (![12, 24, 36].includes(this.nRpp)) this.nRpp = 12;
  };

  // ========= DATA =========
  private loadSector(): void {
    if (!this.sectorId) {
      this.oSector = null;
      return;
    }

    this.oSectorService.get(this.sectorId).subscribe({
      next: (s: ISector) => (this.oSector = s),
      error: () => (this.oSector = null),
    });
  }

  getPage(): void {
    if (!this.sectorId) {
      this.loading = false;
      this.oPage = { content: [], totalElements: 0, totalPages: 0, number: 0, numberOfElements: 0, size: this.nRpp, first: true, last: true, pageable: null as any, sort: null as any, empty: true };
      return;
    }

    this.loading = true;

    // backend: page x sector (filtro en cliente como en tu guía)
    this.oEmpresaService
      .getPageXsector(this.nPage, this.nRpp, this.strField, this.strDir, '', this.sectorId)
      .subscribe({
        next: (oPageFromServer: IPage<IEmpresa>) => {
          this.oPage = oPageFromServer;
          this.arrBotonera = this.oBotoneraService.getBotonera(
            this.nPage,
            oPageFromServer.totalPages
          );
          this.loading = false;
        },
        error: (err) => {
          console.log(err);
          this.loading = false;
        },
      });
  }

  // ========= FILTRO (idéntico idea a guía) =========
  get filteredEmpresas(): IEmpresa[] {
    const q = (this.query || '').toLowerCase().trim();
    const content = this.oPage?.content || [];

    if (!q) return content;

    return content.filter(e => {
      const id = String(e.id || '');
      const nombre = (e.nombre || '').toLowerCase();
      const email = (e.email || '').toLowerCase();
      return id.includes(q) || nombre.includes(q) || email.includes(q);
    });
  }

  filter(): void {
    this.debounceSubject.next(this.query);
  }

  // ========= SCROLL TOP =========
  private scrollToTop(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, 0);
  }

  // ========= ACCIONES =========
  view(e: IEmpresa): void {
    if (!this.canOpenView) return;
    this.oRouter.navigate(['admin', 'empresa', 'view', e.id]).then(() => this.scrollToTop());
  }

  edit(e: IEmpresa): void {
    if (!this.canManageEmpresa) return;
    this.oRouter.navigate(['admin', 'empresa', 'edit', e.id]).then(() => this.scrollToTop());
  }

  remove(e: IEmpresa): void {
    if (!this.canManageEmpresa) return;
    this.oRouter.navigate(['admin', 'empresa', 'delete', e.id]).then(() => this.scrollToTop());
  }

  // ========= PAGINACIÓN =========
  goToPage(p: number): boolean {
    if (p) {
      this.nPage = p - 1;
      this.getPage();
      this.scrollToTop();
    }
    return false;
  }

  goToNext(): boolean {
    this.nPage++;
    this.getPage();
    this.scrollToTop();
    return false;
  }

  goToPrev(): boolean {
    this.nPage--;
    this.getPage();
    this.scrollToTop();
    return false;
  }

  goToRpp(nrpp: number): boolean {
    this.userSetRpp = true;
    this.nPage = 0;
    this.nRpp = nrpp;
    this.getPage();
    this.scrollToTop();
    return false;
  }

  hasMultiplePages(): boolean {
    return (this.oPage?.totalPages || 0) > 1;
  }

  trackById(_: number, item: IEmpresa): number {
    return item.id;
  }
}
