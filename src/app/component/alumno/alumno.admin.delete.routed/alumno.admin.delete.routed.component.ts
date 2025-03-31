import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { IAlumno } from '../../../model/alumno.interface';
import { AlumnoService } from '../../../service/alumno.service';

declare let bootstrap: any;

@Component({
  selector: 'app-alumno.admin.delete.routed',
  templateUrl: './alumno.admin.delete.routed.component.html',
  styleUrls: ['./alumno.admin.delete.routed.component.css'],
  standalone: true,
    imports: [RouterModule],
})
export class AlumnoAdminDeleteRoutedComponent implements OnInit {

  oAlumno: IAlumno | null = null;
   strMessage: string = '';
   myModal: any;
   constructor(
     private oAlumnoService: AlumnoService,
     private oActivatedRoute: ActivatedRoute,
     private oRouter: Router
   ) {}
 
   ngOnInit(): void {
     let id = this.oActivatedRoute.snapshot.params['id'];
     this.oAlumnoService.get(id).subscribe({
       next: (oAlumno: IAlumno) => {
         this.oAlumno = oAlumno;
       },
       error: (err) => {
         this.showModal('Error al cargar los datos de la alumno');
       },
     });
   }
 
   showModal(mensaje: string) {
     this.strMessage = mensaje;
     this.myModal = new bootstrap.Modal(document.getElementById('mimodal'), {
       keyboard: false,
     });
     this.myModal.show();
   }
 
   delete(): void {
     this.oAlumnoService.delete(this.oAlumno!.id).subscribe({
       next: (data) => {
         this.showModal(
           'Alumno con id ' + this.oAlumno!.id + ' ha sido borrado'
         );
       },
       error: (error) => {
         this.showModal('Error al borrar la alumno');
       },
     });
   }
 
   hideModal = () => {
     this.myModal.hide();
     this.oRouter.navigate(['/admin/alumno/plist']);
   }
   
 }