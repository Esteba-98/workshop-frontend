export interface MantenimientoItem {
  id: string;
  tipo: 'Producto' | 'Servicio';
  nombre: string;
  productoId: string | null;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Mantenimiento {
  id: string;
  folio: string;
  clienteId: string;
  clienteNombre: string;
  clienteTelefono: string;
  vehiculoId: string;
  vehiculoPlaca: string;
  vehiculoMarca: string;
  vehiculoModelo: string;
  vehiculoAnio: number;
  mecanicoId: string | null;
  mecanicoNombre: string | null;
  fecha: string;
  fechaEntrega: string | null;
  estado: string;
  descripcion: string;
  diagnostico: string;
  observaciones: string;
  items: MantenimientoItem[];
  total: number;
}

export interface CreateMantenimientoDto {
  clienteId: string;
  vehiculoId: string;
  mecanicoId: string | null;
  descripcion: string;
  fechaEntrega: string | null;
}

export interface UpdateMantenimientoDto {
  id: string;
  clienteId: string;
  vehiculoId: string;
  mecanicoId: string | null;
  fecha: string;
  fechaEntrega: string | null;
  estado: string;
  descripcion: string;
  diagnostico: string;
  observaciones: string;
}

export interface AddItemDto {
  tipo: 'Producto' | 'Servicio';
  nombre: string;
  productoId: string | null;
  cantidad: number;
  precioUnitario: number;
}

export interface MecanicoDto { id: string; nombre: string; email: string; }

export const ESTADOS_MANTENIMIENTO = ['Pendiente', 'En Proceso', 'Completado', 'Cancelado'];

export const TRANSICIONES_VALIDAS: Record<string, string[]> = {
  'Pendiente':  ['Pendiente', 'En Proceso', 'Cancelado'],
  'En Proceso': ['En Proceso', 'Completado', 'Pendiente'],
  'Completado': ['Completado'],
  'Cancelado':  ['Cancelado'],
};
