import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { debounceTime, Subject, Subscription } from 'rxjs';

import { TrimPipe } from '../../../pipe/trim.pipe';

import { IPage } from '../../../model/model.interface';
import { IAlumno } from '../../../model/alumno.interface';
import { ISector } from '../../../model/sector.interface';

import { AlumnoService } from '../../../service/alumno.service';
import { SectorService } from '../../../service/sector.service';
import { BotoneraService } from '../../../service/botonera.service';
import { SessionService } from '../../../service/session.service';

@Component({
  selector: 'app-alumno-xsector-admin-plist',
  templateUrl: './alumno.xsector.admin.plist.routed.component.html',
  styleUrls: ['./alumno.xsector.admin.plist.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TrimPipe, RouterModule],
})
export class AlumnoXsectorAdminPlistComponent implements OnInit, OnDestroy {
  // data
  oPage: IPage<IAlumno> | null = null;
  oSector: ISector | null = null;

  // route param
  sectorId = 0;

  // paginación
  nPage = 0; // 0-based
  nRpp = 12; // 12 / 24 / 36
  arrBotonera: string[] = [];

  // filtro (estilo “pro”)
  query = '';

  // orden (si tu backend lo soporta)
  strField = '';
  strDir = '';

  // sesión / rol
  activeSession = false;
  userEmail = '';
  isAdmin = false;
  isEmpresa = false;
  isAlumno = false;

  loading = true;

  // rpp manual
  private userSetRpp = false;

  // debounce filtro
  private debounceSubject = new Subject<string>();
  private subs: Subscription[] = [];

  constructor(
    private oAlumnoService: AlumnoService,
    private oSectorService: SectorService,
    private oBotoneraService: BotoneraService,
    private oActivatedRoute: ActivatedRoute,
    private oRouter: Router,
    private oSessionService: SessionService
  ) {
    // sesión inicial
    this.activeSession = this.oSessionService.isSessionActive();
    if (this.activeSession) {
      this.userEmail = this.oSessionService.getSessionEmail();
      this.setRoleFromSession();
    }

    // debounce input
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

    // sector hero
    this.loadSector();

    // data
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

  get canAdmin(): boolean {
    return this.isAdmin;
  }

  get canOpenView(): boolean {
    // en tu plist general: solo admin abre view
    // si quieres que empresa/alumno puedan abrir view, me lo dices y lo ajusto.
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
      return;
    }

    this.loading = true;

    // Igual filosofía que empresa x sector: pedimos page x sector sin filtro server
    // y filtramos en cliente con "filteredAlumnos".
    this.oAlumnoService
      .getPageXsector(this.nPage, this.nRpp, this.strField, this.strDir, '', this.sectorId)
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
          console.log(err);
          this.loading = false;
        },
      });
  }

  // ========= FILTRO EN CLIENTE =========
  get filteredAlumnos(): IAlumno[] {
    const q = (this.query || '').toLowerCase().trim();
    const content = this.oPage?.content || [];

    if (!q) return content;

    return content.filter(a => {
      const id = String(a.id || '');
      const nombre = (a.nombre || '').toLowerCase();
      const ape1 = (a.ape1 || '').toLowerCase();
      const ape2 = (a.ape2 || '').toLowerCase();
      const email = (a.email || '').toLowerCase();
      const sector = (a.sector?.nombre || '').toLowerCase();

      return (
        id.includes(q) ||
        nombre.includes(q) ||
        ape1.includes(q) ||
        ape2.includes(q) ||
        email.includes(q) ||
        sector.includes(q)
      );
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

  // ========= UI HELPERS =========
  fullName(a: IAlumno): string {
    return [a?.nombre, a?.ape1, a?.ape2].filter(Boolean).join(' ');
  }

  // ========= ACCIONES =========
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

  view(a: IAlumno): void {
    if (!this.canOpenView) return;
    this.oRouter.navigate(['admin', 'alumno', 'view', a.id]).then(() => this.scrollToTop());
  }

  edit(a: IAlumno): void {
    if (!this.canAdmin) return;
    this.oRouter.navigate(['admin', 'alumno', 'edit', a.id]).then(() => this.scrollToTop());
  }

  remove(a: IAlumno): void {
    if (!this.canAdmin) return;
    this.oRouter.navigate(['admin', 'alumno', 'delete', a.id]).then(() => this.scrollToTop());
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

  trackById(index: number, item: IAlumno): number {
    return item.id;
  }

  getCandidaturasCount(a: IAlumno | null | undefined): number {
  const anyA = a as any;
  return Number(anyA?.candidaturas ?? 0);
}

}
