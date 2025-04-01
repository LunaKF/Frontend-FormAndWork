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
    ],
    styleUrls: ['./empresa.admin.edit.routed.component.css']
})
export class EmpresaAdminEditRoutedComponent implements OnInit {

  id: number = 0;
  oEmpresaForm: FormGroup | undefined = undefined;
  oEmpresa: IEmpresa | null = null;
  oSector: ISector = {} as ISector;
    readonly dialog = inject(MatDialog);
  myModal: any;
  strMessage: string = '';

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
    private oActivatedRoute: ActivatedRoute,
    private oEmpresaService: EmpresaService,
    private oRouter: Router
  ) {
    this.oActivatedRoute.params.subscribe((params) => {
      this.id = params['id'];
    });
  }


  ngOnInit() {
    this.createForm();
    this.get();
    this.oEmpresaForm?.markAllAsTouched();
  }

  createForm() {
    this.oEmpresaForm = new FormGroup({
      id: new FormControl('', [Validators.required]),
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

  onReset() {
    this.oEmpresaService.get(this.id).subscribe({
      next: (oEmpresa: IEmpresa) => {
        this.oEmpresa = oEmpresa;
        this.updateForm();
      },
      error: (error) => {
        console.error(error);
      },
    });
    return false;
  }

  updateForm() {
    this.oEmpresaForm?.controls['id'].setValue(this.oEmpresa?.id);
    this.oEmpresaForm?.controls['nombre'].setValue('');
    this.oEmpresaForm?.controls['sector'].setValue({
      id: null,
      nombre: null,
    });
    this.oEmpresaForm?.controls['email'].setValue('');
  }

  get() {
    this.oEmpresaService.get(this.id).subscribe({
      next: (oEmpresa: IEmpresa) => {
        this.oEmpresa = oEmpresa;
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
    this.oRouter.navigate(['/admin/empresa/view/' + this.oEmpresa?.id]);
  };
  onSubmit() {
    if (!this.oEmpresaForm?.valid) {
      this.showModal('Formulario no válido');
      return;
    } else {
      this.oEmpresaService.update(this.oEmpresaForm?.value).subscribe({
        next: (oEmpresa: IEmpresa) => {
          this.oEmpresa = oEmpresa;
          this.updateForm();
          this.showModal('Empresa ' + this.oEmpresa.id + ' actualizado');
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
        this.oEmpresaForm?.controls['sector'].setValue(this.oSector);
        console.log(this.oEmpresaForm?.value);
      }
    });
    return false;
  }



}