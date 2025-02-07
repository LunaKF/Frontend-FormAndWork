import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { ISector } from '../model/sector.interface';
import { IPage } from '../model/model.interface';
import { httpOptions, serverURL } from '../enviroment/enviroment';


@Injectable({
  providedIn: 'root'
})
export class SectorService {

serverURL: string = serverURL + '/sector';

  constructor(private oHttp: HttpClient) {}

  getPage(
    page: number,
    size: number,
    field: string,
    dir: string,
    filtro: string
  ): Observable<IPage<ISector>> {
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
    return this.oHttp.get<IPage<ISector>>(URL, httpOptions);
  }

  get(id: number): Observable<ISector> {
    let URL: string = '';
    URL += this.serverURL;
    URL += '/' + id;
    return this.oHttp.get<ISector>(URL);
  }

  create(oTipoUsuario: ISector): Observable<ISector> {
    let URL: string = '';
    URL += this.serverURL;
    return this.oHttp.put<ISector>(URL, oTipoUsuario);
  }

  update(oTipoUsuario: ISector): Observable<ISector> {
    let URL: string = '';
    URL += this.serverURL;
    return this.oHttp.put<ISector>(URL, oTipoUsuario);
  }

  getOne(id: number): Observable<ISector> {
    let URL: string = '';
    URL += this.serverURL;
    URL += '/' + id;
    return this.oHttp.get<ISector>(URL);
  }

  delete(id: number) {
    return this.oHttp.delete(this.serverURL + '/' + id);
  }

  getPageSubcuenta(id: number){
    return this.oHttp.get<number>(this.serverURL + "/subcuenta/" + id);
  }


  getXBalance(id: number): Observable<ISector> {
    let URL: string = '';
    URL += this.serverURL;
    URL += '/xbalance/' + id;
    return this.oHttp.get<ISector>(URL);
  }


  getPageXBalance(
    page: number,
    size: number,
    id: number
  ): Observable<IPage<ISector>> {
    let URL: string = '';
    URL += this.serverURL;
    URL += '/xbalance/' + id;
    if (!page) {
      page = 0;
    }
    URL += '?page=' + page;
    if (!size) {
      size = 10;
    }
    URL += '&size=' + size;
    
    return this.oHttp.get<IPage<ISector>>(URL, httpOptions);
  }

  getPageXBalanceNoTiene(
    page: number,
    size: number,
    id: number
  ): Observable<IPage<ISector>> {
    let URL: string = '';
    URL += this.serverURL;
    URL += '/xbalancenotiene/' + id;
    if (!page) {
      page = 0;
    }
    URL += '?page=' + page;
    if (!size) {
      size = 10;
    }
    URL += '&size=' + size;
    
    return this.oHttp.get<IPage<ISector>>(URL, httpOptions);
  }
}