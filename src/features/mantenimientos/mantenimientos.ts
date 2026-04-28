import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MantenimientoService } from '../../app/core/services/mantenimiento.service';
import { AuthService } from '../../app/core/services/auth.service';
import { Mantenimiento } from '../../app/core/models/mantenimiento.model';

@Component({
  selector: 'app-mantenimientos',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './mantenimientos.html'
})
export class Mantenimientos implements OnInit {
  private mantenimientoService = inject(MantenimientoService);
  private authService = inject(AuthService);
  private router = inject(Router);

  mantenimientos = signal<Mantenimiento[]>([]);
  busqueda = signal('');
  filtroEstado = signal('');
  loading = signal(false);
  errorMessage = signal('');
  canCreate = signal(false);
  canDelete = signal(false);

  readonly estados = ['', 'Pendiente', 'En Proceso', 'Completado', 'Cancelado'];

  mantenimientosFiltrados = computed(() => {
    let lista = this.mantenimientos();
    const q = this.busqueda().toLowerCase().trim();
    const estado = this.filtroEstado();
    if (q) {
      lista = lista.filter(m =>
        m.folio?.toLowerCase().includes(q) ||
        m.clienteNombre?.toLowerCase().includes(q) ||
        m.vehiculoPlaca?.toLowerCase().includes(q) ||
        m.mecanicoNombre?.toLowerCase().includes(q)
      );
    }
    if (estado) {
      lista = lista.filter(m => m.estado === estado);
    }
    return lista;
  });

  confirmando = signal(false);
  confirmMsg = signal('');
  pendingDeleteId = signal<string | null>(null);

  ngOnInit(): void {
    this.canCreate.set(this.authService.hasAnyRole(['Administrador', 'Mecanico', 'User']));
    this.canDelete.set(this.authService.hasRole('Administrador'));
    this.cargarMantenimientos();
  }

  cargarMantenimientos(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.mantenimientoService.getAll().subscribe({
      next: (data) => { this.mantenimientos.set(data); this.loading.set(false); },
      error: () => { this.errorMessage.set('Error al cargar los mantenimientos.'); this.loading.set(false); }
    });
  }

  solicitarEliminar(id: string): void {
    this.pendingDeleteId.set(id);
    this.confirmMsg.set('¿Estás seguro de eliminar este mantenimiento? Esta acción no se puede deshacer.');
    this.confirmando.set(true);
  }

  confirmarEliminar(): void {
    const id = this.pendingDeleteId();
    if (!id) return;
    this.confirmando.set(false);
    this.mantenimientoService.delete(id).subscribe({
      next: () => this.mantenimientos.update(lista => lista.filter(m => m.id !== id)),
      error: () => this.errorMessage.set('Error al eliminar el mantenimiento.')
    });
  }

  cancelarEliminar(): void {
    this.confirmando.set(false);
    this.pendingDeleteId.set(null);
  }

  estadoClass(estado: string): string {
    switch (estado) {
      case 'Completado': return 'bg-green-100 text-green-700 border border-green-200';
      case 'En Proceso': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'Cancelado':  return 'bg-red-100 text-red-700 border border-red-200';
      default:           return 'bg-amber-100 text-amber-700 border border-amber-200'; // Pendiente
    }
  }

  irACrear(): void { this.router.navigate(['/mantenimientos/nuevo']); }
  irAEditar(id: string): void { this.router.navigate(['/mantenimientos', id, 'editar']); }
  irAImprimir(id: string): void { this.router.navigate(['/mantenimientos', id, 'imprimir']); }
}
