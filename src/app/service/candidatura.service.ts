import { Injectable } from '@angular/core';
import { ICandidatura } from '../model/candidatura.interface';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';
import { IPage } from '../model/model.interface';
import { httpOptions, serverURL } from '../enviroment/enviroment';

@Injectable({
  providedIn: 'root',
})
export class CandidaturaService {
  serverURL: string = serverURL + '/candidatura';

  constructor(private oHttp: HttpClient) { }

  getPage(
    page: number,
    size: number,
    field: string,
    dir: string,
    filtro: string
  ): Observable<IPage<ICandidatura>> {
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
    return this.oHttp.get<IPage<ICandidatura>>(URL, httpOptions);
  }

  getPageXoferta(
    page: number,
    size: number,
    field: string,
    dir: string,
    filtro: string,
    oferta: number
  ): Observable<IPage<ICandidatura>> {
    let URL: string = '';
    URL += this.serverURL + '/xoferta/' + oferta;
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
    return this.oHttp.get<IPage<ICandidatura>>(URL, httpOptions);
  }

  getPageXalumno(
    page: number,
    size: number,
    field: string,
    dir: string,
    filtro: string,
    alumno: number
  ): Observable<IPage<ICandidatura>> {
    let URL: string = '';
    URL += this.serverURL + '/xalumno/' + alumno;
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
    return this.oHttp.get<IPage<ICandidatura>>(URL, httpOptions);
  }

  get(id: number): Observable<ICandidatura> {
    let URL: string = '';
    URL += this.serverURL;
    URL += '/' + id;
    return this.oHttp.get<ICandidatura>(URL);
  }

  create(oCandidatura: ICandidatura): Observable<ICandidatura> {
    let URL: string = '';
    URL += this.serverURL;
    return this.oHttp.put<ICandidatura>(URL, oCandidatura);
  }

  update(oCandidatura: ICandidatura): Observable<ICandidatura> {
    let URL: string = '';
    URL += this.serverURL;
    return this.oHttp.put<ICandidatura>(URL, oCandidatura);
  }

  getOne(id: number): Observable<ICandidatura> {
    let URL: string = '';
    URL += this.serverURL;
    URL += '/' + id;
    return this.oHttp.get<ICandidatura>(URL);
  }

  delete(id: number) {
    return this.oHttp.delete(this.serverURL + '/' + id);
  }


}