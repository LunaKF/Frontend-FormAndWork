import { Component, OnInit } from '@angular/core';
import { IEmpresa } from '../../../model/empresa.interface';
import { EmpresaService } from '../../../service/empresa.service';
import { CommonModule } from '@angular/common';
import { IPage } from '../../../model/model.interface';
import { FormsModule } from '@angular/forms';
import { BotoneraService } from '../../../service/botonera.service';
import { debounceTime, Subject } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { TrimPipe } from '../../../pipe/trim.pipe';


@Component({
  selector: 'app-empresa.admin.plist.routed',
  templateUrl: './empresa.admin.plist.routed.component.html',
  styleUrls: ['./empresa.admin.plist.routed.component.css'] ,
  standalone: true,
  imports: [CommonModule, FormsModule, TrimPipe, RouterModule],
})

export class EmpresaAdminPlistRoutedComponent implements OnInit {

  oPage: IPage<IEmpresa> | null = null;
  //
  nPage: number = 0; // 0-based server count
  nRpp: number = 10;
  //
  strField: string = '';
  strDir: string = '';
  //
  strFiltro: string = '';
  //
  arrBotonera: string[] = [];
  //
  private debounceSubject = new Subject<string>();
  constructor(
    private oEmpresaService: EmpresaService,
    private oBotoneraService: BotoneraService,
    private oRouter: Router
  ) {
    this.debounceSubject.pipe(debounceTime(10)).subscribe((value) => {
      this.getPage();
    });
  }

  ngOnInit() {
    this.getPage();
  }
  getPage() {
    this.oEmpresaService
      .getPage(this.nPage, this.nRpp, this.strField, this.strDir, this.strFiltro)
      .subscribe({
        next: (oPageFromServer: IPage<IEmpresa>) => {
          this.oPage = oPageFromServer;
          this.arrBotonera = this.oBotoneraService.getBotonera(
            this.nPage,
            oPageFromServer.totalPages
          );
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  edit(oEmpresa: IEmpresa) {
    //navegar a la página de edición
    this.oRouter.navigate(['admin/empresa/edit', oEmpresa.id]);
  }

  view(oEmpresa: IEmpresa) {
    //navegar a la página de edición
    this.oRouter.navigate(['admin/empresa/view', oEmpresa.id]);
  }

  remove(oEmpresa: IEmpresa) {
    this.oRouter.navigate(['admin/empresa/delete/', oEmpresa.id]);
  }

  goToPage(p: number) {
    if (p) {
      this.nPage = p - 1;
      this.getPage();
    }
    return false;
  }

  goToNext() {
    this.nPage++;
    this.getPage();
    return false;
  }

  goToPrev() {
    this.nPage--;
    this.getPage();
    return false;
  }

  sort(field: string) {
    this.strField = field;
    this.strDir = this.strDir === 'asc' ? 'desc' : 'asc';
    this.getPage();
  }

  goToRpp(nrpp: number) {
    this.nPage = 0;
    this.nRpp = nrpp;
    this.getPage();
    return false;
  }

  filter(event: KeyboardEvent) {
    this.debounceSubject.next(this.strFiltro);
  }
}
