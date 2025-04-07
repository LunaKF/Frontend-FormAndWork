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
import { IOferta } from '../../../model/oferta.interface';
import { OfertaService } from '../../../service/oferta.service';
import { SectorAdminSelectorUnroutedComponent } from '../../sector/sector.admin.selector.unrouted/sector.admin.selector.unrouted.component';
import { MatDialog } from '@angular/material/dialog';
import { ISector } from '../../../model/sector.interface';
import { CommonModule } from '@angular/common';
import { EmpresaAdminSelectorUnroutedComponent } from '../../empresa/empresa.admin.selector.unrouted/empresa.admin.selector.unrouted.component';
import { IEmpresa } from '../../../model/empresa.interface';

declare let bootstrap: any;

@Component({
  selector: 'app-oferta.admin.edit.routed',
  templateUrl: './oferta.admin.edit.routed.component.html',
  styleUrls: ['./oferta.admin.edit.routed.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    RouterModule,
    SectorAdminSelectorUnroutedComponent,
    EmpresaAdminSelectorUnroutedComponent,
  ],
})
export class OfertaAdminEditRoutedComponent implements OnInit {

  id: number = 0;
  oOfertaForm!: FormGroup;
  oOferta: IOferta | null = null;
  oSector: ISector = {} as ISector;
  oEmpresa: IEmpresa = {} as IEmpresa;
  readonly dialog = inject(MatDialog);
  strMessage: string = '';
  myModal: any;

  constructor(
    private oActivatedRoute: ActivatedRoute,
    private oOfertaService: OfertaService,
    private oRouter: Router
  ) {
    this.oActivatedRoute.params.subscribe((params) => {
      this.id = +params['id'];
    });
  }

  ngOnInit() {
    this.createForm();
    this.get();
  }

  createForm() {
    this.oOfertaForm = new FormGroup({
      id: new FormControl(null, [Validators.required]),
      titulo: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]),
      descripcion: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]),

      sector: new FormGroup({
        id: new FormControl(null, Validators.required),
        nombre: new FormControl('', Validators.required),
        empresas: new FormControl('', Validators.required),
        alumnos: new FormControl('', Validators.required),
      }),

      empresa: new FormGroup({
        id: new FormControl(null, Validators.required),
        nombre: new FormControl('', Validators.required),
        email: new FormControl('', Validators.required),
        sector: new FormGroup({
          id: new FormControl(null, Validators.required),
          nombre: new FormControl('', Validators.required),
          empresas: new FormControl('', Validators.required),
          alumnos: new FormControl('', Validators.required),
        }),
      }),
    });
  }

  updateForm() {
    if (!this.oOferta || !this.oOfertaForm) return;

    this.oOfertaForm.setValue({
      id: this.oOferta.id,
      titulo: this.oOferta.titulo,
      descripcion: this.oOferta.descripcion,
      sector: this.oOferta.sector,
      empresa: this.oOferta.empresa,
    });
  }

  onReset() {
    this.updateForm();
    return false;
  }

  get() {
    this.oOfertaService.get(this.id).subscribe({
      next: (oOferta: IOferta) => {
        this.oOferta = oOferta;
        this.updateForm();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  showModal(mensaje: string) {
    this.strMessage = mensaje;
    const modalElement = document.getElementById('mimodal');
    if (!modalElement) {
      console.error('No se encontró el modal en el DOM');
      return;
    }
    this.myModal = new bootstrap.Modal(modalElement, { keyboard: false });
    this.myModal.show();
  }

  hideModal = () => {
    this.myModal.hide();
    this.oRouter.navigate(['/admin/oferta/view/' + this.oOferta?.id]);
  };

  onSubmit() {
    if (!this.oOfertaForm.valid) {
      this.showModal('Formulario no válido');
      return;
    }

    this.oOfertaService.update(this.oOfertaForm.value).subscribe({
      next: (oOferta: IOferta) => {
        this.oOferta = oOferta;
        this.updateForm();
        this.showModal('Oferta ' + this.oOferta.id + ' actualizada correctamente');
      },
      error: (error) => {
        this.showModal('Error al actualizar la oferta');
        console.error(error);
      },
    });
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
      if (result !== undefined) {
        this.oSector = result;
        this.oOfertaForm.controls['sector'].setValue(this.oSector);
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
      if (result !== undefined) {
        this.oEmpresa = result;
        this.oOfertaForm.controls['empresa'].setValue(this.oEmpresa);
      }
    });

    return false;
  }

}
