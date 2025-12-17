import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

import { CandidaturaService } from '../../../service/candidatura.service';
import { AlumnoService } from '../../../service/alumno.service';
import { OfertaService } from '../../../service/oferta.service';
import { SessionService } from '../../../service/session.service';

import { ICandidatura } from '../../../model/candidatura.interface';
import { IAlumno } from '../../../model/alumno.interface';
import { IOferta } from '../../../model/oferta.interface';

declare let bootstrap: any;

@Component({
  selector: 'app-candidatura.admin.create.routed',
  templateUrl: './candidatura.admin.create.routed.component.html',
  styleUrls: ['./candidatura.admin.create.routed.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatInputModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
})
export class CandidaturaAdminCreateRoutedComponent implements OnInit {

  // roles
  isAdmin = false;
  isEmpresa = false;
  isAlumno = false;

  // data
  alumnos: IAlumno[] = [];
  ofertas: IOferta[] = [];

  // UI
  loading = false;
  loadingData = true;
  strMessage = '';
  myModal: any;

  // filtros (buscador)
  alumnoFilter = new FormControl<string>('', { nonNullable: true });
  ofertaFilter = new FormControl<string>('', { nonNullable: true });

  // listas filtradas
  alumnosView: IAlumno[] = [];
  ofertasView: IOferta[] = [];

  // preview
  alumnoSel: IAlumno | null = null;
  ofertaSel: IOferta | null = null;

  // form
  oCandidaturaForm = new FormGroup({
    alumnoId: new FormControl<number | null>(null, Validators.required),
    ofertaId: new FormControl<number | null>(null, Validators.required),
  });

  constructor(
    private oCandidaturaService: CandidaturaService,
    private oAlumnoService: AlumnoService,
    private oOfertaService: OfertaService,
    private oSessionService: SessionService,
    private oRouter: Router
  ) {
    this.setRoleFromSession();
  }

  ngOnInit(): void {
    this.oCandidaturaForm.markAllAsTouched();

    // sesión
    this.oSessionService.onLogin().subscribe({ next: () => this.setRoleFromSession() });
    this.oSessionService.onLogout().subscribe({
      next: () => {
        this.isAdmin = this.isEmpresa = this.isAlumno = false;
      },
    });

    // cargar combos
    this.cargarCombos();

    // preview reactivo
    this.oCandidaturaForm.get('alumnoId')?.valueChanges.subscribe(id => {
      this.alumnoSel = this.findAlumno(id);
    });

    this.oCandidaturaForm.get('ofertaId')?.valueChanges.subscribe(id => {
      this.ofertaSel = this.findOferta(id);
    });

    // filtros reactivos
    this.alumnoFilter.valueChanges.subscribe(txt => {
      const q = (txt || '').toLowerCase().trim();
      if (!q) {
        this.alumnosView = this.alumnos;
        return;
      }

      this.alumnosView = this.alumnos.filter(a => {
        const full = `${a.nombre} ${a.ape1} ${a.ape2 || ''}`.toLowerCase();
        const email = (a.email || '').toLowerCase();
        const sector = (a.sector?.nombre || '').toLowerCase();
        return (
          full.includes(q) ||
          email.includes(q) ||
          sector.includes(q) ||
          String(a.id).includes(q)
        );
      });
    });

    this.ofertaFilter.valueChanges.subscribe(txt => {
      const q = (txt || '').toLowerCase().trim();
      if (!q) {
        this.ofertasView = this.ofertas;
        return;
      }

      this.ofertasView = this.ofertas.filter(o => {
        const titulo = (o.titulo || '').toLowerCase();
        const empresa = (o.empresa?.nombre || '').toLowerCase();
        const sector = (o.sector?.nombre || '').toLowerCase();
        return (
          titulo.includes(q) ||
          empresa.includes(q) ||
          sector.includes(q) ||
          String(o.id).includes(q)
        );
      });
    });
  }

  private setRoleFromSession(): void {
    const tipo = (this.oSessionService.getSessionTipoUsuario() || '').toLowerCase().trim();
    this.isAdmin = (tipo === 'admin' || tipo === 'administrador');
    this.isEmpresa = (tipo === 'empresa');
    this.isAlumno = (tipo === 'alumno');
  }

  private cargarCombos(): void {
    this.loadingData = true;

    let loadedA = false;
    let loadedO = false;

    this.oAlumnoService.getAll().subscribe({
      next: (res: IAlumno[]) => {
        this.alumnos = res || [];
        this.alumnosView = this.alumnos; // ✅ importante
        loadedA = true;
        this.loadingData = !(loadedA && loadedO);
      },
      error: (err: any) => {
        console.error('Error cargando alumnos', err);
        loadedA = true;
        this.loadingData = !(loadedA && loadedO);
        this.showModal('Error cargando alumnos');
      },
    });

    this.oOfertaService.getAll().subscribe({
      next: (res: IOferta[]) => {
        this.ofertas = res || [];
        this.ofertasView = this.ofertas; // ✅ ESTE era el paso que te faltaba
        loadedO = true;
        this.loadingData = !(loadedA && loadedO);
      },
      error: (err: any) => {
        console.error('Error cargando ofertas', err);
        loadedO = true;
        this.loadingData = !(loadedA && loadedO);
        this.showModal('Error cargando ofertas');
      },
    });
  }

  // helpers preview
  private findAlumno(id: number | null): IAlumno | null {
    if (!id) return null;
    return this.alumnos.find(a => a.id === id) ?? null;
  }

  private findOferta(id: number | null): IOferta | null {
    if (!id) return null;
    return this.ofertas.find(o => o.id === id) ?? null;
  }

  alumnoNombre(): string {
    if (!this.alumnoSel) return 'Alumno pendiente';
    const a = this.alumnoSel;
    return `${a.nombre || ''} ${a.ape1 || ''} ${a.ape2 || ''}`.trim();
  }

  alumnoEmail(): string {
    return this.alumnoSel?.email || 'Email pendiente';
  }

  ofertaTitulo(): string {
    return this.ofertaSel?.titulo || 'Oferta pendiente';
  }

  ofertaEmpresaNombre(): string {
    return this.ofertaSel?.empresa?.nombre || 'Empresa';
  }

  initials(text: string): string {
    const t = (text || 'NA').trim();
    return t.substring(0, 2).toUpperCase();
  }

  // modal
  showModal(mensaje: string): void {
    this.strMessage = mensaje;

    const modalElement = document.getElementById('mimodal');
    if (!modalElement) {
      console.error('No se encontró el modal en el DOM');
      return;
    }

    this.myModal = new bootstrap.Modal(modalElement, {
      backdrop: 'static',
      keyboard: false,
    });

    this.myModal.show();
  }

  hideModal = (): void => {
    this.myModal?.hide();
    this.oRouter.navigate(['admin', 'candidatura', 'plist']);
  };

  onReset(): false {
    this.oCandidaturaForm.reset();
    this.alumnoSel = null;
    this.ofertaSel = null;

    // reset filtros + listas
    this.alumnoFilter.setValue('');
    this.ofertaFilter.setValue('');
    this.alumnosView = this.alumnos;
    this.ofertasView = this.ofertas;

    return false;
  }

  cancel(): void {
    this.oRouter.navigate(['admin', 'candidatura', 'plist']);
  }

  submit(): void {
    if (!this.isAdmin) {
      this.showModal('Esta sección es solo para administración.');
      return;
    }

    if (this.oCandidaturaForm.invalid) {
      this.showModal('Formulario inválido');
      return;
    }

    const alumnoId = this.oCandidaturaForm.get('alumnoId')?.value ?? null;
    const ofertaId = this.oCandidaturaForm.get('ofertaId')?.value ?? null;

    if (!alumnoId || !ofertaId) {
      this.showModal('Debes seleccionar alumno y oferta.');
      return;
    }

    const payload: Partial<ICandidatura> = {
      alumno: { id: alumnoId } as any,
      oferta: { id: ofertaId } as any,
    };

    this.loading = true;

    this.oCandidaturaService.create(payload as ICandidatura).subscribe({
      next: () => {
        this.loading = false;
        this.showModal('Candidatura creada correctamente.');
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
        this.showModal('Error creando la candidatura.');
      },
    });
  }
}
