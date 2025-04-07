import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ICandidatura } from '../../../model/candidatura.interface';
import { CandidaturaService } from '../../../service/candidatura.service';

declare let bootstrap: any;
@Component({
  selector: 'app-candidatura.admin.delete.routed',
  templateUrl: './candidatura.admin.delete.routed.component.html',
  styleUrls: ['./candidatura.admin.delete.routed.component.css'],
  standalone: true,
  imports: [RouterModule],
})
export class CandidaturaAdminDeleteRoutedComponent implements OnInit {
 
  oCandidatura: ICandidatura | null = null;
  strMessage: string = '';
  myModal: any;
  constructor(
    private oCandidaturaService: CandidaturaService,
    private oActivatedRoute: ActivatedRoute,
    private oRouter: Router
  ) {}

  ngOnInit(): void {
    let id = this.oActivatedRoute.snapshot.params['id'];
    this.oCandidaturaService.get(id).subscribe({
      next: (oCandidatura: ICandidatura) => {
        this.oCandidatura = oCandidatura;
      },
      error: (err) => {
        this.showModal('Error al cargar los datos de la candidatura');
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
    this.oCandidaturaService.delete(this.oCandidatura!.id).subscribe({
      next: (data) => {
        this.showModal(
          'Candidatura con id ' + this.oCandidatura!.id + ' ha sido borrado'
        );
      },
      error: (error) => {
        this.showModal('Error al borrar la candidatura');
      },
    });
  }

  hideModal = () => {
    this.myModal.hide();
    this.oRouter.navigate(['/admin/candidatura/plist']);
  }
  
}