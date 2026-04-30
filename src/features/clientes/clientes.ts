import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ClienteService } from '../../app/core/services/cliente.service';
import { Cliente } from '../../app/core/models/cliente.model';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [],
  templateUrl: './clientes.html'
})
export class Clientes implements OnInit {
  private clienteService = inject(ClienteService);
  private router = inject(Router);

  clientes = signal<Cliente[]>([]);
  busqueda = signal('');
  loading = signal(false);
  errorMessage = signal('');

  clientesFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    if (!q) return this.clientes();
    return this.clientes().filter(c =>
      c.nombre.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.telefono?.toLowerCase().includes(q)
    );
  });

  // Confirmación
  confirmando = signal(false);
  confirmMsg = signal('');
  pendingDeleteId = signal<string | null>(null);

  ngOnInit(): void { this.cargarClientes(); }

  cargarClientes(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.clienteService.getAll().subscribe({
      next: (data) => { this.clientes.set(data); this.loading.set(false); },
      error: () => { this.errorMessage.set('Error al cargar los clientes.'); this.loading.set(false); }
    });
  }

  solicitarEliminar(id: string, nombre: string): void {
    this.pendingDeleteId.set(id);
    this.confirmMsg.set(`¿Estás seguro de eliminar al cliente "${nombre}"? Esta acción no se puede deshacer.`);
    this.confirmando.set(true);
  }

  confirmarEliminar(): void {
    const id = this.pendingDeleteId();
    if (!id) return;
    this.confirmando.set(false);
    this.clienteService.delete(id).subscribe({
      next: () => this.clientes.update(lista => lista.filter(c => c.id !== id)),
      error: () => this.errorMessage.set('Error al eliminar el cliente.')
    });
  }

  cancelarEliminar(): void {
    this.confirmando.set(false);
    this.pendingDeleteId.set(null);
  }

  irACrear(): void { this.router.navigate(['/clientes/nuevo']); }
  irAEditar(id: string): void { this.router.navigate(['/clientes', id, 'editar']); }
  irAHistorial(id: string): void { this.router.navigate(['/clientes', id, 'historial']); }
}
