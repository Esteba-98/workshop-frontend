import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ProductoService, ImportarResultado } from '../../app/core/services/producto.service';
import { AuthService } from '../../app/core/services/auth.service';
import { Producto } from '../../app/core/models/producto.model';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './productos.html'
})
export class Productos implements OnInit {
  private productoService = inject(ProductoService);
  private authService = inject(AuthService);
  private router = inject(Router);

  productos = signal<Producto[]>([]);
  busqueda = signal('');
  loading = signal(false);

  productosFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    if (!q) return this.productos();
    return this.productos().filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.codigo?.toLowerCase().includes(q)
    );
  });
  errorMessage = signal('');
  canCreate = signal(false);
  canEdit = signal(false);

  confirmando = signal(false);
  confirmMsg = signal('');
  pendingDeleteId = signal<string | null>(null);

  // Import Excel
  importando = signal(false);
  importResult = signal<ImportarResultado | null>(null);
  showImportResult = signal(false);

  ngOnInit(): void {
    this.canCreate.set(this.authService.hasAnyRole(['Administrador', 'OperarioAlmacen']));
    this.canEdit.set(this.authService.hasAnyRole(['Administrador', 'OperarioAlmacen']));
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.productoService.getAll().subscribe({
      next: (data) => { this.productos.set(data); this.loading.set(false); },
      error: () => { this.errorMessage.set('Error al cargar los productos.'); this.loading.set(false); }
    });
  }

  solicitarEliminar(id: string, nombre: string): void {
    this.pendingDeleteId.set(id);
    this.confirmMsg.set(`¿Estás seguro de eliminar el producto "${nombre}"?`);
    this.confirmando.set(true);
  }

  confirmarEliminar(): void {
    const id = this.pendingDeleteId();
    if (!id) return;
    this.confirmando.set(false);
    this.productoService.delete(id).subscribe({
      next: () => this.productos.update(lista => lista.filter(p => p.id !== id)),
      error: () => this.errorMessage.set('Error al eliminar el producto.')
    });
  }

  cancelarEliminar(): void {
    this.confirmando.set(false);
    this.pendingDeleteId.set(null);
  }

  descargarPlantilla(): void {
    this.productoService.descargarPlantilla().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plantilla_productos.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.errorMessage.set('Error al descargar la plantilla.')
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = ''; // reset para permitir reimportar el mismo archivo

    this.importando.set(true);
    this.showImportResult.set(false);
    this.productoService.importar(file).subscribe({
      next: (resultado) => {
        this.importando.set(false);
        this.importResult.set(resultado);
        this.showImportResult.set(true);
        this.cargarProductos(); // refrescar lista
      },
      error: () => {
        this.importando.set(false);
        this.errorMessage.set('Error al importar el archivo. Verifica que sea el formato correcto (.xlsx).');
      }
    });
  }

  cerrarResultadoImport(): void {
    this.showImportResult.set(false);
    this.importResult.set(null);
  }

  irACrear(): void { this.router.navigate(['/productos/nuevo']); }
  irAEditar(id: string): void { this.router.navigate(['/productos', id, 'editar']); }
}
