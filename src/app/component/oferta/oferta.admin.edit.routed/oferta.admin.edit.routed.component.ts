import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { OfertaService } from '../../../service/oferta.service';
import { IOferta } from '../../../model/oferta.interface';
import { ISector } from '../../../model/sector.interface';

import { SectorAdminSelectorUnroutedComponent } from '../../sector/sector.admin.selector.unrouted/sector.admin.selector.unrouted.component';
import { SessionService } from '../../../service/session.service';

declare let bootstrap: any;

@Component({
  selector: 'app-oferta.admin.edit.routed',
  standalone: true,
  templateUrl: './oferta.admin.edit.routed.component.html',
  styleUrls: ['./oferta.admin.edit.routed.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
})
export class OfertaAdminEditRoutedComponent implements OnInit {

  id = 0;

  // ✅ Solo lo editable
  oOfertaForm = new FormGroup({
    titulo: new FormControl<string>('', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]),
    descripcion: new FormControl<string>('', [Validators.required, Validators.minLength(5), Validators.maxLength(555)]),
    sectorId: new FormControl<number | null>(null, Validators.required),
  });

  oOferta: IOferta | null = null;

  empresaNombre = '';
  empresaEmail = '';
  sectorNombre = '';

  // roles
  isAdmin = false;
  isEmpresa = false;
  isAlumno = false;

  // session
  activeSession = false;
  userEmail = '';

  // UI
  loading = true;
  strMessage = '';
  myModal: any;

  readonly dialog = inject(MatDialog);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly ofertaService: OfertaService,
    private readonly router: Router,
    private readonly sessionService: SessionService
  ) {
    this.route.params.subscribe(p => this.id = +p['id']);
  }

  ngOnInit(): void {
    this.activeSession = this.sessionService.isSessionActive();
    this.userEmail = (this.sessionService.getSessionEmail() || '').trim();

    this.setRoleFromSession();

    // alumno fuera
    if (this.isAlumno || !this.activeSession) {
      this.router.navigate(['/']);
      return;
    }

    this.cargar();
  }

  private setRoleFromSession(): void {
    const tipo = (this.sessionService.getSessionTipoUsuario() || '').toLowerCase().trim();
    this.isAdmin = (tipo === 'admin' || tipo === 'administrador');
    this.isEmpresa = (tipo === 'empresa');
    this.isAlumno = (tipo === 'alumno');
  }

  private cargar(): void {
    this.loading = true;

    this.ofertaService.get(this.id).subscribe({
      next: (o: IOferta) => {
        this.oOferta = o;

        // ✅ Si es empresa: comprobar propiedad por email
        if (this.isEmpresa && !this.isAdmin) {
          const ownerEmail = (o.empresa?.email || '').trim().toLowerCase();
          const me = (this.userEmail || '').trim().toLowerCase();

          if (!me || !ownerEmail || me !== ownerEmail) {
            this.loading = false;
            this.showModal('No tienes permisos para editar esta oferta (no pertenece a tu empresa).');
            return;
          }
        }

        // Form (editable)
        this.oOfertaForm.patchValue({
          titulo: o.titulo ?? '',
          descripcion: o.descripcion ?? '',
          sectorId: o.sector?.id ?? null
        });

        // Readonly
        this.empresaNombre = o.empresa?.nombre ?? '';
        this.empresaEmail = o.empresa?.email ?? '';
        this.sectorNombre = o.sector?.nombre ?? '';

        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
        this.showModal('No se pudo cargar la oferta.');
      }
    });
  }

  // Selector de sector
  showSectorSelectorModal(): false {
    const dialogRef = this.dialog.open(SectorAdminSelectorUnroutedComponent, {
      height: '800px',
      width: '80%',
      maxWidth: '90%',
      data: {}
    });

    dialogRef.afterClosed().subscribe((result: ISector | undefined) => {
      if (!result) return;
      this.oOfertaForm.patchValue({ sectorId: result.id });
      this.sectorNombre = result.nombre;
    });

    return false;
  }

  onReset(): false {
    if (!this.oOferta) return false;

    this.oOfertaForm.patchValue({
      titulo: this.oOferta.titulo ?? '',
      descripcion: this.oOferta.descripcion ?? '',
      sectorId: this.oOferta.sector?.id ?? null
    });

    this.sectorNombre = this.oOferta.sector?.nombre ?? '';
    return false;
  }

  onSubmit(): void {
    if (!this.oOferta || this.oOfertaForm.invalid) {
      this.showModal('Formulario no válido');
      return;
    }

    // ✅ Seguridad extra: si empresa, vuelve a comprobar
    if (this.isEmpresa && !this.isAdmin) {
      const ownerEmail = (this.oOferta.empresa?.email || '').trim().toLowerCase();
      const me = (this.userEmail || '').trim().toLowerCase();
      if (!me || !ownerEmail || me !== ownerEmail) {
        this.showModal('No tienes permisos para editar esta oferta.');
        return;
      }
    }

    const { titulo, descripcion, sectorId } = this.oOfertaForm.getRawValue();

    // ✅ CLAVE: payload LIMPIO (solo IDs para empresa/sector)
    const payload: any = {
      id: this.oOferta.id, // el backend lo pisa con el path, pero no molesta
      titulo: (titulo ?? '').trim(),
      descripcion: (descripcion ?? '').trim(),
      empresa: { id: this.oOferta.empresa?.id }, // SOLO ID
      sector: { id: sectorId }                   // SOLO ID
    };

    this.loading = true;

    this.ofertaService.update(payload).subscribe({
      next: (oUpd) => {
        this.oOferta = oUpd;

        // refrescar textos
        this.empresaNombre = oUpd.empresa?.nombre ?? this.empresaNombre;
        this.empresaEmail = oUpd.empresa?.email ?? this.empresaEmail;
        this.sectorNombre = oUpd.sector?.nombre ?? this.sectorNombre;

        this.loading = false;
        this.showModal(`Oferta actualizada correctamente`);
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.showModal('Error al actualizar la oferta');
      }
    });
  }


  showModal(msg: string): void {
    this.strMessage = msg;
    const el = document.getElementById('mimodal');
    if (!el) return;
    this.myModal = new bootstrap.Modal(el, { keyboard: false });
    this.myModal.show();
  }

  hideModal = (): void => {
    this.myModal?.hide();

    // si fue “no permitido”, vuelvo a un sitio seguro
    if (this.strMessage?.toLowerCase().includes('no tienes permisos')) {
      this.router.navigate([this.isEmpresa && !this.isAdmin ? '/empresa/oferta/plist' : '/admin/oferta/plist']);
      return;
    }

    if (this.oOferta?.id) {
      this.router.navigate(['/admin/oferta/view', this.oOferta.id]);
    } else {
      this.router.navigate(['/admin/oferta/plist']);
    }
  };
}
