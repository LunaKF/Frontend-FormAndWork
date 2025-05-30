import { Component, OnInit } from '@angular/core';
import { IEmpresa } from '../../../model/empresa.interface';
import { EmpresaService } from '../../../service/empresa.service';
import { CommonModule } from '@angular/common';
import { IPage } from '../../../model/model.interface';
import { FormsModule } from '@angular/forms';
import { BotoneraService } from '../../../service/botonera.service';
import { debounceTime, Subject } from 'rxjs';
import { TrimPipe } from '../../../pipe/trim.pipe';
import { SectorService } from '../../../service/sector.service';
import { ISector } from '../../../model/sector.interface';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';



@Component({
  selector: 'app-empresa-xsector-admin-plist',
  templateUrl: './empresa.xsector.admin.plist.routed.component.html',
  styleUrls: ['./empresa.xsector.admin.plist.routed.component.css'] ,
  standalone: true,
  imports: [CommonModule, FormsModule, TrimPipe, RouterModule],
})

export class EmpresaXsectorAdminPlistComponent implements OnInit {

  oPage: IPage<IEmpresa> | null = null;
  oSector: ISector | null = null;
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
    private oActivatedRoute: ActivatedRoute,
    private oSectorService: SectorService,
    private oRouter: Router
  ) {
    // obtener el id de la ruta del cliente
    this.oActivatedRoute.params.subscribe((params) => {

      this.oSectorService.get(params['id']).subscribe({
        next: (oSector: ISector) => {
          this.oSector = oSector;
          this.getPage(oSector.id);
        },
        error: (err: HttpErrorResponse) => {
          console.log(err);
        },
      });
    });

    this.debounceSubject.pipe(debounceTime(10)).subscribe((value) => {
      this.getPage(this.oSector?.id);
    });
  }

  ngOnInit() {
    this.getPage();
  }
  getPage(id: number = 0) {
    this.oEmpresaService
    .getPageXsector(this.nPage, this.nRpp, this.strField, this.strDir, this.strFiltro, id) //tomar el id de la url del cliente
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
      this.getPage( this.oSector?.id);
    }
    return false;
  }

  goToNext() {
    this.nPage++;
    this.getPage( this.oSector?.id);
    return false;
  }

  goToPrev() {
    this.nPage--;
    this.getPage( this.oSector?.id);
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
    this.getPage( this.oSector?.id);
    return false;
  }

  filter(event: KeyboardEvent) {
    this.debounceSubject.next(this.strFiltro);
  }
}
