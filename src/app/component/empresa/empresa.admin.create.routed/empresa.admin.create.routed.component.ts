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
import { IEmpresa } from '../../../model/empresa.interface';
import { EmpresaService } from '../../../service/empresa.service';
import { SectorAdminSelectorUnroutedComponent } from '../../sector/sector.admin.selector.unrouted/sector.admin.selector.unrouted.component';
import { MatDialog } from '@angular/material/dialog';
import { ISector } from '../../../model/sector.interface';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../../service/session.service';

declare let bootstrap: any;

@Component({
  selector: 'app-empresa.admin.create.routed',
  templateUrl: './empresa.admin.create.routed.component.html',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    RouterModule,
    CommonModule,
  ],
  styleUrls: ['./empresa.admin.create.routed.component.css'],
})
export class EmpresaAdminCreateRoutedComponent implements OnInit {
  id: number = 0;
  oEmpresaForm: FormGroup | undefined = undefined;
  oEmpresa: IEmpresa | null = null;
  strMessage: string = '';
  readonly dialog = inject(MatDialog);
  oSector: ISector = {} as ISector;
  myModal: any;

  form: FormGroup = new FormGroup({}); // lo mantengo porque lo tienes

  // roles
  isAdmin = false;
  isEmpresa = false;
  isAlumno = false;

  loading = false;

  arrSectores: string[] = [
    "Administración y gestión", "Agraria", "Artes gráficas", "Artes y artesanías",
    "Comercio y marketing", "Electricidad y electrónica", "Energía y agua",
    "Fabricación mecánica", "Hostelería y turismo", "Imagen personal",
    "Imagen y sonido", "Informática y comunicaciones", "Instalación y mantenimiento",
    "Madera, mueble y corcho", "Marítimo-pesquera", "Química", "Sanidad",
    "Seguridad y medio ambiente", "Servicios socioculturales y a la comunidad",
    "Textil, confección y piel", "Transporte y mantenimiento de vehículos", "Vidrio y cerámica"
  ];

  constructor(
    private oEmpresaService: EmpresaService,
    private oRouter: Router,
    private oSessionService: SessionService
  ) {
    // rol inicial (como en edit)
    const tipo = (this.oSessionService.getSessionTipoUsuario() || '')
      .toLowerCase()
      .trim();
    this.isAdmin = (tipo === 'admin' || tipo === 'administrador');
    this.isEmpresa = (tipo === 'empresa');
    this.isAlumno = (tipo === 'alumno');
  }

  ngOnInit() {
    this.createForm();
    this.oEmpresaForm?.markAllAsTouched();

    // por si cambia la sesión en caliente
    this.oSessionService.onLogin().subscribe({
      next: () => {
        const tipo = (this.oSessionService.getSessionTipoUsuario() || '')
          .toLowerCase()
          .trim();
        this.isAdmin = (tipo === 'admin' || tipo === 'administrador');
        this.isEmpresa = (tipo === 'empresa');
        this.isAlumno = (tipo === 'alumno');
      },
    });

    this.oSessionService.onLogout().subscribe({
      next: () => {
        this.isAdmin = this.isEmpresa = this.isAlumno = false;
      },
    });
  }

  createForm() {
    this.oEmpresaForm = new FormGroup({
      id: new FormControl(''), // create: vacío

      nombre: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),

      email: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.minLength(5),
        Validators.maxLength(100),
      ]),

      // ✅ Igual que edit (sector como sub-formGroup)
      sector: new FormGroup({
        id: new FormControl('', Validators.required),
        nombre: new FormControl('', Validators.required),
      }),
    });
  }

  updateForm() {
    // “reset bonito”
    this.oEmpresaForm?.reset();
    this.oSector = {} as ISector;

    // dejamos estructura sector en blanco pero válida de tipo
    this.oEmpresaForm?.get('sector')?.patchValue({ id: '', nombre: '' });
    return;
  }

  showModal(mensaje: string) {
    this.strMessage = mensaje;
    const modalElement = document.getElementById('mimodal');
    if (!modalElement) {
      console.error('Error: No se encontró el modal en el DOM');
      return;
    }

    this.myModal = new bootstrap.Modal(modalElement, {
      backdrop: 'static',
      keyboard: false,
    });

    this.myModal.show();
  }

  onReset() {
    this.updateForm();
    return false;
  }

  hideModal = () => {
    this.myModal?.hide();

    // si ya creó → ir a view, si no → volver al plist
    if (this.oEmpresa?.id) {
      this.oRouter.navigate(['/admin/empresa/view/' + this.oEmpresa.id]);
    } else {
      this.oRouter.navigate(['/admin/empresa/plist']);
    }
  };

  onSubmit() {
    if (this.oEmpresaForm?.invalid) {
      this.showModal('Formulario inválido');
      return;
    }

    // ⚠️ create: NO mandamos password desde aquí si tu backend ya lo gestiona.
    // Si tu backend exige password en create, dímelo y lo añadimos a este form.

    this.oEmpresaService.create(this.oEmpresaForm?.value).subscribe({
      next: (oEmpresa: IEmpresa) => {
        this.oEmpresa = oEmpresa;
        this.showModal('Empresa creada con el id: ' + this.oEmpresa.id);
      },
      error: (err) => {
        this.showModal('Error al crear la Empresa');
        console.log(err);
      },
    });
  }

  showSectorSelectorModal() {
    const dialogRef = this.dialog.open(SectorAdminSelectorUnroutedComponent, {
      height: '700px',
      maxHeight: '1200px',
      width: '90%',
      maxWidth: '90%',
      data: { origen: '', sector: '' },
      panelClass: 'custom-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        this.oSector = result;

        // ✅ Igual que edit: rellenamos el subgrupo sector
        this.oEmpresaForm?.get('sector')?.patchValue({
          id: this.oSector.id,
          nombre: this.oSector.nombre,
        });
      }
    });
    return false;
  }
}
