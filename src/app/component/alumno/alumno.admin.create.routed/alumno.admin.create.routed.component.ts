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

import { IAlumno } from '../../../model/alumno.interface';
import { ISector } from '../../../model/sector.interface';
import { AlumnoService } from '../../../service/alumno.service';
import { SectorAdminSelectorUnroutedComponent } from '../../sector/sector.admin.selector.unrouted/sector.admin.selector.unrouted.component';
import { SessionService } from '../../../service/session.service';

declare let bootstrap: any;

@Component({
  selector: 'app-alumno.admin.create.routed',
  templateUrl: './alumno.admin.create.routed.component.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  styleUrls: ['./alumno.admin.create.routed.component.css'],
})
export class AlumnoAdminCreateComponent implements OnInit {
  oAlumnoForm!: FormGroup;

  oAlumno: IAlumno | null = null;
  strMessage = '';
  myModal: any;

  readonly dialog = inject(MatDialog);

  // preview
  oSector: ISector = {} as ISector;
  sectorNombre = '';

  // roles
  isAdmin = false;
  isEmpresa = false;
  isAlumno = false;

  loading = false;

  constructor(
    private readonly alumnoService: AlumnoService,
    private readonly router: Router,
    private readonly sessionService: SessionService
  ) {}

  ngOnInit(): void {
    // roles
    const tipo = (this.sessionService.getSessionTipoUsuario() || '').toLowerCase().trim();
    this.isAdmin = (tipo === 'admin' || tipo === 'administrador');
    this.isEmpresa = (tipo === 'empresa');
    this.isAlumno = (tipo === 'alumno');

    // si no es admin, fuera (create alumno = admin)
    if (!this.isAdmin) {
      this.router.navigate(['/']);
      return;
    }

    this.createForm();
    this.oAlumnoForm.markAllAsTouched();
  }

  private createForm(): void {
    this.oAlumnoForm = new FormGroup({
      id: new FormControl(''),

      nombre: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),

      ape1: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),

      ape2: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),

      telefono: new FormControl('', [
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(9),
      ]),

      email: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.minLength(5),
        Validators.maxLength(100),
      ]),

      // ✅ CLAVE: sector es FormGroup (así el HTML formGroupName="sector" funciona)
      sector: new FormGroup({
        id: new FormControl<number | null>(null, Validators.required),
        nombre: new FormControl<string>('', Validators.required),
      }),
    });
  }

  onReset(): false {
    this.oAlumnoForm.reset();
    this.oAlumnoForm.get('sector')?.patchValue({ id: null, nombre: '' });
    this.oSector = {} as ISector;
    this.sectorNombre = '';
    return false;
  }

  showSectorSelectorModal(): false {
    const dialogRef = this.dialog.open(SectorAdminSelectorUnroutedComponent, {
      height: '800px',
      width: '80%',
      maxWidth: '90%',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result: ISector | undefined) => {
      if (!result) return;

      this.oSector = result;
      this.sectorNombre = result.nombre;

      this.oAlumnoForm.get('sector')?.patchValue({
        id: result.id,
        nombre: result.nombre,
      });
    });

    return false;
  }

  onSubmit(): void {
    if (this.oAlumnoForm.invalid) {
      this.showModal('Formulario inválido');
      return;
    }

    const v = this.oAlumnoForm.getRawValue() as any;

    // ✅ payload limpio: sector SOLO con id (y nombre si quieres, no molesta)
    const payload: any = {
      id: null, // create: no mandamos id real
      nombre: (v.nombre ?? '').trim(),
      ape1: (v.ape1 ?? '').trim(),
      ape2: (v.ape2 ?? '').trim(),
      telefono: (v.telefono ?? '').trim(),
      email: (v.email ?? '').trim(),
      sector: { id: v.sector?.id }, // SOLO ID (lo importante)
    };

    this.loading = true;

    this.alumnoService.create(payload).subscribe({
      next: (oAlumno: IAlumno) => {
        this.oAlumno = oAlumno;
        this.loading = false;
        this.showModal('Alumno creado con el id: ' + this.oAlumno.id);
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
        this.showModal('Error al crear el Alumno');
      },
    });
  }

  showModal(mensaje: string): void {
    this.strMessage = mensaje;
    const modalElement = document.getElementById('mimodal');
    if (!modalElement) return;

    this.myModal = new bootstrap.Modal(modalElement, {
      backdrop: 'static',
      keyboard: false,
    });

    this.myModal.show();
  }

  hideModal = (): void => {
    this.myModal?.hide();
    if (this.oAlumno?.id) {
      this.router.navigate(['/admin/alumno/view/' + this.oAlumno.id]);
    } else {
      this.router.navigate(['/admin/alumno/plist']);
    }
  };
}
