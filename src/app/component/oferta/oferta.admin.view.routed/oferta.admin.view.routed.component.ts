import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { IOferta } from '../../../model/oferta.interface';
import { OfertaService } from '../../../service/oferta.service';

@Component({
  selector: 'app-oferta.admin.view.routed',
  templateUrl: './oferta.admin.view.routed.component.html',
  styleUrls: ['./oferta.admin.view.routed.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class OfertaAdminViewRoutedComponent implements OnInit {

  id: number = 0;

  oOferta: IOferta = {
    id: 0,
    titulo: '',
    descripcion: '',
    empresa: {
      id: 0,
      nombre: '',
      email: '',
      sector: { id: 0, nombre: '', alumnos: 0, empresas: 0, ofertas: 0 },
      ofertas: 0
    },
    sector: { id: 0, nombre: '', alumnos: 0, empresas: 0, ofertas: 0 },
    candidaturas: 0
  };

  constructor(
    private oActivatedRoute: ActivatedRoute,
    private oOfertaService: OfertaService
  ) {}

  ngOnInit(): void {
    this.id = +this.oActivatedRoute.snapshot.params['id'];
    this.getOne();
  }

  getOne(): void {
    this.oOfertaService.get(this.id).subscribe({
      next: (data: IOferta) => this.oOferta = data,
      error: (err) => console.error('Error cargando la oferta:', err)
    });
  }
}
