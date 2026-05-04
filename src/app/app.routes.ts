import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Layout } from './layout/layout';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('../features/auth/login/login').then(m => m.Login) },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: 'home', loadComponent: () => import('../features/home/home').then(m => m.Home) },

      // Clientes — Administrador, User
      { path: 'clientes', canActivate: [roleGuard(['Administrador', 'User'])], loadComponent: () => import('../features/clientes/clientes').then(m => m.Clientes) },
      { path: 'clientes/nuevo', canActivate: [roleGuard(['Administrador', 'User'])], loadComponent: () => import('../features/clientes/cliente-form/cliente-form').then(m => m.ClienteForm) },
      { path: 'clientes/:id/editar', canActivate: [roleGuard(['Administrador', 'User'])], loadComponent: () => import('../features/clientes/cliente-form/cliente-form').then(m => m.ClienteForm) },
      { path: 'clientes/:id/historial', canActivate: [roleGuard(['Administrador', 'User'])], loadComponent: () => import('../features/clientes/cliente-historial/cliente-historial').then(m => m.ClienteHistorialComponent) },

      // Vehículos — Administrador, Mecanico, User (User puede crear y editar)
      { path: 'vehiculos', canActivate: [roleGuard(['Administrador', 'Mecanico', 'User'])], loadComponent: () => import('../features/vehiculos/vehiculos').then(m => m.Vehiculos) },
      { path: 'vehiculos/nuevo', canActivate: [roleGuard(['Administrador', 'User'])], loadComponent: () => import('../features/vehiculos/vehiculo-form/vehiculo-form').then(m => m.VehiculoForm) },
      { path: 'vehiculos/:id/editar', canActivate: [roleGuard(['Administrador', 'User'])], loadComponent: () => import('../features/vehiculos/vehiculo-form/vehiculo-form').then(m => m.VehiculoForm) },
      { path: 'vehiculos/:id/historial', canActivate: [roleGuard(['Administrador', 'Mecanico', 'User'])], loadComponent: () => import('../features/vehiculos/vehiculo-historial/vehiculo-historial').then(m => m.VehiculoHistorialComponent) },

      // Productos — OperarioAlmacen tiene control total
      { path: 'productos', canActivate: [roleGuard(['Administrador', 'Mecanico', 'OperarioAlmacen'])], loadComponent: () => import('../features/productos/productos').then(m => m.Productos) },
      { path: 'productos/nuevo', canActivate: [roleGuard(['Administrador', 'OperarioAlmacen'])], loadComponent: () => import('../features/productos/producto-form/producto-form').then(m => m.ProductoForm) },
      { path: 'productos/:id/editar', canActivate: [roleGuard(['Administrador', 'OperarioAlmacen'])], loadComponent: () => import('../features/productos/producto-form/producto-form').then(m => m.ProductoForm) },

      // Búsqueda global — todos los roles
      { path: 'busqueda', loadComponent: () => import('../features/busqueda/busqueda').then(m => m.Busqueda) },

      // Usuarios — solo Administrador
      { path: 'usuarios', canActivate: [roleGuard(['Administrador'])], loadComponent: () => import('../features/usuarios/usuarios').then(m => m.Usuarios) },

      // Mantenimientos — Administrador, Mecanico, User
      { path: 'mantenimientos', canActivate: [roleGuard(['Administrador', 'Mecanico', 'User'])], loadComponent: () => import('../features/mantenimientos/mantenimientos').then(m => m.Mantenimientos) },
      { path: 'mantenimientos/nuevo', canActivate: [roleGuard(['Administrador', 'Mecanico', 'User'])], loadComponent: () => import('../features/mantenimientos/mantenimiento-form/mantenimiento-form').then(m => m.MantenimientoForm) },
      { path: 'mantenimientos/:id/editar', canActivate: [roleGuard(['Administrador', 'Mecanico', 'User'])], loadComponent: () => import('../features/mantenimientos/mantenimiento-form/mantenimiento-form').then(m => m.MantenimientoForm) },
    ]
  },
  // Página de impresión — fuera del Layout para que no aparezca el sidebar
  { path: 'mantenimientos/:id/imprimir', canActivate: [authGuard], loadComponent: () => import('../features/mantenimientos/orden-print/orden-print').then(m => m.OrdenPrint) },
];
