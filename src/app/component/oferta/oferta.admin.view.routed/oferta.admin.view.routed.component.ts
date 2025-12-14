import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { IOferta } from '../../../model/oferta.interface';
import { OfertaService } from '../../../service/oferta.service';
import { SessionService } from '../../../service/session.service';

@Component({
  selector: 'app-oferta.admin.view.routed',
  templateUrl: './oferta.admin.view.routed.component.html',
  styleUrls: ['./oferta.admin.view.routed.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class OfertaAdminViewRoutedComponent implements OnInit {
  id: number = 0;

  oOferta: IOferta = {
    id: 0,
    titulo: '',
    descripcion: '',
    empresa: {
      id: 0,
      nombre: '',
      email: '',
      sector: { id: 0, nombre: '', alumnos: 0, empresas: 0, ofertas: 0 },
      ofertas: 0,
    },
    sector: { id: 0, nombre: '', alumnos: 0, empresas: 0, ofertas: 0 },
    candidaturas: 0,
  };

  // roles
  isAdmin = false;
  isEmpresa = false;
  isAlumno = false;

  loading = true;

  constructor(
    private oActivatedRoute: ActivatedRoute,
    private oOfertaService: OfertaService,
    private oSessionService: SessionService,
    private oRouter: Router
  ) {}

  ngOnInit(): void {
    this.id = +this.oActivatedRoute.snapshot.params['id'];

    this.setRoleFromSession();

    this.oSessionService.onLogin().subscribe({
      next: () => this.setRoleFromSession(),
    });

    this.oSessionService.onLogout().subscribe({
      next: () => {
        this.isAdmin = this.isEmpresa = this.isAlumno = false;
      },
    });

    this.getOne();
  }

  private setRoleFromSession(): void {
    const tipo = (this.oSessionService.getSessionTipoUsuario() || '')
      .toLowerCase()
      .trim();

    this.isAdmin = tipo === 'admin' || tipo === 'administrador';
    this.isEmpresa = tipo === 'empresa';
    this.isAlumno = tipo === 'alumno';
  }

  private scrollToTop(): void {
    setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }), 0);
  }

  getOne(): void {
    this.loading = true;

    // en tu TS anterior era get(this.id); mantengo eso
    this.oOfertaService.get(this.id).subscribe({
      next: (data: IOferta) => {
        this.oOferta = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando la oferta:', err);
        this.loading = false;
      },
    });
  }

  // permisos
  get canSeeEmpresaEmail(): boolean {
    // alumno y admin sí; empresa no
    return this.isAlumno || this.isAdmin;
  }

  get canSeeEmpresaName(): boolean {
    // alumno y admin sí; empresa no (redundante)
    return this.isAlumno || this.isAdmin;
  }

  get canSeeOfertaId(): boolean {
    return this.isAdmin;
  }

  get canSeeCandidaturasBtn(): boolean {
    return this.isAdmin || this.isEmpresa;
  }

  // helpers UI
  empresaNombre(): string {
    return this.oOferta?.empresa?.nombre || 'Empresa';
  }

  ofertaTitulo(): string {
    return (this.oOferta?.titulo || '').trim() || 'Oferta';
  }

  initials(text: string): string {
    return (text || 'NA').substring(0, 2).toUpperCase();
  }

  // navegación
  goBack(): void {
    this.oRouter.navigate(['admin', 'oferta', 'plist']).then(() => this.scrollToTop());
  }

  goEmpresa(ev?: MouseEvent): void {
    if (ev) ev.stopPropagation();
    const idEmpresa = this.oOferta?.empresa?.id || 0;
    if (!idEmpresa) return;
    this.oRouter.navigate(['admin', 'empresa', 'view', idEmpresa]).then(() => this.scrollToTop());
  }

  goCandidaturas(ev?: MouseEvent): void {
    if (ev) ev.stopPropagation();
    if (!this.oOferta?.id) return;

    this.oRouter
      .navigate(['admin', 'candidatura', 'xoferta', 'plist', this.oOferta.id])
      .then(() => this.scrollToTop());
  }
}
