import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { IEmpresa } from '../../../model/empresa.interface';
import { IPage } from '../../../model/model.interface';
import { EmpresaService } from '../../../service/empresa.service';
import { BotoneraService } from '../../../service/botonera.service';
import { SessionService } from '../../../service/session.service';
import { TrimPipe } from '../../../pipe/trim.pipe';

@Component({
  selector: 'app-empresa.admin.plist.routed',
  standalone: true,
  templateUrl: './empresa.admin.plist.routed.component.html',
  styleUrls: ['./empresa.admin.plist.routed.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, TrimPipe],
})
export class EmpresaAdminPlistRoutedComponent implements OnInit, OnDestroy {
  oPage: IPage<IEmpresa> | null = null;

  // paginación
  nPage = 0;   // 0-based
  nRpp  = 12;  // 12 / 24 / 36

  // filtro tipo Sector: cadena única que filtra sobre la lista actual
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
    private oEmpresaService: EmpresaService,
    private oBotoneraService: BotoneraService,
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

    this.isAdmin   = (tipo === 'admin' || tipo === 'administrador');
    this.isEmpresa = (tipo === 'empresa');
    this.isAlumno  = (tipo === 'alumno');
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
  getPage(): void {
    this.loading = true;
    // filtro vacío en backend → filtramos en cliente como en sectores
    this.oEmpresaService.getPage(this.nPage, this.nRpp, '', '', '')
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

  // ========= FILTRO (referencia: SectorAdminPlistRouted) =========
  get filteredEmpresas(): IEmpresa[] {
    const q = (this.query || '').toLowerCase().trim();
    const content = this.oPage?.content || [];

    if (!q) return content;

    return content.filter(e =>
      String(e.id).includes(q) ||
      (e.nombre || '').toLowerCase().includes(q) ||
      (e.email || '').toLowerCase().includes(q) ||
      (e.sector?.nombre || '').toLowerCase().includes(q)
    );
  }

  // ========= ACCIONES =========
  edit(e: IEmpresa): void {
    if (this.isAdmin) {
      this.oRouter.navigate(['admin', 'empresa', 'edit', e.id]);
    }
  }

  view(e: IEmpresa): void {
    if (this.isAdmin) {
      this.oRouter.navigate(['admin', 'empresa', 'view', e.id]);
    }
  }

  remove(e: IEmpresa): void {
    if (this.isAdmin) {
      this.oRouter.navigate(['admin', 'empresa', 'delete', e.id]);
    }
  }

  // Card completa clicable → solo admins
  onCardClick(e: IEmpresa): void {
    if (this.isAdmin) {
      this.view(e);
    }
  }

  // click “X ofertas”
  onOffersClick(empresa: IEmpresa, event: MouseEvent): void {
    event.stopPropagation();
    if (!this.isAdmin || !empresa.ofertas) return;

    this.oRouter.navigate(
      ['admin', 'oferta', 'xempresa', 'plist', empresa.id]
    );
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

  trackById(index: number, item: IEmpresa): number {
    return item.id;
  }
}
