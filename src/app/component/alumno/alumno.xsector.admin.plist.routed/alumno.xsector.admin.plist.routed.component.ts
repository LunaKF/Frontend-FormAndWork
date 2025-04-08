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


@Component({
  selector: 'app-alumno-xsector-admin-plist',
  templateUrl: './alumno.xsector.admin.plist.routed.component.html',
  styleUrls: ['./alumno.xsector.admin.plist.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TrimPipe, RouterModule],
})

export class AlumnoXsectorAdminPlistComponent implements OnInit {

  oPage: IPage<IAlumno> | null = null;
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
    private oAlumnoService: AlumnoService,
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
  }

  getPage(id: number = 0) {
    this.oAlumnoService
      .getPageXsector(this.nPage, this.nRpp, this.strField, this.strDir, this.strFiltro, id) //tomar el id de la url del cliente
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

  edit(oAlumno: IAlumno) {
    //navegar a la página de edición
    this.oRouter.navigate(['admin/alumno/edit', oAlumno.id]);
  }

  view(oAlumno: IAlumno) {
    //navegar a la página de edición
    this.oRouter.navigate(['admin/alumno/view', oAlumno.id]);
  }

  remove(oAlumno: IAlumno) {
    this.oRouter.navigate(['admin/alumno/delete/', oAlumno.id]);
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

