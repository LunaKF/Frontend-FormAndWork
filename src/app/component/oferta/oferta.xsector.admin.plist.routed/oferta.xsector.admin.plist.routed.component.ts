import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { debounceTime, Subject } from 'rxjs';

import { TrimPipe } from '../../../pipe/trim.pipe';
import { IOferta } from '../../../model/oferta.interface';
import { IPage } from '../../../model/model.interface';
import { ISector } from '../../../model/sector.interface';

import { OfertaService } from '../../../service/oferta.service';
import { BotoneraService } from '../../../service/botonera.service';
import { SectorService } from '../../../service/sector.service';
import { SessionService } from '../../../service/session.service';

@Component({
  selector: 'app-oferta.xsector.admin.plist.routed',
  templateUrl: './oferta.xsector.admin.plist.routed.component.html',
  styleUrls: ['./oferta.xsector.admin.plist.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TrimPipe, RouterModule],
})
export class OfertaXsectorAdminPlistRoutedComponent implements OnInit {
  // sesión / rol
  activeSession = false;
  userEmail = '';
  isAdmin = false;
  isEmpresa = false;
  isAlumno = false;

  // data
  oPage: IPage<IOferta> | null = null;
  oSector: ISector | null = null;
  sectorId = 0;

  // paginación
  nPage = 0; // 0-based
  nRpp = 10; // 10 / 20 / 30
  arrBotonera: string[] = [];

  // filtro cliente (como tu plist)
  strFiltro = '';
  private debounceSubject = new Subject<string>();

  loading = true;

  constructor(
    private oOfertaService: OfertaService,
    private oBotoneraService: BotoneraService,
    private oActivatedRoute: ActivatedRoute,
    private oSectorService: SectorService,
    private oRouter: Router,
    private oSessionService: SessionService
  ) {
    // debounce filtro
    this.debounceSubject.pipe(debounceTime(200)).subscribe(() => {
      this.nPage = 0;
      this.getPage();
    });

    // estado inicial sesión
    this.activeSession = this.oSessionService.isSessionActive();
    if (this.activeSession) {
      this.userEmail = this.oSessionService.getSessionEmail();
      this.setRoleFromSession();
    }
  }

  ngOnInit(): void {
    // sector desde la ruta
    this.oActivatedRoute.params.subscribe((params) => {
      this.sectorId = +(params['id'] || 0);

      if (!this.sectorId) {
        this.oSector = null;
        this.getPage();
        return;
      }

      this.oSectorService.get(this.sectorId).subscribe({
        next: (s: ISector) => {
          this.oSector = s;
          this.getPage();
        },
        error: () => {
          this.oSector = null;
          this.getPage();
        },
      });
    });

    // login/logout en caliente
    this.oSessionService.onLogin().subscribe({
      next: () => {
        this.activeSession = true;
        this.userEmail = this.oSessionService.getSessionEmail();
        this.setRoleFromSession();
        this.getPage();
      },
    });

    this.oSessionService.onLogout().subscribe({
      next: () => {
        this.activeSession = false;
        this.userEmail = '';
        this.isAdmin = this.isEmpresa = this.isAlumno = false;
        this.getPage();
      },
    });
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

  // ========= PERMISOS =========
  get canOpenView(): boolean {
    return this.activeSession && (this.isAdmin || this.isEmpresa || this.isAlumno);
  }

  get canManageOferta(): boolean {
    // aquí lo dejamos como tu política típica:
    // admin y empresa pueden gestionar
    return this.activeSession && (this.isAdmin || this.isEmpresa);
  }

  get canSeeCandidaturas(): boolean {
    return this.activeSession && (this.isAdmin || this.isEmpresa);
  }

  // ========= HELPERS =========
  private scrollToTop(): void {
    setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }), 0);
  }

  hasMultiplePages(): boolean {
    return (this.oPage?.totalPages || 0) > 1;
  }

  get currentPage(): number {
    return this.nPage + 1;
  }

  hasPrev(): boolean {
    return this.currentPage > 1;
  }

  hasNext(): boolean {
    return !!this.oPage && this.currentPage < (this.oPage.totalPages || 0);
  }

  // ========= DATA =========
  getPage(): void {
    this.loading = true;

    // 👇 Importante: NO mandamos strFiltro al backend (filtramos en cliente)
    this.oOfertaService
      .getPageXsector(this.nPage, this.nRpp, '', '', '', this.sectorId)
      .subscribe({
        next: (oPageFromServer: IPage<IOferta>) => {
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

  // ========= FILTRO CLIENTE =========
  get filteredOfertas(): IOferta[] {
    const q = (this.strFiltro || '').toLowerCase().trim();
    const content = this.oPage?.content || [];
    if (!q) return content;

    return content.filter(o => {
      const titulo = (o.titulo || '').toLowerCase();
      const desc = (o.descripcion || '').toLowerCase();
      const sector = (o.sector?.nombre || '').toLowerCase();
      const empresa = ((o as any).empresa?.nombre || '').toLowerCase(); // por si el typing no lo trae

      return (
        String(o.id).includes(q) ||
        titulo.includes(q) ||
        desc.includes(q) ||
        sector.includes(q) ||
        empresa.includes(q)
      );
    });
  }

  filter(): void {
    this.debounceSubject.next(this.strFiltro);
  }

  // ========= ACCIONES =========
  onCardClick(o: IOferta): void {
    if (this.canOpenView) this.view(o);
  }

  create(): void {
    if (!this.canManageOferta) return;
    this.oRouter.navigate(['admin', 'oferta', 'create']).then(() => this.scrollToTop());
  }

  view(o: IOferta): void {
    if (!this.canOpenView) return;
    this.oRouter.navigate(['admin', 'oferta', 'view', o.id]).then(() => this.scrollToTop());
  }

  edit(o: IOferta): void {
    if (!this.canManageOferta) return;
    this.oRouter.navigate(['admin', 'oferta', 'edit', o.id]).then(() => this.scrollToTop());
  }

  remove(o: IOferta): void {
    if (!this.canManageOferta) return;
    this.oRouter.navigate(['admin', 'oferta', 'delete', o.id]).then(() => this.scrollToTop());
  }

  candidaturas(o: IOferta, ev?: MouseEvent): void {
    ev?.stopPropagation();
    if (!this.canSeeCandidaturas) return;

    this.oRouter
      .navigate(['admin', 'candidatura', 'xoferta', 'plist', o.id])
      .then(() => this.scrollToTop());
  }

  // ========= UI HELPERS =========
  excerpt(text: string | undefined | null, max = 160): string {
    const t = (text || '').trim().replace(/\s+/g, ' ');
    if (!t) return '—';
    if (t.length <= max) return t;
    return t.slice(0, max).trim() + '…';
  }

  // por si candidaturas viene raro en typing
  getCandidaturasCount(o: IOferta | null | undefined): number {
    const anyO = o as any;
    return Number(anyO?.candidaturas ?? 0);
  }

  trackById(_: number, item: IOferta): number {
    return item.id;
  }

  // paginación
  goToPage(p: number): false {
    if (p) {
      this.nPage = p - 1;
      this.getPage();
      this.scrollToTop();
    }
    return false;
  }

  goToNext(): false {
    if (this.hasNext()) {
      this.nPage++;
      this.getPage();
      this.scrollToTop();
    }
    return false;
  }

  goToPrev(): false {
    if (this.hasPrev()) {
      this.nPage--;
      this.getPage();
      this.scrollToTop();
    }
    return false;
  }

  goToRpp(nrpp: number): false {
    this.nPage = 0;
    this.nRpp = nrpp;
    this.getPage();
    this.scrollToTop();
    return false;
  }
}
