import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { ISector } from '../../../model/sector.interface';
import { IPage } from '../../../model/model.interface';
import { BotoneraService } from '../../../service/botonera.service';
import { SectorService } from '../../../service/sector.service';
import { TrimPipe } from "../../../pipe/trim.pipe";



@Component({
  selector: 'app-sector.admin.plist.routed',
  templateUrl: './sector.admin.plist.routed.component.html',
  styleUrls: ['./sector.admin.plist.routed.component.css'],
  standalone: true,
  imports: [TrimPipe, CommonModule, FormsModule, RouterModule],
})
export class SectorAdminPlistRoutedComponent implements OnInit {

  oPage: IPage<ISector> | null = null;
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
    private oSectorService: SectorService,
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
    this.oSectorService
      .getPage(this.nPage, this.nRpp, this.strField, this.strDir, this.strFiltro)
      .subscribe({
        next: (oPageFromServer: IPage<ISector>) => {
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

  edit(oSector: ISector) {
    this.oRouter.navigate(['sector', 'edit', oSector.id]);
  }

  remove(oSector: ISector) {
    this.oRouter.navigate(['sector', 'delete', oSector.id]);
  }


  view(oSector: ISector) {
    this.oRouter.navigate(['sector', 'view', oSector.id]);
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
