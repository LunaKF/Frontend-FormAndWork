import { Injectable } from '@angular/core';
import { IAlumno } from '../model/alumno.interface';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';
import { IPage } from '../model/model.interface';
import { httpOptions, serverURL } from '../enviroment/enviroment';
import { empty } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AlumnoService {
  serverURL: string = serverURL + '/alumno';

  constructor(private oHttp: HttpClient) { }

  getPage(
    page: number,
    size: number,
    field: string,
    dir: string,
    filtro: string
  ): Observable<IPage<IAlumno>> {
    let URL: string = '';
    URL += this.serverURL;
    if (!page) {
      page = 0;
    }
    URL += '?page=' + page;
    if (!size) {
      size = 10;
    }
    URL += '&size=' + size;
    if (field) {
      URL += '&sort=' + field;
      if (dir === 'asc') {
        URL += ',asc';
      } else {
        URL += ',desc';
      }
    }
    if (filtro) {
      URL += '&filter=' + filtro;
    }
    return this.oHttp.get<IPage<IAlumno>>(URL, httpOptions);
  }


  getPageXsector(
    page: number,
    size: number,
    field: string,
    dir: string,
    filtro: string,
    sector: number
  ): Observable<IPage<IAlumno>> {
    let URL: string = '';
    URL += this.serverURL + '/xsector/' + sector;
    if (!page) {
      page = 0;
    }
    URL += '?page=' + page;
    if (!size) {
      size = 10;
    }
    URL += '&size=' + size;
    if (field) {
      URL += '&sort=' + field;
      if (dir === 'asc') {
        URL += ',asc';
      } else {
        URL += ',desc';
      }
    }
    if (filtro) {
      URL += '&filter=' + filtro;
    }
    return this.oHttp.get<IPage<IAlumno>>(URL, httpOptions);
  }


  get(id: number): Observable<IAlumno> {
    let URL: string = '';
    URL += this.serverURL;
    URL += '/' + id;
    return this.oHttp.get<IAlumno>(URL);
  }

  create(oAlumno: IAlumno): Observable<IAlumno> {
    let URL: string = '';
    URL += this.serverURL;
    return this.oHttp.put<IAlumno>(URL, oAlumno);
  }

  update(oAlumno: IAlumno): Observable<IAlumno> {
    let URL: string = '';
    URL += this.serverURL;
    return this.oHttp.put<IAlumno>(URL, oAlumno);
  }

  getOne(id: number): Observable<IAlumno> {
    let URL: string = '';
    URL += this.serverURL;
    URL += '/' + id;
    return this.oHttp.get<IAlumno>(URL);
  }

  delete(id: number) {
    return this.oHttp.delete(this.serverURL + '/' + id);
  }


}