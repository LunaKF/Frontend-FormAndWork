import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { IPage } from '../../../model/model.interface';
import { IOferta } from '../../../model/oferta.interface';
import { IEmpresa } from '../../../model/empresa.interface';

import { OfertaService } from '../../../service/oferta.service';
import { EmpresaService } from '../../../service/empresa.service';
import { BotoneraService } from '../../../service/botonera.service';
import { SessionService } from '../../../service/session.service';

import { TrimPipe } from '../../../pipe/trim.pipe';

@Component({
  selector: 'app-oferta.xempresa.admin.plist.routed',
  standalone: true,
  templateUrl: './oferta.xempresa.admin.plist.routed.component.html',
  styleUrls: ['./oferta.xempresa.admin.plist.routed.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, TrimPipe],
})
export class OfertaXempresaAdminPlistRoutedComponent implements OnInit, OnDestroy {
  // data
  oPage: IPage<IOferta> | null = null;
  oEmpresa: IEmpresa | null = null;

  // route param
  empresaId = 0;

  // paginación
  nPage = 0;   // 0-based
  nRpp = 12;   // 12 / 24 / 36

  // filtro
  query = '';

  // botonera
  arrBotonera: string[] = [];

  // sesión / rol
  activeSession = false;
  userEmail = '';
  isAdmin = false;
  isEmpresa = false;
  isAlumno = false;

  loading = true;

  // si el usuario toca manualmente el RPP, dejamos de auto-ajustar
  private userSetRpp = false;

  constructor(
    private oOfertaService: OfertaService,
    private oEmpresaService: EmpresaService,
    private oBotoneraService: BotoneraService,
    private oActivatedRoute: ActivatedRoute,
    private oRouter: Router,
    private oSessionService: SessionService
  ) {
    // estado inicial de sesión
    this.activeSession = this.oSessionService.isSessionActive();
    if (this.activeSession) {
      this.userEmail = this.oSessionService.getSessionEmail();
      this.setRoleFromSession();
    }
  }

  ngOnInit(): void {
    this.empresaId = +this.oActivatedRoute.snapshot.params['id'];

    // cambios de sesión en caliente
    this.oSessionService.onLogin().subscribe({
      next: () => {
        this.activeSession = true;
        this.userEmail = this.oSessionService.getSessionEmail();
        this.setRoleFromSession();
      },
    });

    this.oSessionService.onLogout().subscribe({
      next: () => {
        this.activeSession = false;
        this.userEmail = '';
        this.isAdmin = this.isEmpresa = this.isAlumno = false;
      },
    });

    // mantener RPP válido
    this.syncRppToColumns();
    window.addEventListener('resize', this.syncRppToColumns);

    // cargar empresa para el HERO
    this.loadEmpresa();

    // cargar ofertas
    this.getPage();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.syncRppToColumns);
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

  // alumno: solo ver
  get canCreateEditDelete(): boolean {
    return this.isAdmin;
  }

  // ========= RPP / columnas =========
  private getCols = () => {
    const w = window.innerWidth;
    if (w >= 1200) return 3;
    if (w >= 768) return 2;
    return 1;
  };

  private syncRppToColumns = () => {
    if (this.userSetRpp) return;
    if (![12, 24, 36].includes(this.nRpp)) {
      this.nRpp = 12;
    }
  };

  // ========= DATA =========
  private loadEmpresa(): void {
    this.oEmpresaService.get(this.empresaId).subscribe({
      next: (e: IEmpresa) => {
        this.oEmpresa = e;
      },
      error: () => {
        // si falla, no rompemos el layout
        this.oEmpresa = null;
      },
    });
  }

  getPage(): void {
    this.loading = true;

    // backend: page x empresa
    this.oOfertaService.getPageXempresa(this.nPage, this.nRpp, '', '', '', this.empresaId)
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
          console.log(err);
          this.loading = false;
        },
      });
  }

  // ========= FILTRO (idéntico al plist) =========
  get filteredOfertas(): IOferta[] {
    const q = (this.query || '').toLowerCase().trim();
    const content = this.oPage?.content || [];

    if (!q) return content;

    return content.filter(o =>
      String(o.id).includes(q) ||
      (o.titulo || '').toLowerCase().includes(q) ||
      (o.descripcion || '').toLowerCase().includes(q) ||
      (o.sector?.nombre || '').toLowerCase().includes(q) ||
      // por si tu modelo tiene empresa dentro
      ((o as any).empresa?.nombre || '').toLowerCase().includes(q)
    );
  }

  // ========= SCROLL TOP =========
  private scrollToTop(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, 0);
  }

  // ========= ACCIONES =========
  view(o: IOferta): void {
    this.oRouter.navigate(['admin', 'oferta', 'view', o.id]).then(() => {
      this.scrollToTop();
    });
  }

  create(): void {
    if (!this.canCreateEditDelete) return;

    // si tu create necesita empresaId por ruta, usa esto:
    // this.oRouter.navigate(['admin', 'oferta', 'create', this.empresaId])
    // si NO, deja create normal:
    this.oRouter.navigate(['admin', 'oferta', 'create']).then(() => {
      this.scrollToTop();
    });
  }

  edit(o: IOferta): void {
    if (!this.canCreateEditDelete) return;

    this.oRouter.navigate(['admin', 'oferta', 'edit', o.id]).then(() => {
      this.scrollToTop();
    });
  }

  remove(o: IOferta): void {
    if (!this.canCreateEditDelete) return;

    this.oRouter.navigate(['admin', 'oferta', 'delete', o.id]).then(() => {
      this.scrollToTop();
    });
  }

  // ========= Paginación =========
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

  hasMultiplePages(): boolean {
    return (this.oPage?.totalPages || 0) > 1;
  }

  trackById(index: number, item: IOferta): number {
    return item.id;
  }
}
