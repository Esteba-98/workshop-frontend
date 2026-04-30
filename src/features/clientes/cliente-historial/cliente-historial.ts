import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ClienteService } from '../../../app/core/services/cliente.service';
import { ClienteHistorial } from '../../../app/core/models/historial.model';

@Component({
  selector: 'app-cliente-historial',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './cliente-historial.html'
})
export class ClienteHistorialComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clienteService = inject(ClienteService);

  loading = signal(true);
  historial = signal<ClienteHistorial | null>(null);
  errorMessage = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/clientes']); return; }

    this.clienteService.getHistorial(id).subscribe({
      next: (data) => { this.historial.set(data); this.loading.set(false); },
      error: () => { this.errorMessage.set('No se pudo cargar el historial.'); this.loading.set(false); }
    });
  }

  badgeClass(estado: string): string {
    const map: Record<string, string> = {
      'Pendiente':  'bg-yellow-100 text-yellow-700',
      'En Proceso': 'bg-blue-100 text-blue-700',
      'Completado': 'bg-green-100 text-green-700',
      'Cancelado':  'bg-red-100 text-red-600',
    };
    return map[estado] ?? 'bg-slate-100 text-slate-600';
  }

  verOrden(id: string): void {
    this.router.navigate(['/mantenimientos', id, 'editar']);
  }

  verHistorialVehiculo(vehiculoId: string): void {
    this.router.navigate(['/vehiculos', vehiculoId, 'historial']);
  }
}
