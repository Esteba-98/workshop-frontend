import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { DashboardStats } from '../models/stats.model';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private apiUrl = `${environment.apiUrl}/Stats`;
  private http = inject(HttpClient);

  getDashboard(periodo: string = 'mes'): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}?periodo=${periodo}`);
  }
}
