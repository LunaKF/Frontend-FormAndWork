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

  id = 0;
  loading = true;

  oOferta!: IOferta;

  // roles
  isAdmin = false;
  isEmpresa = false;
  isAlumno = false;

  // sesión
  userEmail = '';

  constructor(
    private oActivatedRoute: ActivatedRoute,
    private oOfertaService: OfertaService,
    private oSessionService: SessionService,
    private oRouter: Router
  ) {}

  ngOnInit(): void {
    this.id = +this.oActivatedRoute.snapshot.params['id'];

    this.setRoleFromSession();
    this.userEmail = (this.oSessionService.getSessionEmail() || '').toLowerCase();

    this.oSessionService.onLogin().subscribe(() => this.setRoleFromSession());
    this.oSessionService.onLogout().subscribe(() => {
      this.isAdmin = this.isEmpresa = this.isAlumno = false;
    });

    this.getOne();
  }

  private setRoleFromSession(): void {
    const tipo = (this.oSessionService.getSessionTipoUsuario() || '').toLowerCase().trim();
    this.isAdmin = tipo === 'admin' || tipo === 'administrador';
    this.isEmpresa = tipo === 'empresa';
    this.isAlumno = tipo === 'alumno';
  }

  getOne(): void {
    this.loading = true;

    this.oOfertaService.get(this.id).subscribe({
      next: (data: IOferta) => {
        this.oOferta = data;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  /* ===== PERMISOS ===== */

  get canSeeEmpresaEmail(): boolean {
    return this.isAlumno || this.isAdmin;
  }

  get canSeeEmpresaName(): boolean {
    return this.isAlumno || this.isAdmin;
  }

  get canSeeOfertaId(): boolean {
    return this.isAdmin;
  }

  get canSeeCandidaturasBtn(): boolean {
    return this.isAdmin || this.isEmpresa;
  }

  get canEditOferta(): boolean {
    if (this.isAdmin) return true;

    if (this.isEmpresa) {
      const ownerEmail = (this.oOferta?.empresa?.email || '').toLowerCase();
      return ownerEmail === this.userEmail;
    }

    return false;
  }

  /* ===== HELPERS ===== */

  empresaNombre(): string {
    return this.oOferta?.empresa?.nombre || 'Empresa';
  }

  ofertaTitulo(): string {
    return (this.oOferta?.titulo || '').trim() || 'Oferta';
  }

  initials(text: string): string {
    return (text || 'NA').substring(0, 2).toUpperCase();
  }

  /* ===== NAVEGACIÓN ===== */

  goBack(): void {
    this.oRouter.navigate(['admin', 'oferta', 'plist']);
  }

  goEmpresa(ev?: MouseEvent): void {
    if (ev) ev.stopPropagation();
    const idEmpresa = this.oOferta?.empresa?.id;
    if (!idEmpresa) return;
    this.oRouter.navigate(['admin', 'empresa', 'view', idEmpresa]);
  }

  goCandidaturas(ev?: MouseEvent): void {
    if (ev) ev.stopPropagation();
    this.oRouter.navigate(['admin', 'candidatura', 'xoferta', 'plist', this.oOferta.id]);
  }

  editOferta(): void {
    if (this.isAdmin) {
      this.oRouter.navigate(['admin', 'oferta', 'edit', this.oOferta.id]);
    } else if (this.isEmpresa) {
      this.oRouter.navigate(['empresa', 'oferta', 'edit', this.oOferta.id]);
    }
  }
}
