import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ICandidatura } from "../../../model/candidatura.interface"
import { CandidaturaService } from "../../../service/candidatura.service"
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-candidatura.admin.view.routed',
  templateUrl: './candidatura.admin.view.routed.component.html',
  styleUrls: ['./candidatura.admin.view.routed.component.css'],
   imports: [CommonModule], // Aquí importas CommonModule
        standalone: true
})
export class CandidaturaAdminViewRoutedComponent implements OnInit {
 //
 id: number = 0;
 route: string = '';
 oCandidatura: ICandidatura = { 
  id: 0, 
  alumno: {
    id: 0, nombre: '', ape1: '', ape2: "", email: '', sector: { id: 0, nombre: '', alumnos: 0, empresas: 0, ofertas: 0 },
    candidaturas: 0
  }, 
  oferta: {
    id: 0, titulo: '', descripcion: '', empresa: { id: 0, nombre: "", email: "", ofertas: 0, sector: { id: 0, nombre: '', alumnos: 0, empresas: 0, ofertas: 0 } }, sector: { id: 0, nombre: '', alumnos: 0, empresas: 0, ofertas: 0 },
    candidaturas: 0
  }, 
  fecha: new Date() 
};

 //
 constructor(private oActivatedRoute: ActivatedRoute, private oCandidaturaService: CandidaturaService) { }

 ngOnInit() {
   this.id = this.oActivatedRoute.snapshot.params['id'];

   //llamada al servicio
   this.getOne();
 }

 getOne() {
   this.oCandidaturaService.getOne(this.id).subscribe({
     next: (data: ICandidatura) => {
       this.oCandidatura = data;
     },
   });
 }
}
