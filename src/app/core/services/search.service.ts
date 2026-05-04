import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

export interface SearchResultCliente {
  id: string; nombre: string; email: string; telefono: string;
}
export interface SearchResultVehiculo {
  id: string; placa: string; marca: string; modelo: string; anio: number; clienteNombre: string;
}
export interface SearchResultMantenimiento {
  id: string; folio: string; estado: string; clienteNombre: string; vehiculoPlaca: string; fecha: string;
}
export interface SearchResult {
  clientes: SearchResultCliente[];
  vehiculos: SearchResultVehiculo[];
  mantenimientos: SearchResultMantenimiento[];
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private apiUrl = `${environment.apiUrl}/Search`;
  private http = inject(HttpClient);

  search(q: string): Observable<SearchResult> {
    return this.http.get<SearchResult>(`${this.apiUrl}?q=${encodeURIComponent(q)}`);
  }
}
