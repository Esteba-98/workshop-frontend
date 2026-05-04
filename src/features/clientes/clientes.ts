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

  // Paginación
  paginaActual = signal(1);
  readonly tamano = 10;

  clientesFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    if (!q) return this.clientes();
    return this.clientes().filter(c =>
      c.nombre.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.telefono?.toLowerCase().includes(q)
    );
  });

  totalPaginas = computed(() => Math.max(1, Math.ceil(this.clientesFiltrados().length / this.tamano)));

  paginas = computed(() => {
    const total = this.totalPaginas();
    const current = this.paginaActual();
    const max = 5;
    if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);
    let start = Math.max(1, current - 2);
    const end = Math.min(total, start + max - 1);
    if (end - start < max - 1) start = Math.max(1, end - max + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  clientesPaginados = computed(() => {
    const lista = this.clientesFiltrados();
    const start = (this.paginaActual() - 1) * this.tamano;
    return lista.slice(start, start + this.tamano);
  });

  paginaInicio = computed(() =>
    this.clientesFiltrados().length === 0 ? 0 : (this.paginaActual() - 1) * this.tamano + 1
  );
  paginaFin = computed(() =>
    Math.min(this.paginaActual() * this.tamano, this.clientesFiltrados().length)
  );

  // Confirmación
  confirmando = signal(false);
  confirmMsg = signal('');
  pendingDeleteId = signal<string | null>(null);

  ngOnInit(): void { this.cargarClientes(); }

  cargarClientes(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.paginaActual.set(1);
    this.clienteService.getAll().subscribe({
      next: (data) => { this.clientes.set(data); this.loading.set(false); },
      error: () => { this.errorMessage.set('Error al cargar los clientes.'); this.loading.set(false); }
    });
  }

  onSearch(value: string): void {
    this.busqueda.set(value);
    this.paginaActual.set(1);
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
      next: () => { this.clientes.update(lista => lista.filter(c => c.id !== id)); this.paginaActual.set(1); },
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
