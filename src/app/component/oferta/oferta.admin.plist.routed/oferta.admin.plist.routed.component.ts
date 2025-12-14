import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { TrimPipe } from '../../../pipe/trim.pipe';
import { IOferta } from '../../../model/oferta.interface';
import { IPage } from '../../../model/model.interface';
import { OfertaService } from '../../../service/oferta.service';
import { BotoneraService } from '../../../service/botonera.service';
import { SessionService } from '../../../service/session.service';

@Component({
  selector: 'app-oferta.admin.plist.routed',
  templateUrl: './oferta.admin.plist.routed.component.html',
  styleUrls: ['./oferta.admin.plist.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TrimPipe, RouterModule],
})
export class OfertaAdminPlistRoutedComponent implements OnInit {
  oPage: IPage<IOferta> | null = null;

  /** Paginación y orden */
  nPage = 0; // 0-based
  nRpp = 10;
  strField = '';
  strDir: 'asc' | 'desc' | '' = '';

  /** Filtro (CLIENTE como Empresas ✅) */
  strFiltro = '';

  /** Botonera */
  arrBotonera: string[] = [];

  /** Sesión */
  activeSession = false;
  userEmail = '';

  /** flags de rol */
  isAdmin = false;
  isEmpresa = false;
  isAlumno = false;

  /** UI */
  loading = true;

  constructor(
    private oOfertaService: OfertaService,
    private oBotoneraService: BotoneraService,
    private oRouter: Router,
    private oSessionService: SessionService
  ) {
    this.activeSession = this.oSessionService.isSessionActive();
    if (this.activeSession) {
      this.userEmail = this.oSessionService.getSessionEmail();
      this.setRoleFromSession();
    }
  }

  ngOnInit(): void {
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

    this.getPage();
  }

  // ========= ROLES =========
  private setRoleFromSession(): void {
    const tipo = (this.oSessionService.getSessionTipoUsuario() || '')
      .toLowerCase()
      .trim();

    this.isAdmin = tipo === 'admin' || tipo === 'administrador';
    this.isEmpresa = tipo === 'empresa';
    this.isAlumno = tipo === 'alumno';
  }

  // ========= PERMISOS =========
  get canOpenView(): boolean {
    return this.activeSession && (this.isAdmin || this.isEmpresa || this.isAlumno);
  }

  get canManageOferta(): boolean {
    return this.activeSession && (this.isAdmin || this.isEmpresa);
  }

  get canSeeCandidaturas(): boolean {
    return this.activeSession && (this.isAdmin || this.isEmpresa);
  }

  // ========= HELPERS =========
  get currentPage(): number {
    return this.nPage + 1;
  }

  hasPrev(): boolean {
    return this.currentPage > 1;
  }

  hasNext(): boolean {
    return !!this.oPage && this.currentPage < (this.oPage.totalPages || 0);
  }

  hasMultiplePages(): boolean {
    return (this.oPage?.totalPages || 0) > 1;
  }

  private scrollToTop(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, 0);
  }

  // ========= DATA =========
  getPage(): void {
    this.loading = true;

    // ✅ IMPORTANTE: no mandamos strFiltro al backend (porque no funciona allí)
    //    Filtramos en cliente igual que Empresas.
    this.oOfertaService
      .getPage(this.nPage, this.nRpp, this.strField, this.strDir, '')
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

  // ========= FILTRO CLIENTE (igual idea que Empresas ✅) =========
  get filteredOfertas(): IOferta[] {
    const q = (this.strFiltro || '').toLowerCase().trim();
    const content = this.oPage?.content || [];

    if (!q) return content;

    return content.filter(o => {
      const titulo = (o.titulo || '').toLowerCase();
      const desc = (o.descripcion || '').toLowerCase();
      const sector = (o.sector?.nombre || '').toLowerCase();
      const empresa = (o.empresa?.nombre || '').toLowerCase();

      return (
        titulo.includes(q) ||
        desc.includes(q) ||
        sector.includes(q) ||
        empresa.includes(q)
      );
    });
  }

  // ========= BOTONERA =========
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

  // ========= ORDEN =========
  sort(field: string): void {
    this.strField = field;
    this.strDir = this.strDir === 'asc' ? 'desc' : 'asc';
    this.getPage();
  }

  // ========= RPP =========
  goToRpp(nrpp: number): false {
    this.nPage = 0;
    this.nRpp = nrpp;
    this.getPage();
    this.scrollToTop();
    return false;
  }

  // ========= CLICK CARD =========
  onCardClick(o: IOferta): void {
    if (this.canOpenView) this.view(o);
  }

  // ========= ACCIONES (RUTAS CORRECTAS ✅) =========
  create(): void {
    if (this.canManageOferta) {
      this.oRouter.navigate(['admin', 'oferta', 'create']).then(() => this.scrollToTop());
    }
  }

  view(o: IOferta): void {
    if (this.canOpenView) {
      this.oRouter.navigate(['admin', 'oferta', 'view', o.id]).then(() => this.scrollToTop());
    }
  }

  edit(o: IOferta): void {
    if (this.canManageOferta) {
      this.oRouter.navigate(['admin', 'oferta', 'edit', o.id]).then(() => this.scrollToTop());
    }
  }

  remove(o: IOferta): void {
    if (this.canManageOferta) {
      this.oRouter.navigate(['admin', 'oferta', 'delete', o.id]).then(() => this.scrollToTop());
    }
  }

  candidaturas(o: IOferta, ev?: MouseEvent): void {
    ev?.stopPropagation();
    if (this.canSeeCandidaturas) {
      this.oRouter
        .navigate(['admin', 'candidatura', 'xoferta', 'plist', o.id])
        .then(() => this.scrollToTop());
    }
  }

  // ========= UI HELPERS =========
  excerpt(text: string | undefined | null, max = 160): string {
    const t = (text || '').trim().replace(/\s+/g, ' ');
    if (!t) return '—';
    if (t.length <= max) return t;
    return t.slice(0, max).trim() + '…';
  }

  trackById(_: number, item: IOferta): number {
    return item.id;
  }
}
