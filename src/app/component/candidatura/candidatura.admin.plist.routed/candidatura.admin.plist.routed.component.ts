import { Component, OnInit } from '@angular/core';
import { ICandidatura } from '../../../model/candidatura.interface';
import { CandidaturaService } from '../../../service/candidatura.service';
import { CommonModule } from '@angular/common';
import { IPage } from '../../../model/model.interface';
import { FormsModule } from '@angular/forms';
import { BotoneraService } from '../../../service/botonera.service';
import { debounceTime, Subject } from 'rxjs';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-candidatura.admin.plist.routed',
  templateUrl: './candidatura.admin.plist.routed.component.html',
  styleUrls: ['./candidatura.admin.plist.routed.component.css'] ,
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})

export class CandidaturaAdminPlistRoutedComponent implements OnInit {

  oPage: IPage<ICandidatura> | null = null;
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
    private oCandidaturaService: CandidaturaService,
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
    this.oCandidaturaService
      .getPage(this.nPage, this.nRpp, this.strField, this.strDir, this.strFiltro)
      .subscribe({
        next: (oPageFromServer: IPage<ICandidatura>) => {
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

  edit(oCandidatura: ICandidatura) {
    this.oRouter.navigate(['admin/candidatura/edit', oCandidatura.id]);
  }

  view(oCandidatura: ICandidatura) {
    this.oRouter.navigate(['admin/candidatura/view', oCandidatura.id]);
  }

  remove(oCandidatura: ICandidatura) {
    this.oRouter.navigate(['admin/candidatura/delete/', oCandidatura.id]);
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
