import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { Cliente, CreateClienteDto, UpdateClienteDto } from '../models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private apiUrl = `${environment.apiUrl}/Cliente`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  getById(id: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateClienteDto): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, data);
  }

  update(id: string, data: UpdateClienteDto): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}