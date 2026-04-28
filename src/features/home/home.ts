import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { catchError, of } from 'rxjs';
import { ClienteService } from '../../app/core/services/cliente.service';
import { VehiculoService } from '../../app/core/services/vehiculo.service';
import { ProductoService } from '../../app/core/services/producto.service';
import { MantenimientoService } from '../../app/core/services/mantenimiento.service';
import { AuthService } from '../../app/core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html'
})
export class Home implements OnInit {
  private clienteService = inject(ClienteService);
  private vehiculoService = inject(VehiculoService);
  private productoService = inject(ProductoService);
  private mantenimientoService = inject(MantenimientoService);
  private authService = inject(AuthService);

  loading = signal(true);
  userName = signal('');
  stats = signal({ clientes: 0, vehiculos: 0, productos: 0, mantenimientos: 0 });
  mantenimientosPendientes = signal(0);
  isAdmin = signal(false);
  roles = signal<string[]>([]);

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userName.set(user?.nombre || user?.userName ?? '');
    this.isAdmin.set(this.authService.hasRole('Administrador'));
    this.roles.set(this.authService.getUserRoles());

    // Solo llamar APIs a las que el rol tiene acceso
    const calls: Record<string, any> = {};

    if (this.authService.hasAnyRole(['Administrador', 'User'])) {
      calls['clientes'] = this.clienteService.getAll().pipe(catchError(() => of([])));
    }
    if (this.authService.hasAnyRole(['Administrador', 'Mecanico'])) {
      calls['vehiculos'] = this.vehiculoService.getAll().pipe(catchError(() => of([])));
      calls['mantenimientos'] = this.mantenimientoService.getAll().pipe(catchError(() => of([])));
    }
    if (this.authService.hasAnyRole(['Administrador', 'Mecanico', 'OperarioAlmacen'])) {
      calls['productos'] = this.productoService.getAll().pipe(catchError(() => of([])));
    }

    if (Object.keys(calls).length === 0) {
      this.loading.set(false);
      return;
    }

    forkJoin(calls).subscribe({
      next: (res: any) => {
        const mantenimientos = res['mantenimientos'] ?? [];
        this.stats.set({
          clientes: (res['clientes'] ?? []).length,
          vehiculos: (res['vehiculos'] ?? []).length,
          productos: (res['productos'] ?? []).length,
          mantenimientos: mantenimientos.length,
        });
        this.mantenimientosPendientes.set(
          mantenimientos.filter((m: any) => m.estado === 'Pendiente').length
        );
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  canSee(allowedRoles: string[]): boolean {
    return allowedRoles.some(r => this.roles().includes(r));
  }
}
