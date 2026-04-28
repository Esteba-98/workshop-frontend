import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../app/core/services/auth.service';
import { UserService, UsuarioBackend } from '../../app/core/services/user.service';

const ROLES = [
  { value: 'Administrador', label: 'Administrador', desc: 'Acceso total al sistema' },
  { value: 'Mecanico', label: 'Mecánico', desc: 'Vehículos, productos y mantenimientos' },
  { value: 'OperarioAlmacen', label: 'Operario de Almacén', desc: 'Gestión de productos' },
  { value: 'User', label: 'Secretaria / Usuario', desc: 'Clientes y vehículos' },
];

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './usuarios.html'
})
export class Usuarios implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  loading = signal(false);
  loadingLista = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  usuariosCreados = signal<UsuarioBackend[]>([]);
  roles = ROLES;

  // Búsqueda y filtro
  busqueda = signal('');
  filtroRol = signal('');

  usuariosFiltrados = computed(() => {
    let lista = [...this.usuariosCreados()];
    const term = this.busqueda().toLowerCase();
    const rol = this.filtroRol();

    if (rol) lista = lista.filter(u => u.rol === rol);
    if (term) lista = lista.filter(u =>
      u.nombre.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );

    // Ordenar por rol según el orden de ROLES
    const orden = ROLES.map(r => r.value);
    lista.sort((a, b) => orden.indexOf(a.rol) - orden.indexOf(b.rol));
    return lista;
  });

  // Edición
  editando = signal<UsuarioBackend | null>(null);
  editError = signal('');
  editLoading = signal(false);

  // Confirmación eliminar
  confirmandoEliminar = signal(false);
  pendingDeleteId = signal<string | null>(null);

  editForm = this.fb.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    rol: ['User', Validators.required],
    newPassword: ['']
  });

  form = this.fb.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['User', Validators.required]
  });

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.loadingLista.set(true);
    this.userService.getAll().subscribe({
      next: (lista) => {
        this.usuariosCreados.set(lista);
        this.loadingLista.set(false);
      },
      error: () => this.loadingLista.set(false)
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { nombre, email, password, role } = this.form.value;

    this.authService.register({ nombre: nombre!, email: email!, password: password!, role: role! }).subscribe({
      next: () => {
        this.successMessage.set(`Usuario "${nombre}" creado con rol "${this.getRolLabel(role!)}".`);
        this.form.reset({ role: 'User' });
        this.loading.set(false);
        this.cargarUsuarios();
      },
      error: (err) => {
        const errors = err?.error;
        if (Array.isArray(errors)) {
          this.errorMessage.set(errors.map((e: any) => e.description).join(' '));
        } else {
          this.errorMessage.set(errors?.message ?? 'Error al crear el usuario. Verifica los datos.');
        }
        this.loading.set(false);
      }
    });
  }

  abrirEditar(u: UsuarioBackend): void {
    this.editando.set(u);
    this.editError.set('');
    this.editForm.setValue({ nombre: u.nombre, email: u.email, rol: u.rol, newPassword: '' });
  }

  guardarEdicion(): void {
    if (this.editForm.invalid && !this.editForm.get('newPassword')?.value) return;
    const u = this.editando()!;
    const { nombre, email, rol, newPassword } = this.editForm.value;
    this.editLoading.set(true);
    this.editError.set('');

    // Actualizar perfil (nombre + email) y rol en paralelo
    const calls: Promise<void>[] = [];

    const profileChanged = nombre !== u.nombre || email !== u.email;
    const rolChanged = rol !== u.rol;

    const doProfile = () => new Promise<void>((resolve, reject) => {
      if (!profileChanged) { resolve(); return; }
      this.userService.updateProfile(u.id, nombre!, email!).subscribe({ next: () => resolve(), error: reject });
    });

    const doRole = () => new Promise<void>((resolve, reject) => {
      if (!rolChanged) { resolve(); return; }
      this.userService.changeRole(u.id, rol!).subscribe({ next: () => resolve(), error: reject });
    });

    const doPassword = () => new Promise<void>((resolve, reject) => {
      if (!newPassword) { resolve(); return; }
      this.userService.changePassword(u.id, newPassword).subscribe({ next: () => resolve(), error: reject });
    });

    Promise.all([doProfile(), doRole(), doPassword()])
      .then(() => {
        this.editando.set(null);
        this.editLoading.set(false);
        this.cargarUsuarios();
      })
      .catch((err) => {
        this.editError.set(err?.error?.message ?? 'Error al guardar los cambios.');
        this.editLoading.set(false);
      });
  }

  cancelarEdicion(): void {
    this.editando.set(null);
    this.editError.set('');
  }

  solicitarEliminarUsuario(id: string): void {
    this.pendingDeleteId.set(id);
    this.confirmandoEliminar.set(true);
  }

  confirmarEliminarUsuario(): void {
    const id = this.pendingDeleteId();
    if (!id) return;
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.confirmandoEliminar.set(false);
        this.pendingDeleteId.set(null);
        this.cargarUsuarios();
      },
      error: () => {
        this.confirmandoEliminar.set(false);
        this.pendingDeleteId.set(null);
      }
    });
  }

  cancelarEliminarUsuario(): void {
    this.confirmandoEliminar.set(false);
    this.pendingDeleteId.set(null);
  }

  getRolLabel(value: string): string {
    return ROLES.find(r => r.value === value)?.label ?? value;
  }

  getRolColor(value: string): string {
    switch (value) {
      case 'Administrador': return 'bg-red-100 text-red-700';
      case 'Mecanico': return 'bg-blue-100 text-blue-700';
      case 'OperarioAlmacen': return 'bg-green-100 text-green-700';
      default: return 'bg-orange-100 text-orange-700';
    }
  }
}
