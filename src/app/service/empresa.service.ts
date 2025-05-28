import { Injectable } from '@angular/core';
import { IEmpresa } from '../model/empresa.interface';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';
import { IPage } from '../model/model.interface';
import { httpOptions, serverURL } from '../enviroment/enviroment';

@Injectable({
  providedIn: 'root',
})
export class EmpresaService {
  serverURL: string = serverURL + '/empresa';

  constructor(private oHttp: HttpClient) { }

  getPage(
    page: number,
    size: number,
    field: string,
    dir: string,
    filtro: string
  ): Observable<IPage<IEmpresa>> {
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
    return this.oHttp.get<IPage<IEmpresa>>(URL, httpOptions);
  }

  
  getPageXsector(
    page: number,
    size: number,
    field: string,
    dir: string,
    filtro: string,
    sector: number
  ): Observable<IPage<IEmpresa>> {
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
    return this.oHttp.get<IPage<IEmpresa>>(URL, httpOptions);
  }

  getEmpresaByEmail(email: string): Observable<IEmpresa> {
    let URL: string = '';
    URL += this.serverURL + '/email/' + email;
    return this.oHttp.get<IEmpresa>(URL);
  }

  get(id: number): Observable<IEmpresa> {
    let URL: string = '';
    URL += this.serverURL;
    URL += '/' + id;
    return this.oHttp.get<IEmpresa>(URL);
  }

  create(oEmpresa: IEmpresa): Observable<IEmpresa> {
    let URL: string = '';
    URL += this.serverURL;
    return this.oHttp.put<IEmpresa>(URL, oEmpresa);
  }

  update(oEmpresa: IEmpresa): Observable<IEmpresa> {
    let URL: string = '';
    URL += this.serverURL;
    return this.oHttp.put<IEmpresa>(URL, oEmpresa);
  }

  getOne(id: number): Observable<IEmpresa> {
    let URL: string = '';
    URL += this.serverURL;
    URL += '/' + id;
    return this.oHttp.get<IEmpresa>(URL);
  }

  delete(id: number) {
    return this.oHttp.delete(this.serverURL + '/' + id);
  }

    getAll() {
      return this.oHttp.get<IEmpresa[]>(this.serverURL + '/all', httpOptions);
    }
  

    // getByEmail(email: string): Observable<IEmpresa> {

}