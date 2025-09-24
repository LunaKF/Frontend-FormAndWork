import { Component, OnInit } from '@angular/core';
import { ICandidatura } from '../../../model/candidatura.interface';
import { CandidaturaService } from '../../../service/candidatura.service';
import { CommonModule } from '@angular/common';
import { IPage } from '../../../model/model.interface';
import { FormsModule } from '@angular/forms';
import { BotoneraService } from '../../../service/botonera.service';
import { debounceTime, Subject } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
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
  nPage: number = 0;   // 0-based
  nRpp: number = 10;

  // filtro
  strFiltro: string = '';
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
    this.debounceSubject.pipe(debounceTime(200)).subscribe(() => {
      this.nPage = 0;
      this.getPage();
    });
  }

  ngOnInit() {
    this.setRoleFromSession();
    this.oSessionService.onLogin().subscribe({ next: () => this.setRoleFromSession() });
    this.oSessionService.onLogout().subscribe({
      next: () => {
        this.isAdmin = this.isEmpresa = this.isAlumno = false;
      }
    });

    this.getPage();
  }

  private setRoleFromSession() {
    const tipo = (this.oSessionService.getSessionTipoUsuario() || '').toLowerCase().trim();
    this.isAdmin = (tipo === 'admin' || tipo === 'administrador');
    this.isEmpresa = (tipo === 'empresa');
    this.isAlumno = (tipo === 'alumno');
  }

  // SIN ordenación alfabética: siempre strField='' y strDir=''
  getPage() {
    this.loading = true;
    this.oCandidaturaService
      .getPage(this.nPage, this.nRpp, '', '', this.strFiltro)
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
          console.log(err);
          this.loading = false;
        },
      });
  }

  // agrupación por oferta (para EMPRESA). Solo agrupa lo de la página actual.
  get groupsByOferta() {
    const items = this.oPage?.content || [];
    const map = new Map<number, { ofertaId: number; ofertaTitulo: string; items: ICandidatura[] }>();
    for (const c of items) {
      const id = c?.oferta?.id || 0;
      const titulo = (c?.oferta?.titulo || '').trim();
      if (!map.has(id)) map.set(id, { ofertaId: id, ofertaTitulo: titulo, items: [] });
      map.get(id)!.items.push(c);
    }
    return Array.from(map.values());
  }

  hasMultiplePages(): boolean {
    return (this.oPage?.totalPages || 0) > 1;
  }

  // navegación
  view(c: ICandidatura) { this.oRouter.navigate(['admin/candidatura/view', c.id]); }
  edit(c: ICandidatura) { if (this.isAdmin) this.oRouter.navigate(['admin/candidatura/edit', c.id]); }
  remove(c: ICandidatura) { if (this.isAdmin) this.oRouter.navigate(['admin/candidatura/delete', c.id]); }

  goToPage(p: number) {
    if (p) { this.nPage = p - 1; this.getPage(); }
    return false;
  }
  goToNext() { this.nPage++; this.getPage(); return false; }
  goToPrev() { this.nPage--; this.getPage(); return false; }

  goToRpp(nrpp: number) {
    this.nPage = 0;
    this.nRpp = nrpp;
    this.getPage();
    return false;
  }

  filter() { this.debounceSubject.next(this.strFiltro); }
}
