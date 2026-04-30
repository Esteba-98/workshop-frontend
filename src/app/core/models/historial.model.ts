export interface OrdenResumen {
  id: string;
  folio: string;
  fecha: string;
  fechaEntrega?: string;
  estado: string;
  descripcion: string;
  totalItems: number;
  total: number;
}

export interface VehiculoHistorial {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  clienteNombre: string;
  clienteTelefono: string;
  totalOrdenes: number;
  totalFacturado: number;
  ordenes: OrdenResumen[];
}

export interface VehiculoEnHistorial {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  totalOrdenes: number;
  ordenes: OrdenResumen[];
}

export interface ClienteHistorial {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  totalOrdenes: number;
  totalFacturado: number;
  vehiculos: VehiculoEnHistorial[];
}
