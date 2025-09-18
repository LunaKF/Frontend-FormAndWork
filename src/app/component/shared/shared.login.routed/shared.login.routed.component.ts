import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../../service/login.service';
import { SessionService } from '../../../service/session.service';
import { CryptoService } from '../../../service/crypto.service';
import { environment } from '../../../enviroment/enviroment';
@Component({
  selector: 'app-shared.login.routed',
  templateUrl: './shared.login.routed.component.html',
  styleUrls: ['./shared.login.routed.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ]
})
export class SharedLoginRoutedComponent implements OnInit {
  errorMessage: string | null = null;
  showPassword: boolean = false;
  loginForm: FormGroup = new FormGroup({});
  activeSession: boolean = false;
  userEmail: string = '';
  production:boolean = false;



  constructor(
    private oLoginService: LoginService,
    private oSessionService: SessionService,
    private oRouter: Router,
    private oCryptoService: CryptoService
  ) {
    // take production from environment file
    this.production= environment.production;
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(5)])
    });


  }

  //para ver la contraseña
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  ngOnInit(): void {
    this.activeSession = this.oSessionService.isSessionActive();
    if (this.activeSession) {
      this.userEmail = this.oSessionService.getSessionEmail();
      
    }
   }

  onSubmit() {
    if (this.loginForm.valid) {
      const hashedPassword = this.oCryptoService.getHashSHA256(this.loginForm.value.password);
      this.oLoginService.login(this.loginForm.value.email, hashedPassword).subscribe({
        next: (token: string) => {
          console.log('Token recibido:', token);
          alert('Inicio de sesión exitoso');
          this.activeSession = true;
          this.userEmail = this.loginForm.value.email;
          this.oSessionService.login(token);
          this.oRouter.navigate(['/']);

          //let parsedToken: IJwt;
          //parsedToken = this.oSessionService.parseJwt(token);
          //console.log('Token parseado:', parsedToken);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al realizar la solicitud', error);
          alert('Correo o contraseña incorrectos');
          this.errorMessage = 'Correo o contraseña incorrectos';
        }
      });
    }
  }

  setLoginAdmin() {    
    this.loginForm.setValue({ email: "admin@ausias.es", password: "admin1234" });
  }

  setLoginEmpresa() {
    this.loginForm.setValue({email: "emailgre3849@gmail.com", password: "energy1234"})
  }

  setLoginAlumno() {
    this.loginForm.setValue({email: "emailLauraRodriguez9715@gmail.com", password: "luna1234"})
  }


}