import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html'
})
export class Layout implements OnInit {
  private authService = inject(AuthService);

  userName = signal('');
  userRole = signal('');
  roles = signal<string[]>([]);
  sidebarOpen = signal(false);

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userName.set(user?.nombre || user?.userName || '');
    this.roles.set(user?.roles ?? []);
    this.userRole.set(user?.roles?.[0] ?? 'Usuario');
  }

  can(allowedRoles: string[]): boolean {
    return allowedRoles.some(r => this.roles().includes(r));
  }

  logout(): void {
    this.authService.logout();
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
