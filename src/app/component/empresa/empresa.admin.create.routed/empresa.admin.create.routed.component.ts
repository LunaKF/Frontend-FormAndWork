import { Component, OnInit } from '@angular/core';
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

declare let bootstrap: any;

@Component({
  standalone: true,
  selector: 'app-empresa.admin.create.routed',
  templateUrl: './empresa.admin.create.routed.component.html',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  styleUrls: ['./empresa.admin.create.routed.component.css'],
})
export class EmpresaAdminCreateRoutedComponent implements OnInit {

  id: number = 0;
  oEmpresaForm: FormGroup;
  oEmpresa: IEmpresa | null = null;
  strMessage: string = '';

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
    private oEmpresaService: EmpresaService,
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
    this.oEmpresaForm.markAllAsTouched();
  }

  createForm() {
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

  updateForm() {
    this.oEmpresaForm.controls['nombre'].setValue('');
    this.oEmpresaForm.controls['sector'].setValue('');
    this.oEmpresaForm.controls['telefono'].setValue('');
    this.oEmpresaForm.controls['email'].setValue('');
  }

  showModal(mensaje: string) {
    this.strMessage = mensaje;
    this.myModal = new bootstrap.Modal(document.getElementById('mimodal'), {
      keyboard: false,
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
    if (this.oEmpresaForm.invalid) {
      this.showModal('Formulario inválido');
      return;
    } else {      
      this.oEmpresaService.create(this.oEmpresaForm.value).subscribe({
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
      data: { origen: '', idBalance: '' },


    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result !== undefined) {
        console.log(result);
        this.oCuentaForm?.controls['tipocuenta'].setValue(result);
        this.oTipocuenta = result;
        //this.animal.set(result);
      }
    });
    return false;
  }

}
