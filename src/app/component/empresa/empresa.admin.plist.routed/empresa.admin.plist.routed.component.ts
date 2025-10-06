import { Component, OnInit, OnDestroy } from '@angular/core';
import { IEmpresa } from '../../../model/empresa.interface';
import { EmpresaService } from '../../../service/empresa.service';
import { CommonModule } from '@angular/common';
import { IPage } from '../../../model/model.interface';
import { FormsModule } from '@angular/forms';
import { BotoneraService } from '../../../service/botonera.service';
import { debounceTime, Subject } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { TrimPipe } from '../../../pipe/trim.pipe';
import { SessionService } from '../../../service/session.service';

@Component({
  selector: 'app-empresa.admin.plist.routed',
  templateUrl: './empresa.admin.plist.routed.component.html',
  styleUrls: ['./empresa.admin.plist.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TrimPipe, RouterModule],
})
export class EmpresaAdminPlistRoutedComponent implements OnInit, OnDestroy {
  oPage: IPage<IEmpresa> | null = null;

  // paginación (múltiplos de 6: 12 / 24 / 36 → así no queda hueco en 1, 2 o 3 columnas)
  nPage = 0;    // 0-based
  nRpp = 12;

  // filtro
  strFiltro = '';
  private debounceSubject = new Subject<string>();

  // botonera
  arrBotonera: string[] = [];

  // sesión/rol
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
    this.debounceSubject.pipe(debounceTime(200)).subscribe(() => {
      this.nPage = 0;
      this.getPage();
    });

    this.activeSession = this.oSessionService.isSessionActive();
    if (this.activeSession) {
      this.userEmail = this.oSessionService.getSessionEmail();
      this.setRoleFromSession();
    }
  }

  ngOnInit() {
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

    // Ajuste inicial opcional: mantener múltiplos de 6 según columnas visibles
    this.syncRppToColumns();
    window.addEventListener('resize', this.syncRppToColumns);

    this.getPage();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.syncRppToColumns);
  }

  private setRoleFromSession() {
    const tipo = (this.oSessionService.getSessionTipoUsuario() || '').toLowerCase().trim();
    this.isAdmin = tipo === 'admin' || tipo === 'administrador';
    this.isEmpresa = tipo === 'empresa';
    this.isAlumno = tipo === 'alumno';
  }

  // columnas actuales (1 / 2 / 3) según media queries del grid
  private getCols = () => {
    const w = window.innerWidth;
    if (w >= 1200) return 3;
    if (w >= 768) return 2;
    return 1;
  };

  // Mantener RPP como múltiplo de 6 y que cuadre filas
  private syncRppToColumns = () => {
    if (this.userSetRpp) return;
    if (![12, 24, 36].includes(this.nRpp)) {
      this.nRpp = 12;
    }
  };

  getPage() {
    this.loading = true;
    this.oEmpresaService.getPage(this.nPage, this.nRpp, '', '', this.strFiltro)
      .subscribe({
        next: (oPageFromServer: IPage<IEmpresa>) => {
          this.oPage = oPageFromServer;
          this.arrBotonera = this.oBotoneraService.getBotonera(
            this.nPage, oPageFromServer.totalPages
          );
          this.loading = false;
        },
        error: (err) => { console.log(err); this.loading = false; },
      });
  }

  // navegación
  edit(e: IEmpresa) { if (this.isAdmin) this.oRouter.navigate(['admin/empresa/edit', e.id]); }
  view(e: IEmpresa) { this.oRouter.navigate(['admin/empresa/view', e.id]); }
  remove(e: IEmpresa) { if (this.isAdmin) this.oRouter.navigate(['admin/empresa/delete', e.id]); }

  goToPage(p: number) { if (p) { this.nPage = p - 1; this.getPage(); } return false; }
  goToNext() { this.nPage++; this.getPage(); return false; }
  goToPrev() { this.nPage--; this.getPage(); return false; }

  goToRpp(nrpp: number) {
    this.userSetRpp = true;
    this.nPage = 0;
    this.nRpp = nrpp;
    this.getPage();
    return false;
  }

  filter() { this.debounceSubject.next(this.strFiltro); }

  hasMultiplePages(): boolean { return (this.oPage?.totalPages || 0) > 1; }

  trackById(index: number, item: IEmpresa): number { return item.id; }
}
