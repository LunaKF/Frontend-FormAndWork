import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { ISector } from '../../../model/sector.interface';
import { SectorService } from '../../../service/sector.service';
import { SessionService } from '../../../service/session.service';

@Component({
  selector: 'app-sector.admin.plist.routed',
  standalone: true,
  templateUrl: './sector.admin.plist.routed.component.html',
  styleUrls: ['./sector.admin.plist.routed.component.css'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class SectorAdminPlistRoutedComponent implements OnInit {

  oSector: ISector[] = [];
  query = '';
  loading = true;

  // flags de rol
  isAdmin = false;
  isEmpresa = false;
  isAlumno = false;

  constructor(
    private sectorService: SectorService,
    private router: Router,
    private oSessionService: SessionService
  ) {}

  ngOnInit() {
    // rol desde sesión
    this.setRoleFromSession();

    // cambios de sesión en caliente
    this.oSessionService.onLogin().subscribe({ next: () => this.setRoleFromSession() });
    this.oSessionService.onLogout().subscribe({
      next: () => { this.isAdmin = this.isEmpresa = this.isAlumno = false; }
    });

    // si NO es admin → fuera (403 o home, como prefieras)
    if (!this.isAdmin) {
      this.router.navigate(['/forbidden']);
      return;
    }

    this.cargar();
  }

  private setRoleFromSession() {
    const tipo = (this.oSessionService.getSessionTipoUsuario() || '').toLowerCase().trim();
    this.isAdmin = (tipo === 'admin' || tipo === 'administrador');
    this.isEmpresa = (tipo === 'empresa');
    this.isAlumno = (tipo === 'alumno');
  }

  private cargar() {
    this.loading = true;
    this.sectorService.getAll().subscribe({
      next: (data: ISector[]) => {
        this.oSector = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener sectores:', err?.message || err);
        this.loading = false;
      }
    });
  }

  // Filtro simple
  get filtered(): ISector[] {
    const q = (this.query || '').toLowerCase().trim();
    if (!q) return this.oSector;
    return this.oSector.filter(s =>
      String(s.id).includes(q) ||
      (s.nombre || '').toLowerCase().includes(q)
    );
  }

  trackById = (_: number, item: ISector) => item.id;

  // Navegación a listados por sector (esto SÍ existe)
  goEmpresas(s: ISector, ev?: Event) {
    ev?.stopPropagation();
    if (!s.empresas || s.empresas <= 0) return;
    this.router.navigate(['/admin', 'empresa', 'xsector', 'plist', s.id]);
  }

  goAlumnos(s: ISector, ev?: Event) {
    ev?.stopPropagation();
    if (!s.alumnos || s.alumnos <= 0) return;
    this.router.navigate(['/admin', 'alumno', 'xsector', 'plist', s.id]);
  }

  goOfertas(s: ISector, ev?: Event) {
    ev?.stopPropagation();
    if (!s.ofertas || s.ofertas <= 0) return;
    this.router.navigate(['/admin', 'oferta', 'xsector', 'plist', s.id]);
  }
}
