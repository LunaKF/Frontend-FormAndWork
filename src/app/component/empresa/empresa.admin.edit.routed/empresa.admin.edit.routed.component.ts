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
import { IEmpresa } from '../../../model/empresa.interface';
import { EmpresaService } from '../../../service/empresa.service';
import { SectorAdminSelectorUnroutedComponent } from '../../sector/sector.admin.selector.unrouted/sector.admin.selector.unrouted.component';
import { MatDialog } from '@angular/material/dialog';
import { ISector } from '../../../model/sector.interface';
import { CommonModule } from '@angular/common';
import { SectorService } from '../../../service/sector.service';
import { interval } from 'rxjs';

declare let bootstrap: any;

@Component({
    selector: 'app-empresa.admin.edit.routed',
    templateUrl: './empresa.admin.edit.routed.component.html',
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule,
        RouterModule,
        CommonModule
    ],
    styleUrls: ['./empresa.admin.edit.routed.component.css']
})
export class EmpresaAdminEditRoutedComponent implements OnInit {

  id: number = 0;
  oEmpresaForm: FormGroup | undefined = undefined;
  oEmpresa: IEmpresa | null = null;
  readonly dialog = inject(MatDialog);
  oSector: ISector = {} as ISector;
  myModal: any;
  strMessage: string = '';


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
    private oEmpresaService: EmpresaService,
    private oSectorService: SectorService,
    private oRouter: Router
  ) {
    this.oEmpresaForm = new FormGroup({
      id: new FormControl(''),

      nombre: new FormControl('', [
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
    this.oEmpresaForm?.markAllAsTouched();

    this.oEmpresaForm?.controls['sector'].valueChanges.subscribe(value => {
      if (value) {
        if (value.id) {
          this.oSectorService.get(value.id).subscribe({
            next: (oSector: ISector) => {
              this.oSector = oSector;
            },
            error: (error) => {
              console.error(error);
              this.oSector = {} as ISector;
              this.oEmpresaForm?.controls['sector'].setErrors({ invalid: true });
            }
          });
      } else {
        this.oSector = {} as ISector;
      }
    }
  });
  }

  createForm() {
    this.oEmpresaForm = new FormGroup({
      id: new FormControl(''),

      nombre: new FormControl('', [
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
    this.oEmpresaForm?.controls['nombre'].setValue('');
    this.oEmpresaForm?.controls['sector'].setValue({
      id: null,
      nombre: null,
    });
    this.oEmpresaForm?.controls['telefono'].setValue('');
    this.oEmpresaForm?.controls['email'].setValue('');
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
    this.oRouter.navigate(['/admin/empresa/view/' + this.oEmpresa?.id]);
  }

  onSubmit() {
    if (this.oEmpresaForm?.invalid) {
      this.showModal('Formulario inválido');
      return;
    } else {
      console.log(this.oEmpresaForm?.value);
      this.oEmpresaService.create(this.oEmpresaForm?.value).subscribe({
        next: (oEmpresa: IEmpresa) => {
          this.oEmpresa = oEmpresa;
          this.showModal('Empresa creada con el id: ' + this.oEmpresa.id);
        },
        error: (err) => {
          this.showModal('Error al crear la Empresa');
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
        this.oEmpresaForm?.controls['sector'].setValue(this.oSector);
        console.log(this.oEmpresaForm?.value);
      }
    });
    return false;
  }



}