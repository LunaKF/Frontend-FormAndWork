import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { IAlumno } from '../../../model/alumno.interface';
import { AlumnoService } from '../../../service/alumno.service';
import { SessionService } from '../../../service/session.service';

@Component({
  selector: 'app-alumno.admin.view.routed',
  templateUrl: './alumno.admin.view.routed.component.html',
  styleUrls: ['./alumno.admin.view.routed.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class AlumnoAdminViewRoutedComponent implements OnInit {
  id: number = 0;

  oAlumno: IAlumno = {
    id: 0,
    nombre: '',
    ape1: '',
    ape2: '',
    email: '',
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
    private oAlumnoService: AlumnoService,
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
      next: () => (this.isAdmin = this.isEmpresa = this.isAlumno = false),
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

    this.oAlumnoService.getOne(this.id).subscribe({
      next: (data: IAlumno) => {
        this.oAlumno = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  // ====== PERMISOS ======
  get canSeeAlumnoId(): boolean {
    return this.isAdmin; // SOLO ADMIN
  }

  get canSeeCandidaturasBtn(): boolean {
    // ADMIN y EMPRESA (no alumno)
    return this.isAdmin || this.isEmpresa;
  }

  // ====== HELPERS UI ======
  fullName(): string {
    const parts = [this.oAlumno?.nombre, this.oAlumno?.ape1, this.oAlumno?.ape2].filter(Boolean);
    return parts.join(' ').trim() || 'Alumno';
  }

  initials(): string {
    const n = (this.oAlumno?.nombre || 'NA').trim();
    const a = (this.oAlumno?.ape1 || '').trim();
    const i1 = n ? n[0] : 'N';
    const i2 = a ? a[0] : (n.length > 1 ? n[1] : 'A');
    return (i1 + i2).toUpperCase();
  }

  // ====== NAV ======
  goBack(): void {
    this.oRouter.navigate(['admin', 'alumno', 'plist']).then(() => this.scrollToTop());
  }

  goCandidaturas(ev?: MouseEvent): void {
    ev?.stopPropagation();
    if (!this.oAlumno?.id) return;

    this.oRouter
      .navigate(['admin', 'candidatura', 'xalumno', 'plist', this.oAlumno.id])
      .then(() => this.scrollToTop());
  }

  edit(): void {
    if (!this.isAdmin) return;
    this.oRouter.navigate(['admin', 'alumno', 'edit', this.oAlumno.id]).then(() => this.scrollToTop());
  }

  remove(): void {
    if (!this.isAdmin) return;
    this.oRouter.navigate(['admin', 'alumno', 'delete', this.oAlumno.id]).then(() => this.scrollToTop());
  }
}
