import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';

import { ICandidatura } from '../../../model/candidatura.interface';
import { IPage } from '../../../model/model.interface';
import { IAlumno } from '../../../model/alumno.interface';

import { CandidaturaService } from '../../../service/candidatura.service';
import { BotoneraService } from '../../../service/botonera.service';
import { AlumnoService } from '../../../service/alumno.service';
import { SessionService } from '../../../service/session.service';

@Component({
  selector: 'app-candidatura.xalumno.admin.plist.routed',
  templateUrl: './candidatura.xalumno.admin.plist.routed.component.html',
  styleUrls: ['./candidatura.xalumno.admin.plist.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class CandidaturaXalumnoAdminPlistRoutedComponent implements OnInit {
  // sesión / rol
  activeSession = false;
  isAdmin = false;

  // datos
  oAlumno: IAlumno | null = null;
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
    private oAlumnoService: AlumnoService,
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
        this.isAdmin = false;
        this.oAlumno = null;
        this.oPage = null;
      },
    });

    // cargar alumno desde ruta
    this.oActivatedRoute.params.subscribe((params) => {
      const id = Number(params['id'] || 0);
      if (!id) return;

      this.loading = true;
      this.oAlumnoService.get(id).subscribe({
        next: (oAlumno: IAlumno) => {
          this.oAlumno = oAlumno;
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
  }

  // permisos (solo admin)
  get canAccess(): boolean {
    return this.activeSession && this.isAdmin;
  }

  get canManage(): boolean {
    return this.canAccess;
  }

  get canSeeIds(): boolean {
    return this.canAccess;
  }

  private scrollToTop(): void {
    setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }), 0);
  }

  get filterLen(): number {
    return (this.strFiltro || '').trim().length;
  }

  get alumnoId(): number {
    return this.oAlumno?.id || 0;
  }

  get alumnoFullName(): string {
    const a = this.oAlumno;
    return [a?.nombre, a?.ape1, a?.ape2].filter(Boolean).join(' ') || 'Alumno';
  }

  // ===== DATA =====
  getPage(): void {
    const id = this.alumnoId;
    if (!id || !this.canAccess) {
      this.loading = false;
      return;
    }

    this.loading = true;

    this.oCandidaturaService
      .getPageXalumno(this.nPage, this.nRpp, this.strField, this.strDir, this.strFiltro.trim(), id)
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

  // refuerzo filtro cliente (por si backend no filtra fino)
  private matches(c: ICandidatura, q: string): boolean {
    if (!q) return true;
    const qq = q.toLowerCase();

    const cid = String(c?.id || '').toLowerCase();
    const fecha = String(c?.fecha || '').toLowerCase();

    const ofertaId = String(c?.oferta?.id || '').toLowerCase();
    const ofertaTitulo = (c?.oferta?.titulo || '').toLowerCase();
    const empresaNombre = (c?.oferta?.empresa?.nombre || '').toLowerCase();

    return [cid, fecha, ofertaId, ofertaTitulo, empresaNombre].some((v) =>
      v.includes(qq)
    );
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
    if (!this.canAccess) return;
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

  viewOferta(ofertaId: number, ev?: MouseEvent): void {
    ev?.stopPropagation();
    if (!this.canAccess || !ofertaId) return;
    this.oRouter.navigate(['admin', 'oferta', 'view', ofertaId]).then(() => this.scrollToTop());
  }

  viewEmpresa(empresaId: number, ev?: MouseEvent): void {
    ev?.stopPropagation();
    if (!this.canAccess || !empresaId) return;
    this.oRouter.navigate(['admin', 'empresa', 'view', empresaId]).then(() => this.scrollToTop());
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

  onFilterChange(value: string): void {
    this.strFiltro = value ?? '';
    this.debounceSubject.next(this.strFiltro);
  }

  // helpers UI
  ofertaTitulo(c: ICandidatura): string {
    return c?.oferta?.titulo || `Oferta ${c?.oferta?.id || ''}`.trim();
  }

  empresaNombre(c: ICandidatura): string {
    return c?.oferta?.empresa?.nombre || 'Empresa';
  }

  excerpt(text: string | undefined | null, max = 220): string {
    const t = (text || '').trim().replace(/\s+/g, ' ');
    if (!t) return '—';
    if (t.length <= max) return t;
    return t.slice(0, max).trim() + '…';
  }
}
