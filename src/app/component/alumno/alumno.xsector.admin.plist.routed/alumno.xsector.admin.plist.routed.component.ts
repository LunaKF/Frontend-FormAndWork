import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TrimPipe } from '../../../pipe/trim.pipe';
import { IPage } from '../../../model/model.interface';
import { IAlumno } from '../../../model/alumno.interface';
import { AlumnoService } from '../../../service/alumno.service';
import { BotoneraService } from '../../../service/botonera.service';
import { SectorService } from '../../../service/sector.service';
import { ISector } from '../../../model/sector.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { SessionService } from '../../../service/session.service';

@Component({
  selector: 'app-alumno-xsector-admin-plist',
  templateUrl: './alumno.xsector.admin.plist.routed.component.html',
  styleUrls: ['./alumno.xsector.admin.plist.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TrimPipe, RouterModule],
})
export class AlumnoXsectorAdminPlistComponent implements OnInit {
  isAdmin = false;
  isEmpresa = false;

  oPage: IPage<IAlumno> | null = null;
  oSector: ISector | null = null;

  // paginación
  nPage = 0;   // 0-based
  nRpp = 10;

  // filtro
  strFiltro = '';
  private debounceSubject = new Subject<string>();

  // botonera
  arrBotonera: string[] = [];

  loading = true;

  constructor(
    private oAlumnoService: AlumnoService,
    private oBotoneraService: BotoneraService,
    private oActivatedRoute: ActivatedRoute,
    private oSectorService: SectorService,
    private oRouter: Router,
    private oSessionService: SessionService

  ) {
    this.oActivatedRoute.params.subscribe((params) => {
      this.oSectorService.get(params['id']).subscribe({
        next: (oSector: ISector) => {
          this.oSector = oSector;
          this.getPage(oSector.id);
        },
        error: (err: HttpErrorResponse) => console.log(err),
      });
    });

    this.debounceSubject.pipe(debounceTime(200)).subscribe(() => {
      this.nPage = 0;
      this.getPage(this.oSector?.id || 0);
    });
  }

  // para saber si hay varias páginas o no y no permitir que cambie de pagina si solo hay una
  hasMultiplePages(): boolean {
    return (this.oPage?.totalPages || 0) > 1;
  }


  ngOnInit() {
    this.setRoleFromSession();            
    this.oSessionService.onLogin().subscribe({
      next: () => this.setRoleFromSession()
    });
    this.oSessionService.onLogout().subscribe({
      next: () => { this.isAdmin = this.isEmpresa = false; }
    });
  }


 private setRoleFromSession() {
    const tipo = (this.oSessionService.getSessionTipoUsuario() || '').toLowerCase().trim();
    this.isAdmin   = (tipo === 'admin' || tipo === 'administrador');
    this.isEmpresa = (tipo === 'empresa');
    // ( isAlumno: const isAlumno = (tipo === 'alumno'))
  }

  getPage(id: number = 0) {
    this.loading = true;
    this.oAlumnoService
      .getPageXsector(this.nPage, this.nRpp, '', '', this.strFiltro, id) // sin ordenación
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

  edit(a: IAlumno) { if (this.isAdmin) this.oRouter.navigate(['admin/alumno/edit', a.id]); }
  view(a: IAlumno) { this.oRouter.navigate(['admin/alumno/view', a.id]); }
  remove(a: IAlumno) { if (this.isAdmin) this.oRouter.navigate(['admin/alumno/delete', a.id]); }

  goToPage(p: number) {
    if (p) { this.nPage = p - 1; this.getPage(); }
    return false;
  }
  goToNext() { this.nPage++; this.getPage(); return false; }
  goToPrev() { this.nPage--; this.getPage(); return false; }

  goToRpp(nrpp: number) { this.nPage = 0; this.nRpp = nrpp; this.getPage(); return false; }

  filter() { this.debounceSubject.next(this.strFiltro); }
}
