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
import { IAlumno } from '../../../model/alumno.interface';
import { AlumnoService } from '../../../service/alumno.service';
import { SectorAdminSelectorUnroutedComponent } from '../../sector/sector.admin.selector.unrouted/sector.admin.selector.unrouted.component';
import { MatDialog } from '@angular/material/dialog';
import { ISector } from '../../../model/sector.interface';
import { CommonModule } from '@angular/common';
import { SectorService } from '../../../service/sector.service';
import { interval } from 'rxjs';


declare let bootstrap: any;

@Component({
  selector: 'app-alumno.admin.edit.routed',
  templateUrl: './alumno.admin.edit.routed.component.html',
  styleUrls: ['./alumno.admin.edit.routed.component.css'],
  standalone: true,
  imports: [
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      ReactiveFormsModule,
      RouterModule,
  ],
})
export class AlumnoAdminEditRoutedComponent implements OnInit {

  id: number = 0;
  oAlumnoForm: FormGroup | undefined = undefined;
  oAlumno: IAlumno | null = null;
  oSector: ISector = {} as ISector;
    readonly dialog = inject(MatDialog);
  myModal: any;
  strMessage: string = '';

 
   constructor(
     private oActivatedRoute: ActivatedRoute,
     private oAlumnoService: AlumnoService,
     private oRouter: Router
   ) {
     this.oActivatedRoute.params.subscribe((params) => {
       this.id = params['id'];
     });
   }
   
   
     ngOnInit() {
       this.createForm();
       this.get();
       this.oAlumnoForm?.markAllAsTouched();
     }
   
     createForm() {
       this.oAlumnoForm = new FormGroup({
         id: new FormControl('', [Validators.required]),
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
         email: new FormControl('', [
           Validators.required,
           Validators.email,
           Validators.minLength(5),
           Validators.maxLength(100),
         ]),
   
         sector: new FormControl({
           id: new FormControl('', Validators.required),
           nombre: new FormControl('', Validators.required),
         }),
       
       });
     }
   
     onReset() {
       this.oAlumnoService.get(this.id).subscribe({
         next: (oAlumno: IAlumno) => {
           this.oAlumno = oAlumno;
           this.updateForm();
         },
         error: (error) => {
           console.error(error);
         },
       });
       return false;
     }
   
     updateForm() {
       this.oAlumnoForm?.controls['id'].setValue(this.oAlumno?.id);
       this.oAlumnoForm?.controls['nombre'].setValue('');
       this.oAlumnoForm?.controls['ape1'].setValue('');
        this.oAlumnoForm?.controls['ape2'].setValue('');
       this.oAlumnoForm?.controls['sector'].setValue({
         id: null,
         nombre: null,
       });
       this.oAlumnoForm?.controls['email'].setValue('');
     }
   
     get() {
       this.oAlumnoService.get(this.id).subscribe({
         next: (oAlumno: IAlumno) => {
           this.oAlumno = oAlumno;
           this.updateForm();
         },
         error: (error) => {
           console.error(error);
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
   
     hideModal = () => {
       this.myModal.hide();
       this.oRouter.navigate(['/admin/empresa/view/' + this.oAlumno?.id]);
     };
     onSubmit() {
       if (!this.oAlumnoForm?.valid) {
         this.showModal('Formulario no válido');
         return;
       } else {
         this.oAlumnoService.update(this.oAlumnoForm?.value).subscribe({
           next: (oAlumno: IAlumno) => {
             this.oAlumno = oAlumno;
             this.updateForm();
             this.showModal('Alumno ' + this.oAlumno.id + ' actualizado');
           },
           error: (error) => {
             this.showModal('Error al actualizar el usuario');
             console.error(error);
           },
         });
       }
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
         console.log('The dialog was closed');
         if (result !== undefined) {
           console.log(result);
           this.oSector = result;
           this.oAlumnoForm?.controls['sector'].setValue(this.oSector);
           console.log(this.oAlumnoForm?.value);
         }
       });
       return false;
     }
   
   
   
   }
