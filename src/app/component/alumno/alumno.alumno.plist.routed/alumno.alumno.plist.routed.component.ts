import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { TrimPipe } from '../../../pipe/trim.pipe';
import { IPage } from '../../../model/model.interface';
import { IAlumno } from '../../../model/alumno.interface';
import { AlumnoService } from '../../../service/alumno.service';
import { BotoneraService } from '../../../service/botonera.service';


@Component({
  selector: 'app-alumno.alumno.plist',
  templateUrl: './alumno.alumno.plist.routed.component.html',
  styleUrls: ['./alumno.alumno.plist.routed.component.css'],
  standalone: true,
    imports: [CommonModule, FormsModule, TrimPipe, RouterModule],
  })

export class AlumnoAlumnoPlistComponent implements OnInit {

oPage: IPage<IAlumno> | null = null;
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
      private oAlumnoService: AlumnoService,
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
       this.oAlumnoService
         .getPage(this.nPage, this.nRpp, this.strField, this.strDir, this.strFiltro)
         .subscribe({
           next: (oPageFromServer: IPage<IAlumno>) => {
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
   
     view(oAlumno: IAlumno) {
       this.oRouter.navigate(['admin/alumno/view', oAlumno.id]);
     }

     //EN EDICION:
     incribirse(oAlumno: IAlumno) {
      this.oRouter.navigate(['alumno/alumno/incribirse', oAlumno.id]);
     }  
     //
     
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
   
