import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { ISector } from '../../../model/sector.interface';
import { IPage } from '../../../model/model.interface';
import { BotoneraService } from '../../../service/botonera.service';
import { SectorService } from '../../../service/sector.service';
import { TrimPipe } from "../../../pipe/trim.pipe";



@Component({
  selector: 'app-sector.admin.plist.routed',
  templateUrl: './sector.admin.plist.routed.component.html',
  styleUrls: ['./sector.admin.plist.routed.component.css'],
  standalone: true,
  imports: [TrimPipe, CommonModule, FormsModule, RouterModule],
})
export class SectorAdminPlistRoutedComponent implements OnInit {

  oSector: ISector[] = [];


  constructor(
    private oSectorService: SectorService,
    private oRouter: Router
  ) {}
  ngOnInit() {
    this.oSectorService.getAll().subscribe({
      next: (data: ISector[]) => {
        this.oSector = data;
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

  trackById(index: number, item: ISector): number {
    return item.id;
  }

  edit(oSector: ISector) {
    this.oRouter.navigate(['sector', 'edit', oSector.id]);
  }

  remove(oSector: ISector) {
    this.oRouter.navigate(['sector', 'delete', oSector.id]);
  }


  view(oSector: ISector) {
    this.oRouter.navigate(['sector', 'view', oSector.id]);
  }
}
