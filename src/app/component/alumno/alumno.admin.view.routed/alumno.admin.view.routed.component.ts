import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IAlumno } from "../../../model/alumno.interface"
import { AlumnoService } from "../../../service/alumno.service"
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-alumno.admin.view.routed',
  templateUrl: './alumno.admin.view.routed.component.html',
  styleUrls: ['./alumno.admin.view.routed.component.css'],
      imports: [CommonModule],
      standalone: true
})
export class AlumnoAdminViewRoutedComponent implements OnInit {

   //
   id: number = 0;
   route: string = '';
   oAlumno: IAlumno = {
     id: 0, nombre: '', ape1: '', ape2: '', email: '', sector: { id: 0, nombre: '', alumnos: 0, empresas: 0, ofertas: 0 },
     candidaturas: 0
   };
 
   //
   constructor(private oActivatedRoute: ActivatedRoute, private oAlumnoService: AlumnoService) { }
 
   ngOnInit() {
     this.id = this.oActivatedRoute.snapshot.params['id'];
 
     //llamada al servicio
     this.getOne();
   }
 
   getOne() {
     this.oAlumnoService.getOne(this.id).subscribe({
       next: (data: IAlumno) => {
         this.oAlumno = data;
       },
     });
   }
 }
 