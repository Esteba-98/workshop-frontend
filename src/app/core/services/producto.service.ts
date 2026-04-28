import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { Producto, CreateProductoDto, UpdateProductoDto } from '../models/producto.model';

export interface ImportarResultado {
  actualizados: number;
  creados: number;
  errores: string[];
}

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private apiUrl = `${environment.apiUrl}/Productos`;
  private http = inject(HttpClient);

  getAll(): Observable<Producto[]> { return this.http.get<Producto[]>(this.apiUrl); }
  getById(id: string): Observable<Producto> { return this.http.get<Producto>(`${this.apiUrl}/${id}`); }
  create(data: CreateProductoDto): Observable<Producto> { return this.http.post<Producto>(this.apiUrl, data); }
  update(id: string, data: UpdateProductoDto): Observable<Producto> { return this.http.put<Producto>(`${this.apiUrl}/${id}`, data); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }

  descargarPlantilla(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/plantilla`, { responseType: 'blob' });
  }

  importar(file: File): Observable<ImportarResultado> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ImportarResultado>(`${this.apiUrl}/importar`, formData);
  }
}
