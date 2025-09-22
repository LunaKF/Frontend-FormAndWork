import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { OfertaService } from '../../../service/oferta.service';
import { IOferta } from '../../../model/oferta.interface';
import { ISector } from '../../../model/sector.interface';
import { EmpresaAdminSelectorUnroutedComponent } from '../../empresa/empresa.admin.selector.unrouted/empresa.admin.selector.unrouted.component';
import { SectorAdminSelectorUnroutedComponent } from '../../sector/sector.admin.selector.unrouted/sector.admin.selector.unrouted.component';

declare let bootstrap: any;

@Component({
  selector: 'app-oferta.admin.edit.routed',
  standalone: true,
  templateUrl: './oferta.admin.edit.routed.component.html',
  styleUrls: ['./oferta.admin.edit.routed.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    SectorAdminSelectorUnroutedComponent,
    EmpresaAdminSelectorUnroutedComponent,
  ],
})
export class OfertaAdminEditRoutedComponent implements OnInit {

  id = 0;

  // Form sencillo: SOLO lo editable
  oOfertaForm = new FormGroup({
    titulo: new FormControl<string>('', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]),
    descripcion: new FormControl<string>('', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]),
    sectorId: new FormControl<number | null>(null, Validators.required),
  });

  // Datos para mostrar (no se editan)
  oOferta: IOferta | null = null;
  empresaNombre = '';
  empresaEmail = '';
  sectorNombre = '';

  // UI
  loading = true;
  strMessage = '';
  myModal: any;

  readonly dialog = inject(MatDialog);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly ofertaService: OfertaService,
    private readonly router: Router
  ) {
    this.route.params.subscribe(p => this.id = +p['id']);
  }

  ngOnInit(): void {
    this.cargar();
  }

  private cargar() {
    this.loading = true;
    this.ofertaService.get(this.id).subscribe({
      next: (o: IOferta) => {
        this.oOferta = o;

        // Relleno del form (solo lo editable)
        this.oOfertaForm.patchValue({
          titulo: o.titulo ?? '',
          descripcion: o.descripcion ?? '',
          sectorId: o.sector?.id ?? null
        });

        // Datos de solo lectura
        this.empresaNombre = o.empresa?.nombre ?? '';
        this.empresaEmail = o.empresa?.email ?? '';
        this.sectorNombre = o.sector?.nombre ?? '';

        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
        this.showModal('No se pudo cargar la oferta.');
      }
    });
  }

  // Selector de sector (sí se permite cambiar)
  showSectorSelectorModal() {
    const dialogRef = this.dialog.open(SectorAdminSelectorUnroutedComponent, {
      height: '800px',
      width: '80%',
      maxWidth: '90%',
      data: {}
    });

    dialogRef.afterClosed().subscribe((result: ISector | undefined) => {
      if (!result) return;
      this.oOfertaForm.patchValue({ sectorId: result.id });
      this.sectorNombre = result.nombre;
    });

    return false;
  }

  onReset() {
    if (!this.oOferta) return false;
    this.oOfertaForm.patchValue({
      titulo: this.oOferta.titulo ?? '',
      descripcion: this.oOferta.descripcion ?? '',
      sectorId: this.oOferta.sector?.id ?? null
    });
    this.sectorNombre = this.oOferta.sector?.nombre ?? '';
    return false;
  }

  onSubmit() {
    if (!this.oOferta || this.oOfertaForm.invalid) {
      this.showModal('Formulario no válido');
      return;
    }

    const { titulo, descripcion, sectorId } = this.oOfertaForm.getRawValue();

    // Construimos payload forzando id y empresa ORIGINAL
    const payload: IOferta = {
      ...this.oOferta,
      titulo: titulo ?? '',
      descripcion: descripcion ?? '',
      sector: { ...(this.oOferta.sector ?? {}), id: sectorId! },
      empresa: this.oOferta.empresa, // inmutable
      id: this.oOferta.id            // inmutable
    };

    this.ofertaService.update(payload).subscribe({
      next: oUpd => {
        this.oOferta = oUpd;
        this.showModal(`Oferta ${oUpd.id} actualizada correctamente`);
      },
      error: err => {
        console.error(err);
        this.showModal('Error al actualizar la oferta');
      }
    });
  }

  showModal(msg: string) {
    this.strMessage = msg;
    const el = document.getElementById('mimodal');
    if (!el) return;
    this.myModal = new bootstrap.Modal(el, { keyboard: false });
    this.myModal.show();
  }

  hideModal = () => {
    this.myModal?.hide();
    if (this.oOferta?.id) this.router.navigate(['/admin/oferta/view', this.oOferta.id]);
  };
}
