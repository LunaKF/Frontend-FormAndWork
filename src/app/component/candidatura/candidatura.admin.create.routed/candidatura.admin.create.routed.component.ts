import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CandidaturaService } from '../../../service/candidatura.service';
import { ICandidatura } from '../../../model/candidatura.interface';
import { AlumnoService } from '../../../service/alumno.service';
import { OfertaService } from '../../../service/oferta.service';
import { IAlumno } from '../../../model/alumno.interface';
import { IOferta } from '../../../model/oferta.interface';

@Component({
  selector: 'app-candidatura.admin.create.routed',
  templateUrl: './candidatura.admin.create.routed.component.html',
  styleUrls: ['./candidatura.admin.create.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class CandidaturaAdminCreateRoutedComponent implements OnInit {
  alumnoId: number | null = null;
  ofertaId: number | null = null;
  loading = false;
  error: string | null = null;

  alumnos: IAlumno[] = [];
  ofertas: IOferta[] = [];

  constructor(
    private oCandidaturaService: CandidaturaService,
    private oAlumnoService: AlumnoService,
    private oOfertaService: OfertaService,
    private oRouter: Router
  ) {}

  ngOnInit(): void {
    this.oAlumnoService.getAll().subscribe({
      next: (res: IAlumno[]) => (this.alumnos = res || []),
      error: (err: any) => console.error('Error cargando alumnos', err),
    });

    this.oOfertaService.getAll().subscribe({
      next: (res: IOferta[]) => (this.ofertas = res || []),
      error: (err: any) => console.error('Error cargando ofertas', err),
    });
  }

  submit(): void {
    this.error = null;
    if (!this.alumnoId || !this.ofertaId) {
      this.error = 'Alumno y oferta son requeridos.';
      return;
    }
    const payload: Partial<ICandidatura> = {
      alumno: { id: this.alumnoId } as any,
      oferta: { id: this.ofertaId } as any,
    };
    this.loading = true;
    // cast to any to satisfy backend shape; backend will set fecha/id as needed
    this.oCandidaturaService.create(payload as ICandidatura).subscribe({
      next: (res: ICandidatura) => {
        this.loading = false;
        this.oRouter.navigate(['admin', 'candidatura', 'plist']);
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
        this.error = 'Error creando la candidatura.';
      },
    });
  }

  cancel(): void {
    this.oRouter.navigate(['admin', 'candidatura', 'plist']);
  }
}
