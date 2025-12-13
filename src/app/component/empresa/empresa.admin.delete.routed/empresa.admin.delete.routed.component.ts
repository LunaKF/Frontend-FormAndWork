import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { IEmpresa } from '../../../model/empresa.interface';
import { EmpresaService } from '../../../service/empresa.service';
import { SessionService } from '../../../service/session.service';

declare let bootstrap: any;

@Component({
  selector: 'app-empresa.admin.delete.routed',
  templateUrl: './empresa.admin.delete.routed.component.html',
  styleUrls: ['./empresa.admin.delete.routed.component.css'],
  standalone: true,
  imports: [RouterModule, CommonModule],
})
export class EmpresaAdminDeleteRoutedComponent implements OnInit {
  oEmpresa: IEmpresa | null = null;
  strMessage: string = '';
  myModal: any;

  // roles (mismo patrón que edit/create)
  isAdmin = false;
  isEmpresa = false;
  isAlumno = false;

  loading = true;

  constructor(
    private oEmpresaService: EmpresaService,
    private oActivatedRoute: ActivatedRoute,
    private oRouter: Router,
    private oSessionService: SessionService
  ) {}

  ngOnInit(): void {
    // rol inicial
    const tipo = (this.oSessionService.getSessionTipoUsuario() || '')
      .toLowerCase()
      .trim();
    this.isAdmin = tipo === 'admin' || tipo === 'administrador';
    this.isEmpresa = tipo === 'empresa';
    this.isAlumno = tipo === 'alumno';

    // por si cambia la sesión en caliente
    this.oSessionService.onLogin().subscribe({
      next: () => {
        const t = (this.oSessionService.getSessionTipoUsuario() || '')
          .toLowerCase()
          .trim();
        this.isAdmin = t === 'admin' || t === 'administrador';
        this.isEmpresa = t === 'empresa';
        this.isAlumno = t === 'alumno';
      },
    });

    this.oSessionService.onLogout().subscribe({
      next: () => {
        this.isAdmin = this.isEmpresa = this.isAlumno = false;
      },
    });

    // cargar empresa
    const id = this.oActivatedRoute.snapshot.params['id'];
    this.loading = true;

    this.oEmpresaService.get(id).subscribe({
      next: (oEmpresa: IEmpresa) => {
        this.oEmpresa = oEmpresa;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showModal('Error al cargar los datos de la empresa');
      },
    });
  }

  showModal(mensaje: string) {
    this.strMessage = mensaje;

    const el = document.getElementById('mimodal');
    if (!el) {
      console.error('No se encontró el modal #mimodal');
      return;
    }

    this.myModal = new bootstrap.Modal(el, { keyboard: false });
    this.myModal.show();
  }

  delete(): void {
    if (!this.oEmpresa?.id) {
      this.showModal('No se puede borrar: empresa no cargada');
      return;
    }

    this.oEmpresaService.delete(this.oEmpresa.id).subscribe({
      next: () => {
        this.showModal('Empresa con id ' + this.oEmpresa!.id + ' ha sido borrado');
      },
      error: () => {
        this.showModal('Error al borrar la empresa');
      },
    });
  }

  hideModal = () => {
    this.myModal?.hide();
    this.oRouter.navigate(['/admin/empresa/plist']);
  };
}
