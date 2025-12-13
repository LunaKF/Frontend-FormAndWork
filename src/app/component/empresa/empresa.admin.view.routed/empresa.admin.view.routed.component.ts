import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { IEmpresa } from "../../../model/empresa.interface";
import { EmpresaService } from "../../../service/empresa.service";
import { SessionService } from '../../../service/session.service';

@Component({
  selector: 'app-empresa.admin.view.routed',
  templateUrl: './empresa.admin.view.routed.component.html',
  styleUrls: ['./empresa.admin.view.routed.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class EmpresaAdminViewRoutedComponent implements OnInit {

  id: number = 0;
  route: string = '';
  oEmpresa: IEmpresa = {
    id: 0,
    nombre: '',
    email: '',
    sector: { id: 0, nombre: '', alumnos: 0, empresas: 0, ofertas: 0 },
    ofertas: 0
  };

  // roles
  isAdmin = false;
  isEmpresa = false;
  isAlumno = false;

  loading = true;

  constructor(
    private oActivatedRoute: ActivatedRoute,
    private oEmpresaService: EmpresaService,
    private oSessionService: SessionService,
    private oRouter: Router
  ) {}

  ngOnInit() {
    this.id = this.oActivatedRoute.snapshot.params['id'];

    // rol inicial
    const tipo = (this.oSessionService.getSessionTipoUsuario() || '')
      .toLowerCase()
      .trim();
    this.isAdmin = (tipo === 'admin' || tipo === 'administrador');
    this.isEmpresa = (tipo === 'empresa');
    this.isAlumno = (tipo === 'alumno');

    // por si cambia la sesión en caliente
    this.oSessionService.onLogin().subscribe({
      next: () => {
        const t = (this.oSessionService.getSessionTipoUsuario() || '')
          .toLowerCase()
          .trim();
        this.isAdmin = (t === 'admin' || t === 'administrador');
        this.isEmpresa = (t === 'empresa');
        this.isAlumno = (t === 'alumno');
      }
    });

    this.oSessionService.onLogout().subscribe({
      next: () => {
        this.isAdmin = this.isEmpresa = this.isAlumno = false;
      }
    });

    this.getOne();
  }

  getOne() {
    this.loading = true;

    this.oEmpresaService.getOne(this.id).subscribe({
      next: (data: IEmpresa) => {
        this.oEmpresa = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        // si quieres, puedes redirigir:
        // this.oRouter.navigate(['/admin/empresa/plist']);
      }
    });
  }
}
