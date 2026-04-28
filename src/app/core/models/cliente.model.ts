export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
}

export interface CreateClienteDto {
  nombre: string;
  email: string;
  telefono: string;
}

export interface UpdateClienteDto {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
}
