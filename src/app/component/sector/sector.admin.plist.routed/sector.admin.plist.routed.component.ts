import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { ISector } from '../../../model/sector.interface';
import { SectorService } from '../../../service/sector.service';
import { SessionService } from '../../../service/session.service'; // ⬅️ NUEVO

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

  // flags de rol (como en tu SharedMenuUnroutedComponent)
  isAdmin = false;
  isEmpresa = false;
  isAlumno = false;

  constructor(
    private sectorService: SectorService,
    private router: Router,
    private oSessionService: SessionService      // ⬅️ NUEVO
  ) {}

  ngOnInit() {
    // rol desde la sesión (misma fuente de verdad que tu menú)
    this.setRoleFromSession();

    // si el rol cambia en caliente:
    this.oSessionService.onLogin().subscribe({ next: () => this.setRoleFromSession() });
    this.oSessionService.onLogout().subscribe({ next: () => {
      this.isAdmin = this.isEmpresa = this.isAlumno = false;
    }});

    this.cargar();
  }

  private setRoleFromSession() {
    const tipo = (this.oSessionService.getSessionTipoUsuario() || '').toLowerCase().trim();
    this.isAdmin   = (tipo === 'admin' || tipo === 'administrador');
    this.isEmpresa = (tipo === 'empresa');
    this.isAlumno  = (tipo === 'alumno');
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

  // Navegación
  view(s: ISector)  { this.router.navigate(['sector','view',  s.id]); }
  edit(s: ISector)  { if (this.isAdmin) this.router.navigate(['sector','edit',  s.id]); }
  remove(s: ISector){ if (this.isAdmin) this.router.navigate(['sector','delete',s.id]); }
  create()          { if (this.isAdmin) this.router.navigate(['sector','new']); }
}
