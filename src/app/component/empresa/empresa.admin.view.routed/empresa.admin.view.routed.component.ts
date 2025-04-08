import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IEmpresa } from "../../../model/empresa.interface"
import { EmpresaService } from "../../../service/empresa.service"
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-empresa.admin.view.routed',
    templateUrl: './empresa.admin.view.routed.component.html',
    styleUrls: ['./empresa.admin.view.routed.component.css'],
    imports: [CommonModule], // Aquí importas CommonModule
    standalone: true
})
export class EmpresaAdminViewRoutedComponent implements OnInit {
  //
  id: number = 0;
  route: string = '';
  oEmpresa: IEmpresa = { id: 0, nombre: '', email: '', sector: { id: 0, nombre: '' , alumnos: 0, empresas: 0, ofertas: 0 } };

  //
  constructor(private oActivatedRoute: ActivatedRoute, private oEmpresaService: EmpresaService) { }

  ngOnInit() {
    this.id = this.oActivatedRoute.snapshot.params['id'];

    //llamada al servicio
    this.getOne();
  }

  getOne() {
    this.oEmpresaService.getOne(this.id).subscribe({
      next: (data: IEmpresa) => {
        this.oEmpresa = data;
      },
    });
  }
}
