import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { IOferta } from '../../../model/oferta.interface';
import { ISector } from '../../../model/sector.interface';
import { IEmpresa } from '../../../model/empresa.interface';

import { OfertaService } from '../../../service/oferta.service';
import { SectorService } from '../../../service/sector.service';
import { EmpresaService } from '../../../service/empresa.service';
import { SessionService } from '../../../service/session.service';

import { SectorAdminSelectorUnroutedComponent } from '../../sector/sector.admin.selector.unrouted/sector.admin.selector.unrouted.component';
import { EmpresaAdminSelectorUnroutedComponent } from '../../empresa/empresa.admin.selector.unrouted/empresa.admin.selector.unrouted.component';

declare let bootstrap: any;

@Component({
  selector: 'app-oferta.admin.create.routed',
  templateUrl: './oferta.admin.create.routed.component.html',
  styleUrls: ['./oferta.admin.create.routed.component.css'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    RouterModule,
    CommonModule,
  ],
})
export class OfertaAdminCreateRoutedComponent implements OnInit {
  oOfertaForm: FormGroup | undefined = undefined;
  oOferta: IOferta | null = null;

  strMessage: string = '';
  myModal: any;

  readonly dialog = inject(MatDialog);

  // Preview objects
  oSector: ISector = {} as ISector;
  oEmpresa: IEmpresa = {} as IEmpresa;

  // roles
  isAdmin = false;
  isEmpresa = false;
  isAlumno = false;

  loading = false;

  // navegación (según rol)
  backLink: any[] = ['/admin', 'oferta', 'plist'];

  constructor(
    private oOfertaService: OfertaService,
    private oSectorService: SectorService,
    private oEmpresaService: EmpresaService,
    private oSessionService: SessionService,
    private oRouter: Router
  ) {
    const tipo = (this.oSessionService.getSessionTipoUsuario() || '')
      .toLowerCase()
      .trim();

    this.isAdmin = tipo === 'admin' || tipo === 'administrador';
    this.isEmpresa = tipo === 'empresa';
    this.isAlumno = tipo === 'alumno';

    this.backLink = this.isEmpresa
      ? ['/empresa', 'oferta', 'plist']
      : ['/admin', 'oferta', 'plist'];
  }

  ngOnInit(): void {
    this.createForm();
    this.oOfertaForm?.markAllAsTouched();

    // por si cambia sesión “en caliente”
    this.oSessionService.onLogin().subscribe({
      next: () => {
        const tipo = (this.oSessionService.getSessionTipoUsuario() || '')
          .toLowerCase()
          .trim();
        this.isAdmin = tipo === 'admin' || tipo === 'administrador';
        this.isEmpresa = tipo === 'empresa';
        this.isAlumno = tipo === 'alumno';

        this.backLink = this.isEmpresa
          ? ['/empresa', 'oferta', 'plist']
          : ['/admin', 'oferta', 'plist'];

        if (this.isEmpresa) this.lockEmpresaFromSession();
      },
    });

    this.oSessionService.onLogout().subscribe({
      next: () => {
        this.isAdmin = this.isEmpresa = this.isAlumno = false;
      },
    });

    // empresa crea sobre sí misma
    if (this.isEmpresa) {
      this.lockEmpresaFromSession();
    }
  }

  createForm() {
    this.oOfertaForm = new FormGroup({
      // NO incluimos id: en create no se manda

      titulo: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(255),
      ]),

      descripcion: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(555),
      ]),

      sector: new FormGroup({
        id: new FormControl('', Validators.required),
        nombre: new FormControl('', Validators.required),
      }),

      empresa: new FormGroup({
        id: new FormControl('', Validators.required),
        nombre: new FormControl('', Validators.required),
        email: new FormControl('', Validators.required),
      }),
    });
  }

  /**
   * EMPRESA: auto-rellenar y bloquear empresa
   * Ajusta el método getSessionId() si en tu SessionService se llama distinto.
   */
  private lockEmpresaFromSession() {
    const empresaId = (this.oSessionService as any).getSessionId?.() ?? 0; // <-- AJUSTA AQUÍ si hace falta
    if (!empresaId || Number(empresaId) <= 0) {
      // fallback: si no tienes id en sesión, deja el form inválido y lo verás al probar
      return;
    }

    this.oEmpresaService.get(Number(empresaId)).subscribe({
      next: (e: IEmpresa) => {
        this.oEmpresa = e;

        this.oOfertaForm?.get('empresa')?.patchValue({
          id: e.id,
          nombre: e.nombre,
          email: e.email,
        });

        // bloquear empresa (para que no pueda tocar nada)
        this.oOfertaForm?.get('empresa.id')?.disable({ emitEvent: false });
        this.oOfertaForm?.get('empresa.nombre')?.disable({ emitEvent: false });
        this.oOfertaForm?.get('empresa.email')?.disable({ emitEvent: false });
      },
      error: () => {
        // si falla, simplemente no bloqueamos (verás el form inválido)
      },
    });
  }

  updateForm() {
    this.oOfertaForm?.reset();

    this.oSector = {} as ISector;
    this.oEmpresa = {} as IEmpresa;

    // dejamos estructura de subgrupos en blanco
    this.oOfertaForm?.get('sector')?.patchValue({ id: '', nombre: '' });
    this.oOfertaForm?.get('empresa')?.patchValue({
      id: '',
      nombre: '',
      email: '',
    });

    // si es empresa, volvemos a bloquear sobre sí misma
    if (this.isEmpresa) this.lockEmpresaFromSession();
  }

  showModal(mensaje: string) {
    this.strMessage = mensaje;

    const modalElement = document.getElementById('mimodal');
    if (!modalElement) return;

    this.myModal = new bootstrap.Modal(modalElement, {
      backdrop: 'static',
      keyboard: false,
    });

    this.myModal.show();
  }

  onReset() {
    this.updateForm();
    return false;
  }

  hideModal = () => {
    this.myModal?.hide();

    if (this.oOferta?.id) {
      // para simplificar, lo mando a admin view (ajusta ruta si tienes view de empresa)
      this.oRouter.navigate(['/admin/oferta/view/' + this.oOferta.id]);
    } else {
      this.oRouter.navigate(this.backLink);
    }
  };

  onSubmit() {
    if (!this.oOfertaForm || this.oOfertaForm.invalid) {
      this.showModal('Formulario inválido');
      return;
    }

    // 👇 IMPORTANTÍSIMO:
    // getRawValue() incluye los campos disabled (empresa.* cuando rol=empresa)
    const payload = this.oOfertaForm.getRawValue();

    // seguridad extra: empresa NO puede inventarse otra empresa
    if (this.isEmpresa) {
      payload.empresa = {
        id: this.oEmpresa?.id,
        nombre: this.oEmpresa?.nombre,
        email: this.oEmpresa?.email,
      } as any;
    }

    // (opcional) si quieres asegurar que sector/empresa tengan nombre siempre:
    // aquí podrías revalidar o hacer get() por id, pero no lo toco.

    this.oOfertaService.create(payload).subscribe({
      next: (oOferta: IOferta) => {
        this.oOferta = oOferta;
        this.showModal('Oferta creada con el id: ' + this.oOferta.id);
      },
      error: (err) => {
        this.showModal('Error al crear la Oferta');
        console.log(err);
      },
    });
  }

  showSectorSelectorModal() {
    const dialogRef = this.dialog.open(SectorAdminSelectorUnroutedComponent, {
      height: '700px',
      maxHeight: '1200px',
      width: '90%',
      maxWidth: '90%',
      data: { origen: '', sector: '' },
      panelClass: 'custom-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        this.oSector = result;

        this.oOfertaForm?.get('sector')?.patchValue({
          id: this.oSector.id,
          nombre: this.oSector.nombre,
        });
      }
    });

    return false;
  }

  showEmpresaSelectorModal() {
    if (!this.isAdmin) return false;

    const dialogRef = this.dialog.open(EmpresaAdminSelectorUnroutedComponent, {
      height: '700px',
      maxHeight: '1200px',
      width: '90%',
      maxWidth: '90%',
      data: { origen: '', empresa: '' },
      panelClass: 'custom-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        this.oEmpresa = result;

        this.oOfertaForm?.get('empresa')?.patchValue({
          id: this.oEmpresa.id,
          nombre: this.oEmpresa.nombre,
          email: this.oEmpresa.email,
        });
      }
    });

    return false;
  }
}
