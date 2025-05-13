import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { serverURL } from '../enviroment/enviroment';


@Injectable({
  providedIn: 'root'
})

export class LoginService {

  serverURL: string = serverURL + '/auth';

  constructor(private oHttp: HttpClient) { }

  login(email: string, password: string): Observable<string> {
    const loginData = { email: email, password: password };
    return this.oHttp.post<string>(this.serverURL + '/login', loginData);
  }
}