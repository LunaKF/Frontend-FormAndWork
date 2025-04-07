import { IEmpresa } from '../../../model/empresa.interface';
import { Component, inject, OnInit } from '@angular/core';
import { BotoneraService } from '../../../service/botonera.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { TrimPipe } from '../../../pipe/trim.pipe';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IPage } from '../../../model/model.interface';
import { ISector } from '../../../model/sector.interface';
import { SectorService } from '../../../service/sector.service';

@Component({
  selector: 'app-sector.admin.selector.unrouted',
  templateUrl: './sector.admin.selector.unrouted.component.html',
  styleUrls: ['./sector.admin.selector.unrouted.component.css'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class SectorAdminSelectorUnroutedComponent implements OnInit {

  oSector: ISector[] = [];
  filteredSectors: ISector[] = []; // Array para los sectores filtrados
  searchText: string = ''; // Campo para almacenar el texto de búsqueda


  readonly dialogRef = inject(MatDialogRef<SectorAdminSelectorUnroutedComponent>);
  readonly data = inject(MAT_DIALOG_DATA);

  constructor(
    private oSectorService: SectorService,
    private oRouter: Router
  ) { }

  ngOnInit() {
    this.oSectorService.getAll().subscribe({
      next: (data: ISector[]) => {
        this.oSector = data;
        this.filteredSectors = data; // Inicializamos con todos los sectores
      },
      error: (err) => {
        console.error('Error al obtener sectores:', err.message || err);
      }
    });
  }
  getAll() {
    this.oSectorService.getAll().subscribe({
      next: (data: ISector[]) => {
        this.oSector = data;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
  // Método para filtrar sectores por nombre
  filterSectors() {
    if (this.searchText) {
      this.filteredSectors = this.oSector.filter(sector =>
        sector.nombre.toLowerCase().includes(this.searchText.toLowerCase())
      );
    } else {
      this.filteredSectors = this.oSector; // Si no hay texto, mostramos todos los sectores
    }
  }
  trackByNombre(index: number, sector: ISector): string {
    return sector.nombre; // Usamos el nombre para el trackBy
  }


  // Método para seleccionar un sector
  select(oSector: ISector) {
    oSector = { ...oSector };
    this.dialogRef.close(oSector); // Cierra el modal y pasa el sector seleccionado
  }
}

