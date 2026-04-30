import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { StatsService } from '../../app/core/services/stats.service';
import { AuthService } from '../../app/core/services/auth.service';
import { DashboardStats } from '../../app/core/models/stats.model';

type Periodo = 'semana' | 'mes' | 'anio' | 'todo';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, NgApexchartsModule],
  templateUrl: './home.html'
})
export class Home implements OnInit {
  private statsService = inject(StatsService);
  private authService = inject(AuthService);

  loading = signal(true);
  userName = signal('');
  isAdmin = signal(false);
  roles = signal<string[]>([]);
  stats = signal<DashboardStats | null>(null);
  periodo = signal<Periodo>('mes');

  readonly periodos: { value: Periodo; label: string }[] = [
    { value: 'semana', label: '7 días' },
    { value: 'mes',    label: 'Este mes' },
    { value: 'anio',   label: 'Este año' },
    { value: 'todo',   label: 'Todo' },
  ];

  // Computed: series para la dona (por estado)
  donutSeries = computed(() => {
    const s = this.stats();
    if (!s) return [0, 0, 0, 0];
    return [s.porEstado.pendiente, s.porEstado.enProceso, s.porEstado.completado, s.porEstado.cancelado];
  });

  // Computed: series para el bar (últimos 7 días)
  barSeries = computed(() => {
    const s = this.stats();
    if (!s) return [{ name: 'Órdenes', data: [] as number[] }];
    return [{ name: 'Órdenes', data: s.ultimaSemana.map(d => d.count) }];
  });

  barCategories = computed(() => {
    const s = this.stats();
    if (!s) return [] as string[];
    return s.ultimaSemana.map(d => d.dia);
  });

  // Opciones estáticas de los charts
  readonly donutChart = { type: 'donut' as const, height: 240, toolbar: { show: false } };
  readonly donutLabels = ['Pendiente', 'En Proceso', 'Completado', 'Cancelado'];
  readonly donutColors = ['#EAB308', '#3B82F6', '#22C55E', '#EF4444'];
  readonly donutLegend = { position: 'bottom' as const, fontSize: '12px' };
  readonly donutDataLabels = { enabled: false };
  readonly donutPlotOptions = { pie: { donut: { size: '65%' } } };

  readonly barChart = { type: 'bar' as const, height: 240, toolbar: { show: false }, foreColor: '#64748b' };
  readonly barColors = ['#F97316'];
  readonly barPlotOptions = { bar: { borderRadius: 4, columnWidth: '55%' } };
  readonly barDataLabels = { enabled: false };
  barXaxis = computed(() => ({ categories: this.barCategories() }));
  readonly barYaxis = { labels: { formatter: (v: number) => Math.floor(v).toString() } };
  readonly barGrid = { borderColor: '#f1f5f9', strokeDashArray: 4 };

  canSeeOrdenes = false;
  canSeeProductos = false;
  canSeeClientes = false;

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userName.set(user?.nombre || user?.userName || '');
    this.isAdmin.set(this.authService.hasRole('Administrador'));
    this.roles.set(this.authService.getUserRoles());

    this.canSeeOrdenes = this.authService.hasAnyRole(['Administrador', 'Mecanico', 'User']);
    this.canSeeProductos = this.authService.hasAnyRole(['Administrador', 'OperarioAlmacen', 'Mecanico']);
    this.canSeeClientes = this.authService.hasAnyRole(['Administrador', 'User']);

    this.cargarStats();
  }

  cargarStats(): void {
    this.loading.set(true);
    this.stats.set(null);
    this.statsService.getDashboard(this.periodo()).subscribe({
      next: (data) => { this.stats.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  cambiarPeriodo(p: Periodo): void {
    this.periodo.set(p);
    this.cargarStats();
  }

  labelPeriodo(): string {
    const p = this.periodo();
    if (p === 'semana') return 'últimos 7 días';
    if (p === 'mes') return 'este mes';
    if (p === 'anio') return 'este año';
    return 'histórico';
  }
}
