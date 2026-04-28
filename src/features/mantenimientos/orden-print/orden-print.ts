import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MantenimientoService } from '../../../app/core/services/mantenimiento.service';
import { Mantenimiento } from '../../../app/core/models/mantenimiento.model';

@Component({
  selector: 'app-orden-print',
  standalone: true,
  imports: [DatePipe, CurrencyPipe],
  templateUrl: './orden-print.html'
})
export class OrdenPrint implements OnInit {
  private mantenimientoService = inject(MantenimientoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  orden = signal<Mantenimiento | null>(null);
  loading = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/mantenimientos']); return; }

    this.mantenimientoService.getById(id).subscribe({
      next: (m) => { this.orden.set(m); this.loading.set(false); },
      error: () => { this.errorMessage.set('No se pudo cargar la orden.'); this.loading.set(false); }
    });
  }

  imprimir(): void { window.print(); }
  volver(): void { this.router.navigate(['/mantenimientos']); }
}
