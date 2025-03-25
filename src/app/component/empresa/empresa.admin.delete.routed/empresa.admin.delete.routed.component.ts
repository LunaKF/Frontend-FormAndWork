import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { IEmpresa } from '../../../model/empresa.interface';
import { EmpresaService } from '../../../service/empresa.service';

declare let bootstrap: any;
@Component({
    selector: 'app-empresa.admin.delete.routed',
    templateUrl: './empresa.admin.delete.routed.component.html',
    styleUrls: ['./empresa.admin.delete.routed.component.css'],
    standalone: true,
    imports: [RouterModule],
})
export class EmpresaAdminDeleteRoutedComponent implements OnInit {
  oEmpresa: IEmpresa | null = null;
  strMessage: string = '';
  myModal: any;
  constructor(
    private oEmpresaService: EmpresaService,
    private oActivatedRoute: ActivatedRoute,
    private oRouter: Router
  ) {}

  ngOnInit(): void {
    let id = this.oActivatedRoute.snapshot.params['id'];
    this.oEmpresaService.get(id).subscribe({
      next: (oEmpresa: IEmpresa) => {
        this.oEmpresa = oEmpresa;
      },
      error: (err) => {
        this.showModal('Error al cargar los datos de la empresa');
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
    this.oEmpresaService.delete(this.oEmpresa!.id).subscribe({
      next: (data) => {
        this.showModal(
          'Empresa con id ' + this.oEmpresa!.id + ' ha sido borrado'
        );
      },
      error: (error) => {
        this.showModal('Error al borrar la empresa');
      },
    });
  }

  hideModal = () => {
    this.myModal.hide();
    this.oRouter.navigate(['/admin/empresa/plist']);
  }
  
}