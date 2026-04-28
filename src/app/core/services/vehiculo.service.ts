import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { Vehiculo, CreateVehiculoDto, UpdateVehiculoDto } from '../models/vehiculo.model';

@Injectable({ providedIn: 'root' })
export class VehiculoService {
  private apiUrl = `${environment.apiUrl}/Vehiculos`;
  private http = inject(HttpClient);

  getAll(): Observable<Vehiculo[]> { return this.http.get<Vehiculo[]>(this.apiUrl); }
  getById(id: string): Observable<Vehiculo> { return this.http.get<Vehiculo>(`${this.apiUrl}/${id}`); }
  create(data: CreateVehiculoDto): Observable<Vehiculo> { return this.http.post<Vehiculo>(this.apiUrl, data); }
  update(id: string, data: UpdateVehiculoDto): Observable<Vehiculo> { return this.http.put<Vehiculo>(`${this.apiUrl}/${id}`, data); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
