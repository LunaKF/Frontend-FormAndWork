import { Injectable } from '@angular/core';
import { IOferta } from '../model/oferta.interface';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';
import { IPage } from '../model/model.interface';
import { httpOptions, serverURL } from '../enviroment/enviroment';

@Injectable({
  providedIn: 'root',
})
export class OfertaService {
  serverURL: string = serverURL + '/oferta';

  constructor(private oHttp: HttpClient) { }

  getPage(
    page: number,
    size: number,
    field: string,
    dir: string,
    filtro: string
  ): Observable<IPage<IOferta>> {
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
    return this.oHttp.get<IPage<IOferta>>(URL, httpOptions);
  }

  getPageXsector(
    page: number,
    size: number,
    field: string,
    dir: string,
    filtro: string,
    sector: number
  ): Observable<IPage<IOferta>> {
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
    return this.oHttp.get<IPage<IOferta>>(URL, httpOptions);
  }



  getPageXempresa(
    page: number,
    size: number,
    field: string,
    dir: string,
    filtro: string,
    empresa: number
  ): Observable<IPage<IOferta>> {
    let URL: string = '';
    URL += this.serverURL + '/xempresa/' + empresa; 
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
    return this.oHttp.get<IPage<IOferta>>(URL, httpOptions);
  }


  get(id: number): Observable<IOferta> {
    let URL: string = '';
    URL += this.serverURL;
    URL += '/' + id;
    return this.oHttp.get<IOferta>(URL);
  }

  create(oOferta: IOferta): Observable<IOferta> {
    let URL: string = '';
    URL += this.serverURL;
    return this.oHttp.put<IOferta>(URL, oOferta);
  }

  update(oOferta: IOferta): Observable<IOferta> {
    let URL: string = '';
    URL += this.serverURL;
    return this.oHttp.put<IOferta>(URL, oOferta);
  }

  getOne(id: number): Observable<IOferta> {
    let URL: string = '';
    URL += this.serverURL;
    URL += '/' + id;
    return this.oHttp.get<IOferta>(URL);
  }

  delete(id: number) {
    return this.oHttp.delete(this.serverURL + '/' + id);
  }


}