import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { ISector } from '../../../model/sector.interface';
import { SectorService } from '../../../service/sector.service';

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

  // ⚠️ Sustituye esto por tu AuthService cuando lo tengas.
  // Por ejemplo, leyendo del token o de un servicio global.
  isAdmin = this.readIsAdmin();

  constructor(
    private sectorService: SectorService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargar();
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

  // Filtro simple en cliente
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
  view(s: ISector)  { this.router.navigate(['sector', 'view',  s.id]); }
  edit(s: ISector)  { if (this.isAdmin) this.router.navigate(['sector', 'edit',  s.id]); }
  remove(s: ISector){ if (this.isAdmin) this.router.navigate(['sector', 'delete', s.id]); }
  create()          { if (this.isAdmin) this.router.navigate(['sector', 'new']); }

  // Simulación muy básica: cambia por tu lógica real
  private readIsAdmin(): boolean {
    // ejemplo: si guardas el rol en localStorage
    const role = (localStorage.getItem('role') || '').toLowerCase();
    return role === 'admin';
  }
}
