import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';

import { ICandidatura } from '../../../model/candidatura.interface';
import { IPage } from '../../../model/model.interface';
import { CandidaturaService } from '../../../service/candidatura.service';
import { BotoneraService } from '../../../service/botonera.service';
import { SessionService } from '../../../service/session.service';

@Component({
  selector: 'app-candidatura.admin.plist.routed',
  templateUrl: './candidatura.admin.plist.routed.component.html',
  styleUrls: ['./candidatura.admin.plist.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class CandidaturaAdminPlistRoutedComponent implements OnInit {
  // rol
  isAdmin = false;
  isEmpresa = false;
  isAlumno = false;

  // datos
  oPage: IPage<ICandidatura> | null = null;

  // paginación
  nPage = 0; // 0-based
  nRpp = 12;

  // filtro
  strFiltro = '';
  private debounceSubject = new Subject<string>();

  // botonera
  arrBotonera: string[] = [];

  loading = true;

  constructor(
    private oCandidaturaService: CandidaturaService,
    private oBotoneraService: BotoneraService,
    private oRouter: Router,
    private oSessionService: SessionService
  ) {
    this.debounceSubject.pipe(debounceTime(250)).subscribe(() => {
      this.nPage = 0;
      this.getPage();
    });
  }

  ngOnInit() {
    this.setRoleFromSession();

    this.oSessionService.onLogin().subscribe({
      next: () => {
        this.setRoleFromSession();
        this.getPage();
      },
    });

    this.oSessionService.onLogout().subscribe({
      next: () => {
        this.isAdmin = this.isEmpresa = this.isAlumno = false;
        this.getPage();
      },
    });

    this.getPage();
  }

  private setRoleFromSession() {
    const tipo = (this.oSessionService.getSessionTipoUsuario() || '')
      .toLowerCase()
      .trim();
    this.isAdmin = tipo === 'admin' || tipo === 'administrador';
    this.isEmpresa = tipo === 'empresa';
    this.isAlumno = tipo === 'alumno';
  }

  // ===== helper UI =====
  private scrollToTop(): void {
    setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }), 0);
  }

  get filterLen(): number {
    return (this.strFiltro || '').trim().length;
  }

  /** ===== Carga de datos ===== */
  getPage() {
    this.loading = true;
    const q = this.strFiltro.trim();

    this.oCandidaturaService.getPage(this.nPage, this.nRpp, '', '', q).subscribe({
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

  /** ===== filtro cliente (refuerzo) ===== */
  private matches(c: ICandidatura, q: string): boolean {
    if (!q) return true;
    const qq = q.toLowerCase();

    const campos = [
      String(c.id || '').toLowerCase(),
      String(c.oferta?.id || '').toLowerCase(),
      (c.oferta?.titulo || '').toLowerCase(),
      (c.alumno?.nombre || '').toLowerCase(),
      (c.alumno?.ape1 || '').toLowerCase(),
      (c.alumno?.ape2 || '').toLowerCase(),
      String(c.fecha || '').toLowerCase(),
    ];

    return campos.some((v) => v.includes(qq));
  }

  /** Admin/Alumno: cards directas */
  get displayedCards(): ICandidatura[] {
    const items = this.oPage?.content || [];
    const q = this.strFiltro.trim();
    if (q.length <= 1) return items;
    return items.filter((c) => this.matches(c, q));
  }

  /** Empresa: agrupado por oferta */
  get groupsByOferta() {
    const src = this.oPage?.content || [];
    const q = this.strFiltro.trim();
    const items = q.length <= 1 ? src : src.filter((c) => this.matches(c, q));

    const map = new Map<
      number,
      { ofertaId: number; ofertaTitulo: string; items: ICandidatura[] }
    >();

    for (const c of items) {
      const id = c?.oferta?.id || 0;
      const titulo = (c?.oferta?.titulo || '').trim();
      if (!map.has(id)) map.set(id, { ofertaId: id, ofertaTitulo: titulo, items: [] });
      map.get(id)!.items.push(c);
    }
    return Array.from(map.values());
  }

  /** Conteos chips */
  get displayedCount(): number {
    if (!this.oPage) return 0;
    if (this.isEmpresa && !this.isAdmin) {
      return this.groupsByOferta.reduce((acc, g) => acc + g.items.length, 0);
    }
    return this.displayedCards.length;
  }

  get totalCount(): number {
    return this.oPage?.totalElements || 0;
  }

  hasMultiplePages(): boolean {
    return (this.oPage?.totalPages || 0) > 1;
  }

  /** ===== navegación ===== */
  view(c: ICandidatura) {
    this.oRouter.navigate(['admin', 'candidatura', 'view', c.id]).then(() => this.scrollToTop());
  }

  edit(c: ICandidatura) {
    if (this.isAdmin) {
      this.oRouter.navigate(['admin', 'candidatura', 'edit', c.id]).then(() => this.scrollToTop());
    }
  }

  remove(c: ICandidatura) {
    if (this.isAdmin || this.isAlumno) {
      this.oRouter
        .navigate(['admin', 'candidatura', 'delete', c.id])
        .then(() => this.scrollToTop());
    }
  }

  viewOferta(ofertaId: number, ev?: MouseEvent) {
    if (ev) ev.stopPropagation();
    this.oRouter.navigate(['admin', 'oferta', 'view', ofertaId]).then(() => this.scrollToTop());
  }

  /** ===== paginación ===== */
  goToPage(p: number) {
    if (!p) return false;
    const target = p - 1;
    const totalPages = this.oPage?.totalPages || 0;
    if (target < 0 || (totalPages > 0 && target >= totalPages)) return false;
    this.nPage = target;
    this.getPage();
    return false;
  }

  goToNext() {
    const totalPages = this.oPage?.totalPages || 0;
    if (totalPages === 0) return false;
    if (this.nPage + 1 < totalPages) {
      this.nPage++;
      this.getPage();
    }
    return false;
  }

  goToPrev() {
    if (this.nPage > 0) {
      this.nPage--;
      this.getPage();
    }
    return false;
  }

  goToRpp(nrpp: number) {
    this.nPage = 0;
    this.nRpp = nrpp;
    this.getPage();
    return false;
  }

  /** ===== filtro (debounced) ===== */
  onFilterChange(value: string) {
    this.strFiltro = value ?? '';
    this.debounceSubject.next(this.strFiltro);
  }

  // helpers de texto
  alumnoNombre(c: ICandidatura): string {
    const a = c?.alumno;
    return [a?.nombre, a?.ape1, a?.ape2].filter(Boolean).join(' ') || 'Alumno';
  }

  ofertaTitulo(c: ICandidatura): string {
    return c?.oferta?.titulo || `Oferta ${c?.oferta?.id || ''}`.trim();
  }
}
