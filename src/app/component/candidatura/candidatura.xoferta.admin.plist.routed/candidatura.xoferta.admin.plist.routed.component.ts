import { Component, OnInit } from '@angular/core';
import { ICandidatura } from '../../../model/candidatura.interface';
import { CandidaturaService } from '../../../service/candidatura.service';
import { CommonModule } from '@angular/common';
import { IPage } from '../../../model/model.interface';
import { FormsModule } from '@angular/forms';
import { BotoneraService } from '../../../service/botonera.service';
import { debounceTime, Subject } from 'rxjs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IOferta } from '../../../model/oferta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { OfertaService } from '../../../service/oferta.service';


@Component({
  selector: 'app-candidatura.xoferta.admin.plist.routed',
  templateUrl: './candidatura.xoferta.admin.plist.routed.component.html',
  styleUrls: ['./candidatura.xoferta.admin.plist.routed.component.css'] ,
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})

export class CandidaturaXofertaAdminPlistRoutedComponent implements OnInit {

  oPage: IPage<ICandidatura> | null = null;
  oOferta: IOferta | null = null;
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
    private oRouter: Router,
    private oActivatedRoute: ActivatedRoute,
    private oOfertaService: OfertaService,

  ) {
    // obtener el id de la ruta del cliente
    this.oActivatedRoute.params.subscribe((params) => {

      this.oOfertaService.get(params['id']).subscribe({
        next: (oOferta: IOferta) => {
          this.oOferta = oOferta;  
          this.getPage(oOferta.id);
        },        
        error: (err: HttpErrorResponse) => {
          console.log(err);
        }
      });
    });
    this.debounceSubject.pipe(debounceTime(10)).subscribe((value) => {
      this.getPage(this.oOferta?.id);
    });
  }

  ngOnInit() {
   }
 
   getPage(id: number = 0) {
     this.oCandidaturaService
       .getPageXoferta(this.nPage, this.nRpp, this.strField, this.strDir, this.strFiltro, id) //tomar el id de la url del cliente
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
    //navegar a la página de edición
    this.oRouter.navigate(['admin/candidatura/edit', oCandidatura.id]);
  }

  view(oCandidatura: ICandidatura) {
    //navegar a la página de edición
    this.oRouter.navigate(['admin/candidatura/view', oCandidatura.id]);
  }

  remove(oCandidatura: ICandidatura) {
    this.oRouter.navigate(['admin/candidatura/delete/', oCandidatura.id]);
  }

  goToPage(p: number) {
    if (p) {
      this.nPage = p - 1;
      this.getPage ( this.oOferta?.id);
    }
    return false;
  }

  goToNext() {
    this.nPage++;
    this.getPage( this.oOferta?.id);
    return false;
  }

  goToPrev() {
    this.nPage--;
    this.getPage( this.oOferta?.id);
    return false;
  }

  sort(field: string) {
    this.strField = field;
    this.strDir = this.strDir === 'asc' ? 'desc' : 'asc';
    this.getPage(  this.oOferta?.id);
  }

  goToRpp(nrpp: number) {
    this.nPage = 0;
    this.nRpp = nrpp;
    this.getPage( this.oOferta?.id);
    return false;
  }

  filter(event: KeyboardEvent) {
    this.debounceSubject.next(this.strFiltro);
  }
}
