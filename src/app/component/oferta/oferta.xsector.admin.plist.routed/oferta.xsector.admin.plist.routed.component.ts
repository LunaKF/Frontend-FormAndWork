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


@Component({
  selector: 'app-oferta.xsector.admin.plist.routed',
  templateUrl: './oferta.xsector.admin.plist.routed.component.html',
  styleUrls: ['./oferta.xsector.admin.plist.routed.component.css'] ,
  standalone: true,
  imports: [CommonModule, FormsModule, TrimPipe, RouterModule],
})

export class OfertaXsectorAdminPlistRoutedComponent implements OnInit {
   
  oPage: IPage<IOferta> | null = null;
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
      private oOfertaService: OfertaService,
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
            console.log();
          },
        });
      });
  
      this.debounceSubject.pipe(debounceTime(10)).subscribe((value) => {
        this.getPage(this.oSector?.id);
      });
    }
  
 ngOnInit() {
  }

  getPage(id: number = 0) {
    this.oOfertaService
      .getPageXsector(this.nPage, this.nRpp, this.strField, this.strDir, this.strFiltro, id)
      .subscribe({
        next: (oPageFromServer: IPage<IOferta>) => {
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

  edit(oOferta: IOferta) {
    //navegar a la página de edición
    this.oRouter.navigate(['admin/oferta/edit', oOferta.id]);
  }

  view(oOferta: IOferta) {
    //navegar a la página de edición
    this.oRouter.navigate(['admin/oferta/view', oOferta.id]);
  }

  remove(oOferta: IOferta) {
    this.oRouter.navigate(['admin/oferta/delete/', oOferta.id]);
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
    this.getPage( this.oSector?.id);
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
