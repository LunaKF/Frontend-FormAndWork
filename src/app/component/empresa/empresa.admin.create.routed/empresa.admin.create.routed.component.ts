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
  oEmpresaForm: FormGroup | undefined = undefined;
  oEmpresa: IEmpresa | null = null;
  strMessage: string = '';

  myModal: any;

  form: FormGroup = new FormGroup({});

  constructor(
    private oEmpresaService: EmpresaService,
    private oRouter: Router
  ) {}

  ngOnInit() {
    this.createForm();
    this.oEmpresaForm?.markAllAsTouched();
  }

  createForm() {
    this.oEmpresaForm = new FormGroup({
      id: new FormControl(''),

      nombre: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),
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
    this.oEmpresaForm?.controls['nombre'].setValue('');
    this.oEmpresaForm?.controls['apellido1'].setValue('');
    this.oEmpresaForm?.controls['apellido2'].setValue('');
    this.oEmpresaForm?.controls['email'].setValue('');
    this.oEmpresaForm?.controls['id_tipoEmpresa'].setValue('');
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
    if (this.oEmpresaForm?.invalid) {
      this.showModal('Formulario inválido');
      return;
    } else {      
      this.oEmpresaService.create(this.oEmpresaForm?.value).subscribe({
        next: (oEmpresa: IEmpresa) => {
          this.oEmpresa = oEmpresa;
          this.showModal('Empresa creado con el id: ' + this.oEmpresa.id);
        },
        error: (err) => {
          this.showModal('Error al crear el Empresa');
          console.log(err);
        },
      });
    }
  }

}