import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LowerCasePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MantenimientoService } from '../../../app/core/services/mantenimiento.service';
import { ClienteService } from '../../../app/core/services/cliente.service';
import { VehiculoService } from '../../../app/core/services/vehiculo.service';
import { UserService } from '../../../app/core/services/user.service';
import { ProductoService } from '../../../app/core/services/producto.service';
import { AuthService } from '../../../app/core/services/auth.service';
import { Cliente } from '../../../app/core/models/cliente.model';
import { Vehiculo } from '../../../app/core/models/vehiculo.model';
import { Producto } from '../../../app/core/models/producto.model';
import { Mantenimiento, MecanicoDto, ESTADOS_MANTENIMIENTO, TRANSICIONES_VALIDAS } from '../../../app/core/models/mantenimiento.model';

@Component({
  selector: 'app-mantenimiento-form',
  standalone: true,
  imports: [ReactiveFormsModule, LowerCasePipe, CurrencyPipe],
  templateUrl: './mantenimiento-form.html'
})
export class MantenimientoForm implements OnInit {
  private fb = inject(FormBuilder);
  private mantenimientoService = inject(MantenimientoService);
  private clienteService = inject(ClienteService);
  private vehiculoService = inject(VehiculoService);
  private userService = inject(UserService);
  private productoService = inject(ProductoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal(false);
  errorMessage = signal('');
  isEditing = signal(false);
  mantenimientoId = signal<string | null>(null);
  estadoActual = signal<string>('');
  currentMantenimiento = signal<Mantenimiento | null>(null);

  clientes = signal<Cliente[]>([]);
  vehiculos = signal<Vehiculo[]>([]);
  mecanicos = signal<MecanicoDto[]>([]);
  productos = signal<Producto[]>([]);

  esMecanico = signal(false);
  esAdmin = signal(false);

  addingItem = signal(false);
  savingItem = signal(false);
  removingItemId = signal<string | null>(null);

  esOrdenCerrada = computed(() => {
    if (this.esAdmin()) return false;
    const e = this.estadoActual();
    return e === 'Completado' || e === 'Cancelado';
  });

  estadosDisponibles = computed(() => {
    if (this.esAdmin()) return ESTADOS_MANTENIMIENTO;
    const actual = this.estadoActual();
    if (!actual) return ESTADOS_MANTENIMIENTO;
    return TRANSICIONES_VALIDAS[actual] ?? ESTADOS_MANTENIMIENTO;
  });

  form = this.fb.group({
    clienteId:    ['', Validators.required],
    vehiculoId:   ['', Validators.required],
    mecanicoId:   [null as string | null],
    fecha:        [''],
    fechaEntrega: [null as string | null],
    estado:       [''],
    descripcion:  [''],
    diagnostico:  [''],
    observaciones:['']
  });

  itemForm = this.fb.group({
    tipo:           ['Servicio'],
    productoId:     [null as string | null],
    nombre:         [''],
    cantidad:       [1, [Validators.required, Validators.min(1)]],
    precioUnitario: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.esMecanico.set(this.authService.hasRole('Mecanico'));
    this.esAdmin.set(this.authService.hasRole('Administrador'));

    if (this.esMecanico()) {
      const user = this.authService.getCurrentUser();
      this.form.get('mecanicoId')?.setValue(user?.id ?? null);
      this.form.get('mecanicoId')?.disable();
    }

    // Load reference data
    if (this.esMecanico()) {
      forkJoin({
        clientes:  this.clienteService.getAll(),
        vehiculos: this.vehiculoService.getAll(),
        productos: this.productoService.getAll()
      }).subscribe({
        next: ({ clientes, vehiculos, productos }) => {
          this.clientes.set(clientes);
          this.vehiculos.set(vehiculos);
          this.productos.set(productos);
        },
        error: () => this.errorMessage.set('Error al cargar datos del formulario.')
      });
    } else {
      forkJoin({
        clientes:  this.clienteService.getAll(),
        vehiculos: this.vehiculoService.getAll(),
        productos: this.productoService.getAll(),
        mecanicos: this.userService.getMecanicos()
      }).subscribe({
        next: ({ clientes, vehiculos, productos, mecanicos }) => {
          this.clientes.set(clientes);
          this.vehiculos.set(vehiculos);
          this.productos.set(productos);
          this.mecanicos.set(mecanicos);
        },
        error: () => this.errorMessage.set('Error al cargar datos del formulario.')
      });
    }

    const vehiculoIdParam = this.route.snapshot.queryParamMap.get('vehiculoId');
    if (vehiculoIdParam) {
      this.form.patchValue({ vehiculoId: vehiculoIdParam });
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing.set(true);
      this.mantenimientoId.set(id);
      this.loading.set(true);
      this.mantenimientoService.getById(id).subscribe({
        next: (m) => {
          this.estadoActual.set(m.estado);
          this.currentMantenimiento.set(m);

          this.form.patchValue({
            clienteId:    m.clienteId,
            vehiculoId:   m.vehiculoId,
            mecanicoId:   m.mecanicoId,
            fecha:        m.fecha?.substring(0, 10),
            fechaEntrega: m.fechaEntrega?.substring(0, 10) ?? null,
            estado:       m.estado,
            descripcion:  m.descripcion,
            diagnostico:  m.diagnostico,
            observaciones:m.observaciones
          });

          if (this.esOrdenCerrada()) {
            this.form.disable();
          }

          this.loading.set(false);
        },
        error: () => { this.errorMessage.set('Error al cargar el mantenimiento.'); this.loading.set(false); }
      });
    }
  }

  // --- Item helpers ---
  onTipoItemChange(): void {
    const tipo = this.itemForm.get('tipo')?.value;
    this.itemForm.patchValue({ productoId: null, nombre: '', precioUnitario: 0 });
    if (tipo !== 'Producto') return;
  }

  onProductoChange(): void {
    const productoId = this.itemForm.get('productoId')?.value;
    if (!productoId) return;
    const prod = this.productos().find(p => p.id === productoId);
    if (prod) {
      this.itemForm.patchValue({ nombre: prod.nombre, precioUnitario: prod.precio });
    }
  }

  tipoActual(): string {
    return this.itemForm.get('tipo')?.value ?? 'Servicio';
  }

  stockDisponible(): number {
    const productoId = this.itemForm.get('productoId')?.value;
    if (!productoId) return 0;
    return this.productos().find(p => p.id === productoId)?.stock ?? 0;
  }

  addItem(): void {
    const id = this.mantenimientoId();
    if (!id) return;
    const raw = this.itemForm.getRawValue();

    if (raw.tipo === 'Servicio' && !raw.nombre?.trim()) {
      this.errorMessage.set('El nombre del servicio es requerido.');
      return;
    }
    if (raw.tipo === 'Producto' && !raw.productoId) {
      this.errorMessage.set('Selecciona un producto del inventario.');
      return;
    }
    if ((raw.cantidad ?? 0) < 1) {
      this.errorMessage.set('La cantidad debe ser al menos 1.');
      return;
    }

    this.savingItem.set(true);
    this.errorMessage.set('');

    this.mantenimientoService.addItem(id, {
      tipo:           raw.tipo as 'Producto' | 'Servicio',
      nombre:         raw.nombre ?? '',
      productoId:     raw.productoId ?? null,
      cantidad:       raw.cantidad ?? 1,
      precioUnitario: raw.precioUnitario ?? 0
    }).subscribe({
      next: (m) => {
        this.currentMantenimiento.set(m);
        this.savingItem.set(false);
        this.addingItem.set(false);
        this.itemForm.reset({ tipo: 'Servicio', productoId: null, nombre: '', cantidad: 1, precioUnitario: 0 });
        // Refresh product stock
        this.productoService.getAll().subscribe(p => this.productos.set(p));
      },
      error: () => {
        this.errorMessage.set('No se pudo agregar el item. Verifica el stock disponible.');
        this.savingItem.set(false);
      }
    });
  }

  cancelAddItem(): void {
    this.addingItem.set(false);
    this.itemForm.reset({ tipo: 'Servicio', productoId: null, nombre: '', cantidad: 1, precioUnitario: 0 });
    this.errorMessage.set('');
  }

  removeItem(itemId: string): void {
    const id = this.mantenimientoId();
    if (!id) return;
    this.removingItemId.set(itemId);
    this.mantenimientoService.removeItem(id, itemId).subscribe({
      next: (m) => {
        this.currentMantenimiento.set(m);
        this.removingItemId.set(null);
        this.productoService.getAll().subscribe(p => this.productos.set(p));
      },
      error: () => {
        this.errorMessage.set('Error al eliminar el item.');
        this.removingItemId.set(null);
      }
    });
  }

  // --- Main form submit ---
  submit(): void {
    if (this.form.invalid || this.esOrdenCerrada()) return;
    this.loading.set(true);
    this.errorMessage.set('');
    const raw = this.form.getRawValue();

    if (this.isEditing()) {
      const id = this.mantenimientoId()!;
      this.mantenimientoService.update(id, {
        id,
        clienteId:    raw.clienteId!,
        vehiculoId:   raw.vehiculoId!,
        mecanicoId:   raw.mecanicoId ?? null,
        fecha:        raw.fecha!,
        fechaEntrega: raw.fechaEntrega || null,
        estado:       raw.estado!,
        descripcion:  raw.descripcion ?? '',
        diagnostico:  raw.diagnostico ?? '',
        observaciones:raw.observaciones ?? ''
      }).subscribe({
        next: (m) => {
          this.estadoActual.set(m.estado);
          this.currentMantenimiento.set(m);
          this.loading.set(false);
          this.router.navigate(['/mantenimientos']);
        },
        error: () => { this.errorMessage.set('Error al actualizar.'); this.loading.set(false); }
      });
    } else {
      this.mantenimientoService.create({
        clienteId:    raw.clienteId!,
        vehiculoId:   raw.vehiculoId!,
        mecanicoId:   raw.mecanicoId ?? null,
        descripcion:  raw.descripcion ?? '',
        fechaEntrega: raw.fechaEntrega || null
      }).subscribe({
        next: (m) => {
          this.loading.set(false);
          // Go to edit so user can add items right away
          this.router.navigate(['/mantenimientos', m.id, 'editar']);
        },
        error: () => { this.errorMessage.set('Error al crear la orden.'); this.loading.set(false); }
      });
    }
  }

  cancelar(): void { this.router.navigate(['/mantenimientos']); }
  verOrden(): void { this.router.navigate(['/mantenimientos', this.mantenimientoId(), 'imprimir']); }
}
