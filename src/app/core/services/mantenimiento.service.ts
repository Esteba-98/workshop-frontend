import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { Mantenimiento, CreateMantenimientoDto, UpdateMantenimientoDto, AddItemDto } from '../models/mantenimiento.model';

@Injectable({ providedIn: 'root' })
export class MantenimientoService {
  private apiUrl = `${environment.apiUrl}/Mantenimientos`;
  private http = inject(HttpClient);

  getAll(): Observable<Mantenimiento[]> { return this.http.get<Mantenimiento[]>(this.apiUrl); }
  getById(id: string): Observable<Mantenimiento> { return this.http.get<Mantenimiento>(`${this.apiUrl}/${id}`); }
  create(data: CreateMantenimientoDto): Observable<Mantenimiento> { return this.http.post<Mantenimiento>(this.apiUrl, data); }
  update(id: string, data: UpdateMantenimientoDto): Observable<Mantenimiento> { return this.http.put<Mantenimiento>(`${this.apiUrl}/${id}`, data); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
  addItem(id: string, data: AddItemDto): Observable<Mantenimiento> { return this.http.post<Mantenimiento>(`${this.apiUrl}/${id}/items`, data); }
  removeItem(id: string, itemId: string): Observable<Mantenimiento> { return this.http.delete<Mantenimiento>(`${this.apiUrl}/${id}/items/${itemId}`); }
  togglePagado(id: string): Observable<Mantenimiento> { return this.http.patch<Mantenimiento>(`${this.apiUrl}/${id}/pagado`, {}); }
}
