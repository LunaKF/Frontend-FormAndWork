import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { debounceTime, Subject, filter } from 'rxjs';

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
  nPage = 0;            // 0-based
  nRpp = 10;
  strField = '';
  strDir: 'asc' | 'desc' | '' = '';

  /** Filtro */
  strFiltro = '';
  private debounceSubject = new Subject<string>();

  /** Sesión */
  activeSession = false;
  userEmail = '';

  /** Contexto: true si estamos bajo /admin/... */
  adminContext = false;

  constructor(
    private oOfertaService: OfertaService,
    private oBotoneraService: BotoneraService,
    private oRouter: Router,
    private oSessionService: SessionService,
  ) {
    this.debounceSubject.pipe(debounceTime(300)).subscribe(() => this.getPage());

    this.activeSession = this.oSessionService.isSessionActive();
    if (this.activeSession) this.userEmail = this.oSessionService.getSessionEmail();

    // Detectar si estamos en /admin/ para habilitar acciones y enlaces internos
    this.adminContext = this.oRouter.url.startsWith('/admin/');
    this.oRouter.events
      .pipe(filter(ev => ev instanceof NavigationEnd))
      .subscribe(() => {
        this.adminContext = this.oRouter.url.startsWith('/admin/');
      });
  }

  ngOnInit(): void {
    this.oSessionService.onLogin().subscribe({
      next: () => {
        this.activeSession = true;
        this.userEmail = this.oSessionService.getSessionEmail();
        this.getPage();
      },
    });

    this.oSessionService.onLogout().subscribe({
      next: () => {
        this.activeSession = false;
        this.userEmail = '';
        this.getPage();
      },
    });

    this.getPage();
  }

  /** Getters de ayuda */
  get currentPage(): number { return this.nPage + 1; }
  hasPrev(): boolean { return this.currentPage > 1; }
  hasNext(): boolean { return !!this.oPage && this.currentPage < (this.oPage.totalPages || 0); }

  /** Datos */
  getPage(): void {
    this.oOfertaService
      .getPage(this.nPage, this.nRpp, this.strField, this.strDir, this.strFiltro)
      .subscribe({
        next: (oPageFromServer: IPage<IOferta>) => {
          this.oPage = oPageFromServer;
          // Genera la botonera (1..N con posibles …)
          this.arrBotonera = this.oBotoneraService.getBotonera(this.nPage, oPageFromServer.totalPages);
        },
        error: (err) => console.error(err),
      });
  }

  /** Botonera */
  arrBotonera: string[] = [];
  goToPage(p: number): false {
    if (p) { this.nPage = p - 1; this.getPage(); }
    return false;
  }
  goToNext(): false { if (this.hasNext()) { this.nPage++; this.getPage(); } return false; }
  goToPrev(): false { if (this.hasPrev()) { this.nPage--; this.getPage(); } return false; }

  /** Ordenación */
  sort(field: string): void {
    this.strField = field;
    this.strDir = this.strDir === 'asc' ? 'desc' : 'asc';
    this.getPage();
  }

  /** Resultados por página */
  goToRpp(nrpp: number): false {
    this.nPage = 0; this.nRpp = nrpp; this.getPage();
    return false;
  }

  /** Filtro con debounce */
  filter(_: KeyboardEvent): void { this.debounceSubject.next(this.strFiltro); }

  /** Acciones */
  edit(o: IOferta): void { if (this.adminContext) this.oRouter.navigate(['admin/oferta/edit', o.id]); }
  view(o: IOferta): void {
    // En admin -> siempre ver. En público:
    //   - si loggeada -> ver detalle protegido
    //   - si no loggeada -> no hace nada (tooltip ya avisa)
    if (this.adminContext || this.activeSession) {
      this.oRouter.navigate(['admin/oferta/view', o.id]);
    }
  }
  remove(o: IOferta): void { if (this.adminContext) this.oRouter.navigate(['admin/oferta/delete', o.id]); }
}
