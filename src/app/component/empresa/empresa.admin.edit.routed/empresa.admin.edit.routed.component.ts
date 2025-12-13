import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IEmpresa } from '../../../model/empresa.interface';
import { EmpresaService } from '../../../service/empresa.service';
import { SectorAdminSelectorUnroutedComponent } from '../../sector/sector.admin.selector.unrouted/sector.admin.selector.unrouted.component';
import { MatDialog } from '@angular/material/dialog';
import { ISector } from '../../../model/sector.interface';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../../service/session.service';

declare let bootstrap: any;

@Component({
  selector: 'app-empresa.admin.edit.routed',
  templateUrl: './empresa.admin.edit.routed.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  styleUrls: ['./empresa.admin.edit.routed.component.css'],
})
export class EmpresaAdminEditRoutedComponent implements OnInit {

  id: number = 0;
  oEmpresaForm: FormGroup | undefined = undefined;
  oEmpresa: IEmpresa | null = null;
  oSector: ISector = {} as ISector;
  readonly dialog = inject(MatDialog);
  myModal: any;
  strMessage: string = '';

  // roles
  isAdmin = false;
  isEmpresa = false;
  isAlumno = false;

  loading = true;

  constructor(
    private oActivatedRoute: ActivatedRoute,
    private oEmpresaService: EmpresaService,
    private oRouter: Router,
    private oSessionService: SessionService
  ) {
    this.oActivatedRoute.params.subscribe((params) => {
      this.id = params['id'];
    });

    // rol inicial
    const tipo = (this.oSessionService.getSessionTipoUsuario() || '')
      .toLowerCase()
      .trim();
    this.isAdmin   = (tipo === 'admin' || tipo === 'administrador');
    this.isEmpresa = (tipo === 'empresa');
    this.isAlumno  = (tipo === 'alumno');
  }

  ngOnInit() {
    this.createForm();
    this.get();

    // por si el rol cambia en caliente
    this.oSessionService.onLogin().subscribe({
      next: () => {
        const tipo = (this.oSessionService.getSessionTipoUsuario() || '')
          .toLowerCase()
          .trim();
        this.isAdmin   = (tipo === 'admin' || tipo === 'administrador');
        this.isEmpresa = (tipo === 'empresa');
        this.isAlumno  = (tipo === 'alumno');
      },
    });

    this.oSessionService.onLogout().subscribe({
      next: () => {
        this.isAdmin = this.isEmpresa = this.isAlumno = false;
      },
    });
  }

  createForm() {
    this.oEmpresaForm = new FormGroup({
      id: new FormControl('', [Validators.required]),
      nombre: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.minLength(5),
        Validators.maxLength(100),
      ]),
      // sector como sub-formGroup para que encaje con formGroupName="sector"
      sector: new FormGroup({
        id: new FormControl('', Validators.required),
        nombre: new FormControl('', Validators.required),
      }),
    });
  }

  // Cargar empresa del backend
  get() {
    this.loading = true;
    this.oEmpresaService.get(this.id).subscribe({
      next: (oEmpresa: IEmpresa) => {
        this.oEmpresa = oEmpresa;
        this.oSector = oEmpresa.sector || {} as ISector;
        this.updateForm();
        this.loading = false;
      },
      error: (error) => {
        console.error(error);
        this.loading = false;
      },
    });
  }

  // Rellenar el formulario con datos de la empresa
  updateForm() {
    if (!this.oEmpresa || !this.oEmpresaForm) return;

    this.oEmpresaForm.patchValue({
      id: this.oEmpresa.id,
      nombre: this.oEmpresa.nombre,
      email: this.oEmpresa.email,
      sector: {
        id: this.oEmpresa.sector?.id || '',
        nombre: this.oEmpresa.sector?.nombre || '',
      },
    });
  }

  // Resetear cambios → recargar datos desde el backend
  onReset() {
    this.get();
    return false;
  }

  showModal(mensaje: string) {
    this.strMessage = mensaje;
    this.myModal = new bootstrap.Modal(document.getElementById('mimodal'), {
      keyboard: false,
    });
    this.myModal.show();
  }

  hideModal = () => {
    this.myModal.hide();
    this.oRouter.navigate(['/admin/empresa/view/' + this.oEmpresa?.id]);
  };

  onSubmit() {
    console.log('SUBMIT!!', this.oEmpresaForm?.value, 'VALID?', this.oEmpresaForm?.valid);
    if (!this.oEmpresaForm?.valid) {
      this.showModal('Formulario no válido');
      return;
    }

    this.oEmpresaService.update(this.oEmpresaForm.value).subscribe({
      next: (oEmpresa: IEmpresa) => {
        this.oEmpresa = oEmpresa;
        this.oSector = oEmpresa.sector || {} as ISector;
        this.updateForm();
        this.showModal('Empresa ' + this.oEmpresa.id + ' actualizada');
      },
      error: (error) => {
        this.showModal('Error al actualizar la empresa');
        console.error(error);
      },
    });
  }

  showSectorSelectorModal() {
    const dialogRef = this.dialog.open(SectorAdminSelectorUnroutedComponent, {
      height: '800px',
      maxHeight: '1200px',
      width: '80%',
      maxWidth: '90%',
      data: { origen: '', sector: '' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.oSector = result;
        // actualizamos el form con el sector elegido
        this.oEmpresaForm?.get('sector')?.patchValue({
          id: this.oSector.id,
          nombre: this.oSector.nombre,
        });
      }
    });
    return false;
  }
}
