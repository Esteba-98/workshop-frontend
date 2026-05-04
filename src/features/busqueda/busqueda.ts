import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, switchMap, of } from 'rxjs';
import { SearchService, SearchResult } from '../../app/core/services/search.service';

@Component({
  selector: 'app-busqueda',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './busqueda.html'
})
export class Busqueda {
  private searchService = inject(SearchService);
  private router = inject(Router);

  query = signal('');
  resultado = signal<SearchResult | null>(null);
  loading = signal(false);
  buscado = signal(false);

  private search$ = new Subject<string>();

  constructor() {
    this.search$.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      switchMap(q => {
        if (q.trim().length < 2) {
          this.resultado.set(null);
          this.loading.set(false);
          this.buscado.set(false);
          return of(null);
        }
        this.loading.set(true);
        this.buscado.set(false);
        return this.searchService.search(q);
      })
    ).subscribe({
      next: (r) => {
        if (r) { this.resultado.set(r); this.buscado.set(true); }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onInput(value: string): void {
    this.query.set(value);
    this.search$.next(value);
  }

  totalResultados(): number {
    const r = this.resultado();
    if (!r) return 0;
    return r.clientes.length + r.vehiculos.length + r.mantenimientos.length;
  }

  irACliente(id: string): void { this.router.navigate(['/clientes', id, 'historial']); }
  irAVehiculo(id: string): void { this.router.navigate(['/vehiculos', id, 'historial']); }
  irAOrden(id: string): void { this.router.navigate(['/mantenimientos', id, 'editar']); }

  estadoClass(estado: string): string {
    switch (estado) {
      case 'Completado': return 'bg-green-100 text-green-700';
      case 'En Proceso': return 'bg-blue-100 text-blue-700';
      case 'Cancelado':  return 'bg-red-100 text-red-700';
      default:           return 'bg-amber-100 text-amber-700';
    }
  }
}
