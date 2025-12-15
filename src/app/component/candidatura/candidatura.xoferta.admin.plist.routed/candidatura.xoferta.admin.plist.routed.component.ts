import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';

import { ICandidatura } from '../../../model/candidatura.interface';
import { IPage } from '../../../model/model.interface';
import { IOferta } from '../../../model/oferta.interface';

import { CandidaturaService } from '../../../service/candidatura.service';
import { BotoneraService } from '../../../service/botonera.service';
import { OfertaService } from '../../../service/oferta.service';
import { SessionService } from '../../../service/session.service';

@Component({
  selector: 'app-candidatura.xoferta.admin.plist.routed',
  templateUrl: './candidatura.xoferta.admin.plist.routed.component.html',
  styleUrls: ['./candidatura.xoferta.admin.plist.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class CandidaturaXofertaAdminPlistRoutedComponent implements OnInit {
  // sesión / rol
  activeSession = false;
  isAdmin = false;
  isEmpresa = false;

  // datos
  oOferta: IOferta | null = null;
  oPage: IPage<ICandidatura> | null = null;

  // paginación
  nPage = 0; // 0-based
  nRpp = 12;

  // orden (si tu backend lo usa)
  strField = '';
  strDir: 'asc' | 'desc' | '' = '';

  // filtro
  strFiltro = '';
  private debounceSubject = new Subject<string>();

  // botonera
  arrBotonera: string[] = [];

  // ui
  loading = true;

  constructor(
    private oCandidaturaService: CandidaturaService,
    private oBotoneraService: BotoneraService,
    private oOfertaService: OfertaService,
    private oActivatedRoute: ActivatedRoute,
    private oRouter: Router,
    private oSessionService: SessionService
  ) {
    this.debounceSubject.pipe(debounceTime(250)).subscribe(() => {
      this.nPage = 0;
      this.getPage();
    });
  }

  ngOnInit(): void {
    this.activeSession = this.oSessionService.isSessionActive();
    this.setRoleFromSession();

    this.oSessionService.onLogin().subscribe({
      next: () => {
        this.activeSession = true;
        this.setRoleFromSession();
        this.getPage();
      },
    });

    this.oSessionService.onLogout().subscribe({
      next: () => {
        this.activeSession = false;
        this.isAdmin = this.isEmpresa = false;
        this.oPage = null;
      },
    });

    // cargar oferta desde ruta
    this.oActivatedRoute.params.subscribe((params) => {
      const id = Number(params['id'] || 0);
      if (!id) return;

      this.loading = true;
      this.oOfertaService.get(id).subscribe({
        next: (oOferta: IOferta) => {
          this.oOferta = oOferta;
          this.nPage = 0;
          this.getPage();
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        },
      });
    });
  }

  private setRoleFromSession(): void {
    const tipo = (this.oSessionService.getSessionTipoUsuario() || '')
      .toLowerCase()
      .trim();

    this.isAdmin = tipo === 'admin' || tipo === 'administrador';
    this.isEmpresa = tipo === 'empresa';
  }

  // ✅ PERMISOS
  get canSeeIds(): boolean {
    return this.activeSession && this.isAdmin;
  }

  get canOpenView(): boolean {
    return this.activeSession && (this.isAdmin || this.isEmpresa);
  }

  get canManage(): boolean {
    return this.activeSession && this.isAdmin;
  }

  // UI helpers
  private scrollToTop(): void {
    setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }), 0);
  }

  get filterLen(): number {
    return (this.strFiltro || '').trim().length;
  }

  get ofertaId(): number {
    return this.oOferta?.id || 0;
  }

  // ===== DATA =====
  getPage(): void {
    const id = this.ofertaId;
    if (!id) return;

    this.loading = true;

    // IMPORTANTE: aquí sí mandamos filtro al backend porque tu endpoint Xoferta lo admite.
    // Si alguna vez vuelve a fallar, lo cambiamos a filtro cliente como hicimos en ofertas.
    this.oCandidaturaService
      .getPageXoferta(this.nPage, this.nRpp, this.strField, this.strDir, this.strFiltro.trim(), id)
      .subscribe({
        next: (oPageFromServer: IPage<ICandidatura>) => {
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

  // refuerzo filtro cliente (por si backend filtra raro)
  private matches(c: ICandidatura, q: string): boolean {
    if (!q) return true;
    const qq = q.toLowerCase();

    const alumno = this.alumnoNombre(c).toLowerCase();
    const fecha = String(c?.fecha || '').toLowerCase();
    const cid = String(c?.id || '').toLowerCase();

    return [alumno, fecha, cid].some((v) => v.includes(qq));
  }

  get displayedCards(): ICandidatura[] {
    const items = this.oPage?.content || [];
    const q = this.strFiltro.trim();
    if (q.length <= 1) return items;
    return items.filter((c) => this.matches(c, q));
  }

  get displayedCount(): number {
    return this.displayedCards.length;
  }

  get totalCount(): number {
    return this.oPage?.totalElements || 0;
  }

  hasMultiplePages(): boolean {
    return (this.oPage?.totalPages || 0) > 1;
  }

  // ===== acciones =====
  view(c: ICandidatura): void {
    if (!this.canOpenView) return;
    this.oRouter.navigate(['admin', 'candidatura', 'view', c.id]).then(() => this.scrollToTop());
  }

  edit(c: ICandidatura): void {
    if (!this.canManage) return;
    this.oRouter.navigate(['admin', 'candidatura', 'edit', c.id]).then(() => this.scrollToTop());
  }

  remove(c: ICandidatura): void {
    if (!this.canManage) return;
    this.oRouter.navigate(['admin', 'candidatura', 'delete', c.id]).then(() => this.scrollToTop());
  }

  viewOferta(ev?: MouseEvent): void {
    ev?.stopPropagation();
    if (!this.ofertaId) return;
    this.oRouter.navigate(['admin', 'oferta', 'view', this.ofertaId]).then(() => this.scrollToTop());
  }

  // ===== paginación =====
  goToPage(p: number): false {
    if (!p) return false;
    const target = p - 1;
    const totalPages = this.oPage?.totalPages || 0;
    if (target < 0 || (totalPages > 0 && target >= totalPages)) return false;
    this.nPage = target;
    this.getPage();
    this.scrollToTop();
    return false;
  }

  goToNext(): false {
    const totalPages = this.oPage?.totalPages || 0;
    if (totalPages === 0) return false;
    if (this.nPage + 1 < totalPages) {
      this.nPage++;
      this.getPage();
      this.scrollToTop();
    }
    return false;
  }

  goToPrev(): false {
    if (this.nPage > 0) {
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

  sort(field: string): void {
    this.strField = field;
    this.strDir = this.strDir === 'asc' ? 'desc' : 'asc';
    this.getPage();
    this.scrollToTop();
  }

  // ===== filtro =====
  onFilterChange(value: string): void {
    this.strFiltro = value ?? '';
    this.debounceSubject.next(this.strFiltro);
  }

  // helpers texto
  alumnoNombre(c: ICandidatura): string {
    const a = c?.alumno;
    return [a?.nombre, a?.ape1, a?.ape2].filter(Boolean).join(' ') || 'Alumno';
  }

  excerpt(text: string | undefined | null, max = 240): string {
    const t = (text || '').trim().replace(/\s+/g, ' ');
    if (!t) return '—';
    if (t.length <= max) return t;
    return t.slice(0, max).trim() + '…';
  }
}
