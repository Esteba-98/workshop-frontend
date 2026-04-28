export interface Vehiculo { id: string; placa: string; marca: string; modelo: string; anio: number; clienteId: string; }
export interface CreateVehiculoDto { placa: string; marca: string; modelo: string; anio: number; clienteId: string; }
export interface UpdateVehiculoDto { id: string; placa: string; marca: string; modelo: string; anio: number; clienteId: string; }
