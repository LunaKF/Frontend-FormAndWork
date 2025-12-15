import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { IAlumno } from '../../../model/alumno.interface';
import { AlumnoService } from '../../../service/alumno.service';

declare let bootstrap: any;

@Component({
  selector: 'app-alumno.admin.delete.routed',
  templateUrl: './alumno.admin.delete.routed.component.html',
  styleUrls: ['./alumno.admin.delete.routed.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class AlumnoAdminDeleteRoutedComponent implements OnInit {
  oAlumno: IAlumno | null = null;

  loading = true;
  deleting = false;

  strMessage: string = '';
  myModal: any;

  constructor(
    private oAlumnoService: AlumnoService,
    private oActivatedRoute: ActivatedRoute,
    private oRouter: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.oActivatedRoute.snapshot.params['id'];
    const id = Number(idParam);

    if (!id || Number.isNaN(id)) {
      this.loading = false;
      this.showModal('ID inválido. No se puede cargar el alumno.');
      return;
    }

    this.loading = true;

    // ✅ usa get() (como en tu service) y parsea a número
    this.oAlumnoService.get(id).subscribe({
      next: (oAlumno: IAlumno) => {
        this.oAlumno = oAlumno;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showModal('Error al cargar los datos del alumno');
      },
    });
  }

  fullName(a: IAlumno | null): string {
    if (!a) return '';
    return [a.nombre, a.ape1, a.ape2].filter(Boolean).join(' ').trim();
  }

  goCandidaturas(): void {
    if (!this.oAlumno) return;
    this.oRouter.navigate(['admin', 'candidatura', 'xalumno', 'plist', this.oAlumno.id]);
  }

  showModal(mensaje: string): void {
    this.strMessage = mensaje;

    // ✅ asegura que el modal existe en DOM antes de inicializarlo
    setTimeout(() => {
      const el = document.getElementById('mimodal');
      if (!el) return;

      this.myModal = new bootstrap.Modal(el, { keyboard: false });
      this.myModal.show();
    }, 0);
  }

  delete(): void {
    if (!this.oAlumno || this.deleting) return;

    this.deleting = true;

    this.oAlumnoService.delete(this.oAlumno.id).subscribe({
      next: () => {
        this.deleting = false;
        this.showModal(`Alumno #${this.oAlumno!.id} ha sido borrado correctamente.`);
      },
      error: () => {
        this.deleting = false;
        this.showModal('Error al borrar al alumno');
      },
    });
  }

  hideModal = (): void => {
    try {
      this.myModal?.hide();
    } catch {}
    this.oRouter.navigate(['/admin/alumno/plist']);
  };
}
