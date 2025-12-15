import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ICandidatura } from '../../../model/candidatura.interface';
import { CandidaturaService } from '../../../service/candidatura.service';
import { SessionService } from '../../../service/session.service';

declare let bootstrap: any;

@Component({
  selector: 'app-candidatura.admin.delete.routed',
  templateUrl: './candidatura.admin.delete.routed.component.html',
  styleUrls: ['./candidatura.admin.delete.routed.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class CandidaturaAdminDeleteRoutedComponent implements OnInit {
  oCandidatura: ICandidatura | null = null;

  loading = true;
  deleting = false;

  strMessage = '';
  myModal: any;

  // roles
  isAdmin = false;
  isAlumno = false;

  constructor(
    private oCandidaturaService: CandidaturaService,
    private oActivatedRoute: ActivatedRoute,
    private oRouter: Router,
    private oSessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.setRoleFromSession();

    const id = Number(this.oActivatedRoute.snapshot.params['id']);
    if (!id) {
      this.loading = false;
      this.showModal('ID de candidatura inválido');
      return;
    }

    this.oCandidaturaService.get(id).subscribe({
      next: (oCandidatura: ICandidatura) => {
        this.oCandidatura = oCandidatura;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showModal('Error al cargar los datos de la candidatura');
      },
    });
  }

  private setRoleFromSession(): void {
    const tipo = (this.oSessionService.getSessionTipoUsuario() || '')
      .toLowerCase()
      .trim();

    this.isAdmin = tipo === 'admin' || tipo === 'administrador';
    this.isAlumno = tipo === 'alumno';
  }

  // ====== acciones navegación útiles ======
  goToOferta(): void {
    if (!this.oCandidatura?.oferta?.id) return;
    this.oRouter.navigate(['admin', 'oferta', 'view', this.oCandidatura.oferta.id]);
  }

  goToEmpresa(): void {
    if (!this.oCandidatura?.oferta?.empresa?.id) return;
    this.oRouter.navigate(['admin', 'empresa', 'view', this.oCandidatura.oferta.empresa.id]);
  }

  // ====== borrar ======
  delete(): void {
    if (!this.oCandidatura || this.deleting) return;

    // en teoría solo admin+alumno llegan aquí, pero por si acaso:
    if (!this.isAdmin && !this.isAlumno) return;

    this.deleting = true;

    this.oCandidaturaService.delete(this.oCandidatura.id).subscribe({
      next: () => {
        this.deleting = false;
        this.showModal(`Candidatura #${this.oCandidatura!.id} eliminada correctamente`);
      },
      error: () => {
        this.deleting = false;
        this.showModal('Error al borrar la candidatura');
      },
    });
  }

  // ====== modal ======
  showModal(mensaje: string): void {
    this.strMessage = mensaje;
    setTimeout(() => {
      const el = document.getElementById('mimodal');
      if (!el) return;
      this.myModal = new bootstrap.Modal(el, { keyboard: false });
      this.myModal.show();
    });
  }

  hideModal = (): void => {
    try {
      this.myModal?.hide();
    } catch {}

    // ruta distinta según rol (así es más cómodo)
    if (this.isAlumno && this.oCandidatura?.alumno?.id) {
      // si tienes un plist de "mis candidaturas" úsalo aquí:
      // this.oRouter.navigate(['admin', 'candidatura', 'xalumno', 'plist', this.oCandidatura.alumno.id]);
      this.oRouter.navigate(['/admin/candidatura/plist']);
      return;
    }

    this.oRouter.navigate(['/admin/candidatura/plist']);
  };

  // helper texto
  fullName(a: any): string {
    const parts = [a?.nombre, a?.ape1, a?.ape2].filter(Boolean);
    return parts.join(' ');
  }
}
