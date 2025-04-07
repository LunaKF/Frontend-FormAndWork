import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IOferta } from '../../../model/oferta.interface';
import { OfertaService } from '../../../service/oferta.service';

declare let bootstrap: any;

@Component({
  selector: 'app-oferta.admin.delete.routed',
  templateUrl: './oferta.admin.delete.routed.component.html',
  styleUrls: ['./oferta.admin.delete.routed.component.css'],
  standalone: true,
  imports: [RouterModule],
})
export class OfertaAdminDeleteRoutedComponent implements OnInit {
oOferta: IOferta | null = null;
  strMessage: string = '';
  myModal: any;
  constructor(
    private oOfertaService: OfertaService,
    private oActivatedRoute: ActivatedRoute,
    private oRouter: Router
  ) {}

  ngOnInit(): void {
    let id = this.oActivatedRoute.snapshot.params['id'];
    this.oOfertaService.get(id).subscribe({
      next: (oOferta: IOferta) => {
        this.oOferta = oOferta;
      },
      error: (err) => {
        this.showModal('Error al cargar los datos de la oferta');
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
    this.oOfertaService.delete(this.oOferta!.id).subscribe({
      next: (data) => {
        this.showModal(
          'Oferta con id ' + this.oOferta!.id + ' ha sido borrada'
        );
      },
      error: (error) => {
        this.showModal('Error al borrar la oferta');
      },
    });
  }

  hideModal = () => {
    this.myModal.hide();
    this.oRouter.navigate(['/admin/oferta/plist']);
  }
  
}