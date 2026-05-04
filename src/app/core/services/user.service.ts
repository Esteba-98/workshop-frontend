import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { MecanicoDto } from '../models/mantenimiento.model';

export interface UsuarioBackend {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiUrl}/Users`;
  private http = inject(HttpClient);

  getAll(): Observable<UsuarioBackend[]> {
    return this.http.get<UsuarioBackend[]>(this.apiUrl);
  }

  getMecanicos(): Observable<MecanicoDto[]> {
    return this.http.get<MecanicoDto[]>(`${this.apiUrl}/mecanicos`);
  }

  updateProfile(id: string, nombre: string, email: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/profile`, { nombre, email });
  }

  changeRole(id: string, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/role`, { role });
  }

  changePassword(id: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/change-password`, { newPassword });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  toggleActivo(id: string): Observable<{ activo: boolean }> {
    return this.http.patch<{ activo: boolean }>(`${this.apiUrl}/${id}/toggle-activo`, {});
  }
}
