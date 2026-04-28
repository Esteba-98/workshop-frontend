import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VehiculoService } from '../../../app/core/services/vehiculo.service';
import { ClienteService } from '../../../app/core/services/cliente.service';
import { Cliente } from '../../../app/core/models/cliente.model';

@Component({
  selector: 'app-vehiculo-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './vehiculo-form.html'
})
export class VehiculoForm implements OnInit {
  private fb = inject(FormBuilder);
  private vehiculoService = inject(VehiculoService);
  private clienteService = inject(ClienteService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal(false);
  errorMessage = signal('');
  isEditing = signal(false);
  vehiculoId = signal<string | null>(null);
  clientes = signal<Cliente[]>([]);

  form = this.fb.group({
    placa: ['', Validators.required],
    marca: ['', Validators.required],
    modelo: ['', Validators.required],
    anio: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(2100)]],
    clienteId: ['', Validators.required]
  });

  ngOnInit(): void {
    this.clienteService.getAll().subscribe({ next: (data) => this.clientes.set(data) });
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing.set(true);
      this.vehiculoId.set(id);
      this.loading.set(true);
      this.vehiculoService.getById(id).subscribe({
        next: (v) => { this.form.patchValue({ placa: v.placa, marca: v.marca, modelo: v.modelo, anio: v.anio, clienteId: v.clienteId }); this.loading.set(false); },
        error: () => { this.errorMessage.set('Error al cargar el vehículo.'); this.loading.set(false); }
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');
    const { placa, marca, modelo, anio, clienteId } = this.form.value;
    const dto = { placa: placa!, marca: marca!, modelo: modelo!, anio: anio!, clienteId: clienteId! };

    if (this.isEditing()) {
      const id = this.vehiculoId()!;
      this.vehiculoService.update(id, { id, ...dto }).subscribe({
        next: () => { this.loading.set(false); this.router.navigate(['/vehiculos']); },
        error: () => { this.errorMessage.set('Error al actualizar el vehículo.'); this.loading.set(false); }
      });
    } else {
      this.vehiculoService.create(dto).subscribe({
        next: () => { this.loading.set(false); this.router.navigate(['/vehiculos']); },
        error: () => { this.errorMessage.set('Error al crear el vehículo.'); this.loading.set(false); }
      });
    }
  }

  cancelar(): void { this.router.navigate(['/vehiculos']); }
}
