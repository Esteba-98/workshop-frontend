export interface PorEstado {
  pendiente: number;
  enProceso: number;
  completado: number;
  cancelado: number;
}

export interface OrdenesDelDia {
  dia: string;
  count: number;
}

export interface DashboardStats {
  totalClientes: number;
  totalVehiculos: number;
  totalProductos: number;
  totalMantenimientos: number;
  ordenesMes: number;
  ordenesHoy: number;
  ingresosMes: number;
  stockBajo: number;
  mantenimientosPendientes: number;
  porEstado: PorEstado;
  ultimaSemana: OrdenesDelDia[];
}
