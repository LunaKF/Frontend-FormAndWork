import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  selector: 'app-forbidden',
  template: `
  <section class="container">
    <h1>Acceso denegado (403)</h1>
    <p>No tienes permisos para ver esta página.</p>
    <div class="actions">
      <a routerLink="/" class="btn alt">Ir al inicio</a>
    </div>
  </section>
  `,
  styles: [`
    .container{max-width:760px;margin:4rem auto;padding:2rem;border-radius:1rem;box-shadow:0 10px 30px rgba(0,0,0,.08)}
    h1{color:#3c10d0;margin:0 0 1rem}
    .actions{display:flex;gap:1rem;margin-top:1.5rem}
    .btn{padding:.7rem 1.1rem;border-radius:.7rem;background:#3c10d0;color:#fff;text-decoration:none}
    .btn.alt{background:#f3b34c;color:#222}
  `]
})
export default class ForbiddenComponent {}
