import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { interval } from 'rxjs';
import { IAlumno } from '../../../model/alumno.interface';
import { ISector } from '../../../model/sector.interface';
import { AlumnoService } from '../../../service/alumno.service';
import { SectorService } from '../../../service/sector.service';
import { SectorAdminSelectorUnroutedComponent } from '../../sector/sector.admin.selector.unrouted/sector.admin.selector.unrouted.component';

declare let bootstrap: any;
@Component({
  selector: 'app-alumno.admin.create.routed',
  templateUrl: './alumno.admin.create.routed.component.html',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    RouterModule,
    CommonModule
],
  styleUrls: ['./alumno.admin.create.routed.component.css']
})
export class AlumnoAdminCreateComponent implements OnInit {

  id: number = 0;
  oAlumnoForm: FormGroup | undefined = undefined;
  oAlumno: IAlumno | null = null;
  strMessage: string = '';
  readonly dialog = inject(MatDialog);
  oSector: ISector = {} as ISector;
  myModal: any;

  form: FormGroup = new FormGroup({});

  arrSectores: string[] = [
    "Administración y gestión", "Agraria", "Artes gráficas", "Artes y artesanías",
    "Comercio y marketing", "Electricidad y electrónica", "Energía y agua",
    "Fabricación mecánica", "Hostelería y turismo", "Imagen personal",
    "Imagen y sonido", "Informática y comunicaciones", "Instalación y mantenimiento",
    "Madera, mueble y corcho", "Marítimo-pesquera", "Química", "Sanidad",
    "Seguridad y medio ambiente", "Servicios socioculturales y a la comunidad",
    "Textil, confección y piel", "Transporte y mantenimiento de vehículos", "Vidrio y cerámica"
  ];

  constructor(
      private oAlumnoService: AlumnoService,
      private oSectorService: SectorService,
      private oRouter: Router
    ) {
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
        sector: new FormControl('', Validators.required),
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
      });
    }
  
 ngOnInit() {
    this.createForm();
    this.oAlumnoForm?.markAllAsTouched();

    this.oAlumnoForm?.controls['sector'].valueChanges.subscribe(value => {
      if (value) {
        if (value.id) {
          this.oSectorService.get(value.id).subscribe({
            next: (oSector: ISector) => {
              this.oSector = oSector;
            },
            error: (error) => {
              console.error(error);
              this.oSector = {} as ISector;
              this.oAlumnoForm?.controls['sector'].setErrors({ invalid: true });
            }
          });
      } else {
        this.oSector = {} as ISector;
      }
    }
  });
  }

  createForm() {
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

  updateForm() {
    this.oAlumnoForm?.controls['nombre'].setValue('');
    this.oAlumnoForm?.controls['ape1'].setValue('');
    this.oAlumnoForm?.controls['ape2'].setValue('');
    this.oAlumnoForm?.controls['sector'].setValue({
      id: null,
      nombre: null,
    });
    this.oAlumnoForm?.controls['telefono'].setValue('');
    this.oAlumnoForm?.controls['email'].setValue('');
  }

  showModal(mensaje: string) {
    this.strMessage = mensaje;  // Verifica si el modal existe en el DOM antes de inicializarlo
    const modalElement = document.getElementById('mimodal');
    if (!modalElement) {
      console.error('Error: No se encontró el modal en el DOM');
      return;
    }
  
    // Inicializa el modal con backdrop definido explícitamente
    this.myModal = new bootstrap.Modal(modalElement, {
      backdrop: 'static', // Evita que se cierre al hacer clic fuera
      keyboard: false
    });
  
    this.myModal.show();

  }

  onReset() {
    this.updateForm();
    return false;
  }

  hideModal = () => {
    this.myModal.hide();
    this.oRouter.navigate(['/admin/alumno/view/' + this.oAlumno?.id]);
  }

  onSubmit() {
    if (this.oAlumnoForm?.invalid) {
      this.showModal('Formulario inválido');
      return;
    } else {
      console.log(this.oAlumnoForm?.value);
      this.oAlumnoService.create(this.oAlumnoForm?.value).subscribe({
        next: (oAlumno: IAlumno) => {
          this.oAlumno = oAlumno;
          this.showModal('Alumno creado con el id: ' + this.oAlumno.id);
        },
        error: (err) => {
          this.showModal('Error al crear el Alumno');
          console.log(err);
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