import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { IAlumno } from '../../../model/alumno.interface';
import { AlumnoService } from '../../../service/alumno.service';
import { SessionService } from '../../../service/session.service';

declare let bootstrap: any;

@Component({
  selector: 'app-alumno.admin.edit.routed',
  templateUrl: './alumno.admin.edit.routed.component.html',
  styleUrls: ['./alumno.admin.edit.routed.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    RouterModule,
  ],
})
export class AlumnoAdminEditRoutedComponent implements OnInit {

  id: number = 0;

  oAlumnoForm!: FormGroup;
  oAlumno: IAlumno | null = null;

  myModal: any;
  strMessage: string = '';

  // ✅ SOLO ADMIN
  isAdmin = false;

  loading = true;

  constructor(
    private oActivatedRoute: ActivatedRoute,
    private oAlumnoService: AlumnoService,
    private oRouter: Router,
    private oSessionService: SessionService
  ) {
    this.oActivatedRoute.params.subscribe((params) => {
      this.id = +params['id'];
    });
  }

  ngOnInit(): void {
    const tipo = (this.oSessionService.getSessionTipoUsuario() || '').toLowerCase().trim();
    this.isAdmin = (tipo === 'admin' || tipo === 'administrador');

    if (!this.isAdmin) {
      this.oRouter.navigate(['/']);
      return;
    }

    this.createForm();
    this.get();
    this.oAlumnoForm.markAllAsTouched();
  }

  private createForm(): void {
    this.oAlumnoForm = new FormGroup({
      id: new FormControl('', [Validators.required]),
      nombre: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
      ape1: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
      ape2: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
      email: new FormControl('', [Validators.required, Validators.email, Validators.minLength(5), Validators.maxLength(100)]),
      // ❌ sector fuera (no editable)
    });
  }

  private patchFormFromAlumno(): void {
    if (!this.oAlumno) return;

    this.oAlumnoForm.patchValue({
      id: this.oAlumno.id,
      nombre: this.oAlumno.nombre,
      ape1: this.oAlumno.ape1,
      ape2: this.oAlumno.ape2,
      email: this.oAlumno.email,
    });

    this.oAlumnoForm.updateValueAndValidity({ emitEvent: false });
  }

  get(): void {
    this.loading = true;

    this.oAlumnoService.get(this.id).subscribe({
      next: (oAlumno: IAlumno) => {
        this.oAlumno = oAlumno;
        this.patchFormFromAlumno();
        this.loading = false;
      },
      error: (error) => {
        console.error(error);
        this.loading = false;
      },
    });
  }

  onReset(): false {
    this.get();
    return false;
  }

  showModal(mensaje: string): void {
    this.strMessage = mensaje;
    const el = document.getElementById('mimodal');
    if (!el) return;

    this.myModal = new bootstrap.Modal(el, { keyboard: false });
    this.myModal.show();
  }

  hideModal = (): void => {
    this.myModal?.hide();
    if (this.oAlumno?.id) {
      this.oRouter.navigate(['/admin/alumno/view/' + this.oAlumno.id]);
    } else {
      this.oRouter.navigate(['/admin/alumno/plist']);
    }
  };

  onSubmit(): void {
    if (!this.oAlumnoForm.valid) {
      this.showModal('Formulario no válido');
      return;
    }

    if (!this.oAlumno) {
      this.showModal('Alumno no cargado');
      return;
    }

    this.loading = true;

    // ✅ Mandamos el payload con el sector original para no liarla con el backend
    const payload: IAlumno = {
      ...this.oAlumno,
      ...this.oAlumnoForm.value,
      sector: this.oAlumno.sector,
    };

    this.oAlumnoService.update(payload).subscribe({
      next: (oAlumno: IAlumno) => {
        this.oAlumno = oAlumno;
        this.patchFormFromAlumno();
        this.loading = false;
        this.showModal('Alumno #' + this.oAlumno.id + ' actualizado');
      },
      error: (error) => {
        console.error(error);
        this.loading = false;
        this.showModal('Error al actualizar el alumno');
      },
    });
  }
}
