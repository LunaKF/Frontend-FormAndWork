import { Component, OnInit } from '@angular/core';
import { IOferta } from '../../../model/oferta.interface';
import { ActivatedRoute } from '@angular/router';
import { ICandidatura } from "../../../model/candidatura.interface"
import { CandidaturaService } from "../../../service/candidatura.service"
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { OfertaService } from '../../../service/oferta.service';
@Component({
  selector: 'app-oferta.admin.view.routed',
  templateUrl: './oferta.admin.view.routed.component.html',
  styleUrls: ['./oferta.admin.view.routed.component.css'],
  imports: [CommonModule], // Aquí importas CommonModule
        standalone: true
})
export class OfertaAdminViewRoutedComponent implements OnInit {

  //
  id: number = 0;
  route: string = '';
  oOferta: IOferta = {
    id: 0, titulo: '', descripcion: '',
    empresa: { id: 0, nombre: "", email: "", sector: { id: 0, nombre: '', alumnos: 0, empresas: 0 , ofertas: 0} },
    sector: { id: 0, nombre: '', alumnos: 0, empresas: 0, ofertas: 0 }
  }

  
   //
   constructor(private oActivatedRoute: ActivatedRoute, private oOfertaService: OfertaService) { }
  
   ngOnInit() {
     this.id = this.oActivatedRoute.snapshot.params['id'];
  
     //llamada al servicio
     this.getOne();
   }
  
   getOne() {
     this.oOfertaService.getOne(this.id).subscribe({
       next: (data: IOferta) => {
         this.oOferta = data;
       },
     });
   }
  }
  