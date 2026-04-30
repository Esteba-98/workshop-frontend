import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { VehiculoService } from '../../app/core/services/vehiculo.service';
import { ClienteService } from '../../app/core/services/cliente.service';
import { AuthService } from '../../app/core/services/auth.service';
import { Vehiculo } from '../../app/core/models/vehiculo.model';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [],
  templateUrl: './vehiculos.html'
})
export class Vehiculos implements OnInit {
  private vehiculoService = inject(VehiculoService);
  private clienteService = inject(ClienteService);
  private authService = inject(AuthService);
  private router = inject(Router);

  vehiculos = signal<Vehiculo[]>([]);
  clienteMap = signal<Map<string, string>>(new Map());
  loading = signal(false);
  errorMessage = signal('');
  canEdit = signal(false);
  canDelete = signal(false);
  busqueda = signal('');
  confirmando = signal(false);
  confirmMsg = signal('');
  pendingDeleteId = signal<string | null>(null);

  vehiculosFiltrados = computed(() => {
    const term = this.busqueda().toLowerCase();
    if (!term) return this.vehiculos();
    return this.vehiculos().filter(v =>
      v.placa.toLowerCase().includes(term) ||
      v.marca.toLowerCase().includes(term) ||
      v.modelo.toLowerCase().includes(term) ||
      String(v.anio).includes(term)
    );
  });

  ngOnInit(): void {
    this.canEdit.set(this.authService.hasAnyRole(['Administrador', 'User']));
    this.canDelete.set(this.authService.hasRole('Administrador'));
    this.loading.set(true);

    forkJoin({
      vehiculos: this.vehiculoService.getAll(),
      clientes: this.clienteService.getAll()
    }).subscribe({
      next: ({ vehiculos, clientes }) => {
        this.vehiculos.set(vehiculos);
        const map = new Map(clientes.map(c => [c.id, c.nombre]));
        this.clienteMap.set(map);
        this.loading.set(false);
      },
      error: () => { this.errorMessage.set('Error al cargar los vehículos.'); this.loading.set(false); }
    });
  }

  nombreCliente(clienteId: string): string {
    return this.clienteMap().get(clienteId) ?? '—';
  }

  solicitarEliminar(id: string, placa: string): void {
    this.pendingDeleteId.set(id);
    this.confirmMsg.set(`¿Estás seguro de eliminar el vehículo con placa "${placa}"? Esta acción no se puede deshacer.`);
    this.confirmando.set(true);
  }

  confirmarEliminar(): void {
    const id = this.pendingDeleteId();
    if (!id) return;
    this.confirmando.set(false);
    this.vehiculoService.delete(id).subscribe({
      next: () => this.vehiculos.update(lista => lista.filter(v => v.id !== id)),
      error: () => this.errorMessage.set('Error al eliminar el vehículo.')
    });
  }

  cancelarEliminar(): void {
    this.confirmando.set(false);
    this.pendingDeleteId.set(null);
  }

  irACrear(): void { this.router.navigate(['/vehiculos/nuevo']); }
  irAEditar(id: string): void { this.router.navigate(['/vehiculos', id, 'editar']); }
  irAMantenimiento(vehiculoId: string): void { this.router.navigate(['/mantenimientos/nuevo'], { queryParams: { vehiculoId } }); }
  irAHistorial(id: string): void { this.router.navigate(['/vehiculos', id, 'historial']); }
}
