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
import { IOferta } from '../../../model/oferta.interface';
import { OfertaService } from '../../../service/oferta.service';
import { EmpresaAdminSelectorUnroutedComponent } from '../../empresa/empresa.admin.selector.unrouted/empresa.admin.selector.unrouted.component';
import { MatDialog } from '@angular/material/dialog';
import { ISector } from '../../../model/sector.interface';
import { CommonModule } from '@angular/common';
import { SectorService } from '../../../service/sector.service';
import { interval } from 'rxjs';
import { IEmpresa } from '../../../model/empresa.interface';
import { SectorAdminSelectorUnroutedComponent } from '../../sector/sector.admin.selector.unrouted/sector.admin.selector.unrouted.component';

declare let bootstrap: any;

@Component({
  selector: 'app-oferta.admin.create.routed',
  templateUrl: './oferta.admin.create.routed.component.html',
  styleUrls: ['./oferta.admin.create.routed.component.css'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    RouterModule,
    CommonModule
  ],
})
export class OfertaAdminCreateRoutedComponent implements OnInit {


  id: number = 0;
  oOfertaForm: FormGroup | undefined = undefined;
  oOferta: IOferta | null = null;
  strMessage: string = '';
  readonly dialog = inject(MatDialog);
  oSector: ISector = {} as ISector;
  myModal: any;
  oEmpresa: IEmpresa = {} as IEmpresa;
  form: FormGroup = new FormGroup({});


  constructor(
    private oOfertaService: OfertaService,
    private oSectorService: SectorService,
    private oRouter: Router
  ) {
    this.oOfertaForm = new FormGroup({
      id: new FormControl(''),

      titulo: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(255),
      ]),
      sector: new FormControl('', Validators.required),
      empresa: new FormControl('', Validators.required),
    });
  }

  ngOnInit() {
    this.createForm();

    this.oOfertaForm?.controls['sector'].valueChanges.subscribe(value => {
      if (value) {
        if (value.id) {
          this.oSectorService.get(value.id).subscribe({
            next: (oSector: ISector) => {
              this.oSector = oSector;
            },
            error: (error) => {
              console.error(error);
              this.oSector = {} as ISector;
              this.oOfertaForm?.controls['sector'].setErrors({ invalid: true });
            }
          });
        } else {
          this.oSector = {} as ISector;
        }
      }
    });
  }

  createForm() {
    this.oOfertaForm = new FormGroup({
      id: new FormControl(''),

      titulo: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(255),
      ]),

      descripcion: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(255),
      ]),

      sector: new FormGroup({
        id: new FormControl('', Validators.required),
        nombre: new FormControl('', Validators.required),
        empresas: new FormControl('', Validators.required),
        alumnos: new FormControl('', Validators.required),

      }),

      empresa: new FormGroup({
        id: new FormControl('', Validators.required),
        nombre: new FormControl('', Validators.required),
        email: new FormControl('', Validators.required),
        sector: new FormGroup({
          id: new FormControl('', Validators.required),
          nombre: new FormControl('', Validators.required),
          empresas: new FormControl('', Validators.required),
          alumnos: new FormControl('', Validators.required),
        })
      }),

    });
  }

  updateForm() {
    this.oOfertaForm?.controls['titulo'].setValue('');
    this.oOfertaForm?.controls['descripcion'].setValue("");
    this.oOfertaForm?.controls['sector'].setValue({
      id: null,
      nombre: null,
    });
    this.oOfertaForm?.controls['empresa'].setValue({
      id: null,
      nombre: null,
      email: null,
      sector: {
        id: null,
        nombre: null,
      }
    });
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
    this.oRouter.navigate(['/admin/oferta/view/' + this.oOferta?.id]);
  }

  onSubmit() {
    if (this.oOfertaForm?.invalid) {
      this.showModal('Formulario inválido');
      return;
    } else {
      console.log(this.oOfertaForm?.value);
      this.oOfertaService.create(this.oOfertaForm?.value).subscribe({
        next: (oOferta: IOferta) => {
          this.oOferta = oOferta;
          this.showModal('Oferta creada con el id: ' + this.oOferta.id);
        },
        error: (err) => {
          this.showModal('Error al crear la Oferta');
          console.log(err);
        },
      });
    }
  }

  showSectorSelectorModal() {
    const dialogRef = this.dialog.open(SectorAdminSelectorUnroutedComponent, {
      height: '700px',
      maxHeight: '1200px',
      width: '90%',
      maxWidth: '90%',
      data: { origen: '', sector: '' },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result !== undefined) {
        console.log(result);
        this.oSector = result;
        this.oOfertaForm?.controls['sector'].setValue(this.oSector);
        console.log(this.oOfertaForm?.value);
      }
    });
    return false;
  }

  showEmpresaSelectorModal() {
    const dialogRef = this.dialog.open(EmpresaAdminSelectorUnroutedComponent, {
      height: '700px',
      maxHeight: '1200px',
      width: '90%',
      maxWidth: '90%',
      data: { origen: '', empresa: '' },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result !== undefined) {
        console.log(result);
        this.oEmpresa = result;
        this.oOfertaForm?.controls['empresa'].setValue(this.oEmpresa);
        console.log(this.oOfertaForm?.value);
      }
    });
    return false;
  }

}