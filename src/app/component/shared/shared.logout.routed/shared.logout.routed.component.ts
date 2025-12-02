import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../../../service/session.service';

@Component({
  selector: 'app-shared.logout.routed',
  templateUrl: './shared.logout.routed.component.html',
  styleUrls: ['./shared.logout.routed.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SharedLogoutRoutedComponent implements OnInit {

  errorMessage: string | null = null;

  constructor(
    private oSessionService: SessionService,
    private oRouter: Router
  ) {}

  ngOnInit(): void {}

  onLogout(): void {
    try {
      this.oSessionService.logout();
      this.oRouter.navigate(['/']);
    } catch (e) {
      console.error(e);
      this.errorMessage = 'Ha ocurrido un error al cerrar sesión. Inténtalo de nuevo.';
    }
  }

  onCancel(): void {
    this.oRouter.navigate(['/']);
  }
}
