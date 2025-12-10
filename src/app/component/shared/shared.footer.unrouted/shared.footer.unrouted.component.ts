import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { SessionService } from '../../../service/session.service';
import { NgIf, NgForOf } from '@angular/common';

@Component({
  selector: 'app-shared-footer-unrouted',
  templateUrl: './shared.footer.unrouted.component.html',
  styleUrls: ['./shared.footer.unrouted.component.css'],
  standalone: true,
  imports: [RouterLink, NgIf, NgForOf],
})
export class SharedFooterUnroutedComponent implements OnInit {
  currentUrl: string = '';
  activeSession: boolean = false;
  userEmail: string = '';

  // Rol y flags
  userRole: string = '';           // 'admin' | 'empresa' | 'alumno' | ''
  isAdmin: boolean = false;
  isEmpresa: boolean = false;
  isAlumno: boolean = false;

  // Enlaces principales del footer (modifícalos según tus rutas)
  mainLinks = [
    { label: 'Inicio', path: '/' },
    { label: 'Ofertas', path: '/ofertas' },
    { label: 'Empresas', path: '/admin/empresa/plist' },
    { label: 'Alumnos', path: '/admin/alumno/plist' },
  ];

  infoLinks = [
    { label: 'Sobre FormAndWork', path: '/' },
   // { label: 'Contacto', path: '/contacto' },
  ];

  legalLinks = [
    { label: 'Aviso legal', path: '/legal/aviso-legal' },
    { label: 'Política de privacidad', path: '/legal/privacidad' },
    { label: 'Cookies', path: '/legal/cookies' },
  ];

  constructor(
    private oRouter: Router,
    private oSessionService: SessionService
  ) {
    // track de ruta para marcar activos
    this.oRouter.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects || event.url;
      }
    });

    // estado inicial de sesión/rol
    this.activeSession = this.oSessionService.isSessionActive();
    if (this.activeSession) {
      this.userEmail = this.oSessionService.getSessionEmail();
      this.setRoleFromSession();
    }
  }

  ngOnInit(): void {
    this.oSessionService.onLogin().subscribe({
      next: () => {
        this.activeSession = true;
        this.userEmail = this.oSessionService.getSessionEmail();
        this.setRoleFromSession();
      },
    });

    this.oSessionService.onLogout().subscribe({
      next: () => {
        this.activeSession = false;
        this.userEmail = '';
        this.userRole = '';
        this.isAdmin = this.isEmpresa = this.isAlumno = false;
      },
    });
  }

  get currentYear(): number {
    return new Date().getFullYear();
  }

  // --- PRIVADO: lee el rol desde SessionService y setea flags
  private setRoleFromSession(): void {
    const tipo = (this.oSessionService.getSessionTipoUsuario() || '')
      .toLowerCase()
      .trim();

    this.userRole = tipo;
    this.isAdmin = tipo === 'admin' || tipo === 'administrador';
    this.isEmpresa = tipo === 'empresa';
    this.isAlumno = tipo === 'alumno';
  }

  isActive(path: string): boolean {
    // pequeño helper para marcar enlaces activos
    return this.currentUrl === path;
  }
}
