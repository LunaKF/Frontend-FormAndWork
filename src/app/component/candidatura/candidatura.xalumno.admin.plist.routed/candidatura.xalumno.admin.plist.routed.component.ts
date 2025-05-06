import { Component, OnInit } from '@angular/core';
import { ICandidatura } from '../../../model/candidatura.interface';
import { CandidaturaService } from '../../../service/candidatura.service';
import { CommonModule } from '@angular/common';
import { IPage } from '../../../model/model.interface';
import { FormsModule } from '@angular/forms';
import { BotoneraService } from '../../../service/botonera.service';
import { debounceTime, Subject } from 'rxjs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlumnoService } from '../../../service/alumno.service';
import { IAlumno } from '../../../model/alumno.interface';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-candidatura.xalumno.admin.plist.routed',
  templateUrl: './candidatura.xalumno.admin.plist.routed.component.html',
  styleUrls: ['./candidatura.xalumno.admin.plist.routed.component.css'] ,
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})

export class CandidaturaXalumnoAdminPlistRoutedComponent implements OnInit {

  oPage: IPage<ICandidatura> | null = null;
    oAlumno: IAlumno | null = null;
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
    private oAlumnoService: AlumnoService,
  
    ) {
      // obtener el id de la ruta del cliente
      this.oActivatedRoute.params.subscribe((params) => {
  
        this.oAlumnoService.get(params['id']).subscribe({
          next: (oAlumno: IAlumno) => {
            this.oAlumno = oAlumno;  
            this.getPage(oAlumno.id);
          },        
          error: (err: HttpErrorResponse) => {
            console.log(err);
          }
        });
      });
      this.debounceSubject.pipe(debounceTime(10)).subscribe((value) => {
        this.getPage(this.oAlumno?.id);
      });
    }
  

  ngOnInit() {
  }

  getPage(id: number = 0) {
    this.oCandidaturaService
      .getPageXalumno(this.nPage, this.nRpp, this.strField, this.strDir, this.strFiltro, id) //tomar el id de la url del cliente
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
