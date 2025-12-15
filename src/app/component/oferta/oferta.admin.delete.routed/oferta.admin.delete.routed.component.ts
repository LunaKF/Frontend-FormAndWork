import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { IOferta } from '../../../model/oferta.interface';
import { OfertaService } from '../../../service/oferta.service';
import { SessionService } from '../../../service/session.service';

declare let bootstrap: any;

@Component({
  selector: 'app-oferta.admin.delete.routed',
  templateUrl: './oferta.admin.delete.routed.component.html',
  styleUrls: ['./oferta.admin.delete.routed.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class OfertaAdminDeleteRoutedComponent implements OnInit {
  oOferta: IOferta | null = null;

  loading = true;
  deleting = false;

  strMessage = '';
  myModal: any;

  // roles
  isAdmin = false;
  isEmpresa = false;
  isAlumno = false;

  constructor(
    private oOfertaService: OfertaService,
    private oActivatedRoute: ActivatedRoute,
    private oRouter: Router,
    private oSessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.setRoleFromSession();

    const id = Number(this.oActivatedRoute.snapshot.params['id']);
    if (!id) {
      this.loading = false;
      this.showModal('ID de oferta inválido');
      return;
    }

    this.oOfertaService.get(id).subscribe({
      next: (oOferta: IOferta) => {
        this.oOferta = oOferta;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showModal('Error al cargar los datos de la oferta');
      },
    });
  }

  private setRoleFromSession(): void {
    const tipo = (this.oSessionService.getSessionTipoUsuario() || '')
      .toLowerCase()
      .trim();

    this.isAdmin = tipo === 'admin' || tipo === 'administrador';
    this.isEmpresa = tipo === 'empresa';
    this.isAlumno = tipo === 'alumno';
  }

  // ========= ACCIONES =========

  goCandidaturas(): void {
    if (!this.oOferta) return;
    this.oRouter.navigate([
      'admin',
      'candidatura',
      'xoferta',
      'plist',
      this.oOferta.id,
    ]);
  }

  goEmpresa(): void {
    if (!this.oOferta?.empresa) return;
    this.oRouter.navigate([
      'admin',
      'empresa',
      'view',
      this.oOferta.empresa.id,
    ]);
  }

  delete(): void {
    if (!this.oOferta || this.deleting || this.isAlumno) return;

    this.deleting = true;

    this.oOfertaService.delete(this.oOferta.id).subscribe({
      next: () => {
        this.deleting = false;
        this.showModal(
          `La oferta "${this.oOferta!.titulo}" ha sido borrada correctamente`
        );
      },
      error: () => {
        this.deleting = false;
        this.showModal('Error al borrar la oferta');
      },
    });
  }

  // ========= MODAL =========

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
    this.oRouter.navigate(['/admin/oferta/plist']);
  };
}
