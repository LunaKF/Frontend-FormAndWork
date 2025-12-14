import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ICandidatura } from '../../../model/candidatura.interface';
import { CandidaturaService } from '../../../service/candidatura.service';
import { SessionService } from '../../../service/session.service';

@Component({
  selector: 'app-candidatura.admin.view.routed',
  templateUrl: './candidatura.admin.view.routed.component.html',
  styleUrls: ['./candidatura.admin.view.routed.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class CandidaturaAdminViewRoutedComponent implements OnInit {
  id: number = 0;

  oCandidatura: ICandidatura = {
    id: 0,
    alumno: {
      id: 0,
      nombre: '',
      ape1: '',
      ape2: '',
      email: '',
      sector: { id: 0, nombre: '', alumnos: 0, empresas: 0, ofertas: 0 },
      candidaturas: 0,
    },
    oferta: {
      id: 0,
      titulo: '',
      descripcion: '',
      empresa: {
        id: 0,
        nombre: '',
        email: '',
        ofertas: 0,
        sector: { id: 0, nombre: '', alumnos: 0, empresas: 0, ofertas: 0 },
      },
      sector: { id: 0, nombre: '', alumnos: 0, empresas: 0, ofertas: 0 },
      candidaturas: 0,
    },
    fecha: new Date(),
  };

  // roles
  isAdmin = false;
  isEmpresa = false;
  isAlumno = false;

  loading = true;

  constructor(
    private oActivatedRoute: ActivatedRoute,
    private oCandidaturaService: CandidaturaService,
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

    this.oCandidaturaService.getOne(this.id).subscribe({
      next: (data: ICandidatura) => {
        this.oCandidatura = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        // Opcional: volver al plist si falla
        // this.oRouter.navigate(['/admin/candidatura/plist']);
      },
    });
  }

  // ===== helpers de texto (bonito, sin IDs) =====
  alumnoNombre(): string {
    const a = this.oCandidatura?.alumno;
    return [a?.nombre, a?.ape1, a?.ape2].filter(Boolean).join(' ') || 'Alumno';
  }

  empresaNombre(): string {
    return this.oCandidatura?.oferta?.empresa?.nombre || 'Empresa';
  }

  ofertaTitulo(): string {
    const t = this.oCandidatura?.oferta?.titulo || '';
    return t.trim() || 'Oferta';
  }

  initials(text: string): string {
    return (text || 'NA').substring(0, 2).toUpperCase();
  }

  // ===== navegación =====
  goBack(): void {
    this.oRouter.navigate(['admin', 'candidatura', 'plist']).then(() => this.scrollToTop());
  }

  goAlumno(ev?: MouseEvent): void {
    if (ev) ev.stopPropagation();
    const idAlumno = this.oCandidatura?.alumno?.id || 0;
    if (!idAlumno) return;
    this.oRouter.navigate(['admin', 'alumno', 'view', idAlumno]).then(() => this.scrollToTop());
  }

  goOferta(ev?: MouseEvent): void {
    if (ev) ev.stopPropagation();
    const idOferta = this.oCandidatura?.oferta?.id || 0;
    if (!idOferta) return;
    this.oRouter.navigate(['admin', 'oferta', 'view', idOferta]).then(() => this.scrollToTop());
  }

  goEmpresa(ev?: MouseEvent): void {
    if (ev) ev.stopPropagation();
    const idEmpresa = this.oCandidatura?.oferta?.empresa?.id || 0;
    if (!idEmpresa) return;
    this.oRouter.navigate(['admin', 'empresa', 'view', idEmpresa]).then(() => this.scrollToTop());
  }

  // acciones
  edit(): void {
    if (!this.isAdmin) return;
    this.oRouter
      .navigate(['admin', 'candidatura', 'edit', this.oCandidatura.id])
      .then(() => this.scrollToTop());
  }

  remove(): void {
    // ✅ solo admin (empresa NO)
    if (!this.isAdmin) return;
    this.oRouter
      .navigate(['admin', 'candidatura', 'delete', this.oCandidatura.id])
      .then(() => this.scrollToTop());
  }
}
