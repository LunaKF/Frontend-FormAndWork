import { Component, inject, OnInit } from '@angular/core';
import { BotoneraService } from '../../../service/botonera.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { TrimPipe } from '../../../pipe/trim.pipe';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IPage } from '../../../model/model.interface';
import { IEmpresa } from '../../../model/empresa.interface';
import { EmpresaService } from '../../../service/empresa.service';

@Component({
  selector: 'app-empresa.admin.selector.unrouted',
  templateUrl: './empresa.admin.selector.unrouted.component.html',
  styleUrls: ['./empresa.admin.selector.unrouted.component.css'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class EmpresaAdminSelectorUnroutedComponent implements OnInit {

  oEmpresa: IEmpresa[] = [];
  filteredEmpresas: IEmpresa[] = []; // Array para los empresaes filtrados
  searchText: string = ''; // Campo para almacenar el texto de búsqueda


  readonly dialogRef = inject(MatDialogRef<EmpresaAdminSelectorUnroutedComponent>);
  readonly data = inject(MAT_DIALOG_DATA);

  constructor(
    private oEmpresaService: EmpresaService,
    private oRouter: Router
  ) { }

  ngOnInit() {
    this.oEmpresaService.getAll().subscribe({
      next: (data: IEmpresa[]) => {
        this.oEmpresa = data;
        this.filteredEmpresas = data; // Inicializamos con todos los empresaes
      },
      error: (err) => {
        console.error('Error al obtener empresas:', err.message || err);
      }
    });
  }
  getAll() {
    this.oEmpresaService.getAll().subscribe({
      next: (data: IEmpresa[]) => {
        this.oEmpresa = data;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
  // Método para filtrar empresaes por nombre
  filterEmpresas() {
    if (this.searchText) {
      this.filteredEmpresas = this.oEmpresa.filter(empresa =>
        empresa.nombre.toLowerCase().includes(this.searchText.toLowerCase())
      );
    } else {
      this.filteredEmpresas = this.oEmpresa; // Si no hay texto, mostramos todos los empresaes
    }
  }
  trackByNombre(index: number, empresa: IEmpresa): string {
    return empresa.nombre; // Usamos el nombre para el trackBy
  }


  // Método para seleccionar un empresa
  select(oEmpresa: IEmpresa) {
    oEmpresa = { ...oEmpresa };
    this.dialogRef.close(oEmpresa); // Cierra el modal y pasa el empresa seleccionado
  }
}

