import { Component, OnInit } from '@angular/core';
import { IOferta } from '../../../model/oferta.interface';
import { OfertaService } from '../../../service/oferta.service';
import { CommonModule } from '@angular/common';
import { IPage } from '../../../model/model.interface';
import { FormsModule } from '@angular/forms';
import { BotoneraService } from '../../../service/botonera.service';
import { debounceTime, Subject } from 'rxjs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TrimPipe } from '../../../pipe/trim.pipe';
import { ISector } from '../../../model/sector.interface';
import { HttpErrorResponse } from '@angular/common/http';
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

  // rol
  isAdmin = false;

  // datos
  oPage: IPage<IOferta> | null = null;
  oSector: ISector | null = null;

  // paginación
  nPage: number = 0;    // 0-based
  nRpp: number = 10;

  // filtro
  strFiltro: string = '';
  private debounceSubject = new Subject<string>();

  // botonera
  arrBotonera: string[] = [];

  loading = true;

  constructor(
    private oOfertaService: OfertaService,
    private oBotoneraService: BotoneraService,
    private oActivatedRoute: ActivatedRoute,
    private oSectorService: SectorService,
    private oRouter: Router,
    private oSessionService: SessionService
  ) {
    // obtener el sector desde la ruta
    this.oActivatedRoute.params.subscribe((params) => {
      this.oSectorService.get(params['id']).subscribe({
        next: (oSector: ISector) => {
          this.oSector = oSector;
          this.getPage(oSector.id);
        },
        error: (err: HttpErrorResponse) => console.log(err),
      });
    });

    // filtro con debounce
    this.debounceSubject.pipe(debounceTime(200)).subscribe(() => {
      this.nPage = 0;
      this.getPage(this.oSector?.id || 0);
    });
  }

  ngOnInit() {
    this.setRoleFromSession();
    this.oSessionService.onLogin().subscribe({ next: () => this.setRoleFromSession() });
    this.oSessionService.onLogout().subscribe({ next: () => this.isAdmin = false });
  }

  private setRoleFromSession() {
    const tipo = (this.oSessionService.getSessionTipoUsuario() || '').toLowerCase().trim();
    this.isAdmin = (tipo === 'admin' || tipo === 'administrador');
  }

  // si solo hay una página, no mostramos paginación
  hasMultiplePages(): boolean {
    return (this.oPage?.totalPages || 0) > 1;
  }

  getPage(id: number = 0) {
    this.loading = true;
    // SIN ORDENACIÓN: strField='' y strDir=''
    this.oOfertaService
      .getPageXsector(this.nPage, this.nRpp, '', '', this.strFiltro, id)
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

  // navegación
  view(o: IOferta)  { this.oRouter.navigate(['admin/oferta/view',  o.id]); }
  edit(o: IOferta)  { if (this.isAdmin) this.oRouter.navigate(['admin/oferta/edit',  o.id]); }
  remove(o: IOferta){ if (this.isAdmin) this.oRouter.navigate(['admin/oferta/delete', o.id]); }

  goToPage(p: number) {
    if (p) { this.nPage = p - 1; this.getPage(this.oSector?.id || 0); }
    return false;
  }
  goToNext() { this.nPage++; this.getPage(this.oSector?.id || 0); return false; }
  goToPrev() { this.nPage--; this.getPage(this.oSector?.id || 0); return false; }

  goToRpp(nrpp: number) {
    this.nPage = 0;
    this.nRpp = nrpp;
    this.getPage(this.oSector?.id || 0);
    return false;
  }

  filter() { this.debounceSubject.next(this.strFiltro); }
}
