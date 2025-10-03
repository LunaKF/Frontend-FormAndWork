import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';

import { ICandidatura } from '../../../model/candidatura.interface';
import { IPage } from '../../../model/model.interface';
import { CandidaturaService } from '../../../service/candidatura.service';
import { BotoneraService } from '../../../service/botonera.service';
import { SessionService } from '../../../service/session.service';

@Component({
  selector: 'app-candidatura.admin.plist.routed',
  templateUrl: './candidatura.admin.plist.routed.component.html',
  styleUrls: ['./candidatura.admin.plist.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class CandidaturaAdminPlistRoutedComponent implements OnInit {

  // rol
  isAdmin = false;
  isEmpresa = false;
  isAlumno = false;

  // datos
  oPage: IPage<ICandidatura> | null = null;

  // paginación
  nPage = 0;      // 0-based
  nRpp = 10;

  // filtro
  strFiltro = '';
  private debounceSubject = new Subject<string>();

  // botonera
  arrBotonera: string[] = [];

  loading = true;

  constructor(
    private oCandidaturaService: CandidaturaService,
    private oBotoneraService: BotoneraService,
    private oRouter: Router,
    private oSessionService: SessionService
  ) {
    // Debounce REAL: reaccionamos a cambios del modelo (no keyup)
    this.debounceSubject.pipe(debounceTime(250)).subscribe(() => {
      this.nPage = 0; // al cambiar filtro, volvemos a página 1
      this.getPage();
    });
  }

  ngOnInit() {
    this.setRoleFromSession();
    this.oSessionService.onLogin().subscribe({ next: () => { this.setRoleFromSession(); this.getPage(); } });
    this.oSessionService.onLogout().subscribe({ next: () => { this.isAdmin = this.isEmpresa = this.isAlumno = false; this.getPage(); } });
    this.getPage();
  }

  private setRoleFromSession() {
    const tipo = (this.oSessionService.getSessionTipoUsuario() || '').toLowerCase().trim();
    this.isAdmin = (tipo === 'admin' || tipo === 'administrador');
    this.isEmpresa = (tipo === 'empresa');
    this.isAlumno = (tipo === 'alumno');
  }

  /** ===== Carga de datos desde backend ===== */
  getPage() {
    this.loading = true;
    // Normalizamos el filtro (evita falsos negativos)
    const q = this.strFiltro.trim();
    this.oCandidaturaService
      .getPage(this.nPage, this.nRpp, '', '', q)
      .subscribe({
        next: (oPageFromServer: IPage<ICandidatura>) => {
          this.oPage = oPageFromServer;
          this.arrBotonera = this.oBotoneraService.getBotonera(this.nPage, oPageFromServer.totalPages);
          this.loading = false;
        },
        error: (err) => { console.error(err); this.loading = false; },
      });
  }

  /** ===== Filtro en cliente (refuerzo) =====
   * Si el backend no filtra bien, aplicamos un filtro "suave"
   * sobre la página actual para que el usuario vea lo que espera.
   * - No rompe paginación del servidor porque solo actúa sobre el contenido de la página.
   */
  private matches(c: ICandidatura, q: string): boolean {
    if (!q) return true;
    const qq = q.toLowerCase();
    const campos = [
      String(c.id || '').toLowerCase(),
      String(c.oferta?.id || '').toLowerCase(),
      (c.oferta?.titulo || '').toLowerCase(),
      (c.alumno?.nombre || '').toLowerCase(),
      (c.alumno?.ape1 || '').toLowerCase(),
      (c.alumno?.ape2 || '').toLowerCase(),
      String(c.fecha || '').toLowerCase(),
    ];
    return campos.some(v => v.includes(qq));
  }

  /** Filas mostradas en tabla (admin/alumno) */
  get displayedRows(): ICandidatura[] {
    const items = this.oPage?.content || [];
    const q = this.strFiltro.trim();
    // si el filtro tiene 0-1 caracteres, no filtramos en cliente (evita "doble filtro")
    if (q.length <= 1) return items;
    return items.filter(c => this.matches(c, q));
  }

  /** Conteos para chips */
  get displayedCount(): number {
    if (!this.oPage) return 0;
    // Empresa (agrupada) cuenta ítems filtrados dentro de los grupos
    if (this.isEmpresa && !this.isAdmin) {
      return this.groupsByOferta.reduce((acc, g) => acc + g.items.length, 0);
    }
    // Admin/Alumno: cuenta filas de tabla que realmente mostramos
    return this.displayedRows.length;
  }
  get totalCount(): number {
    return this.oPage?.totalElements || 0;
  }

  /** Longitud segura del filtro para el template */
  get filterLen(): number { return (this.strFiltro || '').trim().length; }

  /** ===== Agrupación por oferta (EMPRESA) con refuerzo de filtro en cliente ===== */
  get groupsByOferta() {
    const src = this.oPage?.content || [];
    const q = this.strFiltro.trim();
    const items = (q.length <= 1) ? src : src.filter(c => this.matches(c, q));

    const map = new Map<number, { ofertaId: number; ofertaTitulo: string; items: ICandidatura[] }>();
    for (const c of items) {
      const id = c?.oferta?.id || 0;
      const titulo = (c?.oferta?.titulo || '').trim();
      if (!map.has(id)) map.set(id, { ofertaId: id, ofertaTitulo: titulo, items: [] });
      map.get(id)!.items.push(c);
    }
    return Array.from(map.values());
  }

  hasMultiplePages(): boolean {
    return (this.oPage?.totalPages || 0) > 1;
  }

  /** ===== Navegación ===== */
  view(c: ICandidatura) { this.oRouter.navigate(['admin/candidatura/view', c.id]); }
  edit(c: ICandidatura) { if (this.isAdmin) this.oRouter.navigate(['admin/candidatura/edit', c.id]); }
  remove(c: ICandidatura) {
    // Admin o Alumno pueden eliminar (según tu regla)
    if (this.isAdmin || this.isAlumno) this.oRouter.navigate(['admin/candidatura/delete', c.id]);
  }

  goToPage(p: number) {
    if (!p) return false;
    const target = p - 1;
    const totalPages = this.oPage?.totalPages || 0;
    if (target < 0 || (totalPages > 0 && target >= totalPages)) return false;
    this.nPage = target;
    this.getPage();
    return false;
  }
  goToNext() {
    const totalPages = this.oPage?.totalPages || 0;
    if (totalPages === 0) return false;
    if (this.nPage + 1 < totalPages) {
      this.nPage++;
      this.getPage();
    }
    return false;
  }
  goToPrev() {
    if (this.nPage > 0) {
      this.nPage--;
      this.getPage();
    }
    return false;
  }

  goToRpp(nrpp: number) {
    this.nPage = 0;
    this.nRpp = nrpp;
    this.getPage();
    return false;
  }

  /** Cambios en el input del filtro (debounced) */
  onFilterChange(value: string) {
    this.strFiltro = value ?? '';
    this.debounceSubject.next(this.strFiltro);
  }
}
