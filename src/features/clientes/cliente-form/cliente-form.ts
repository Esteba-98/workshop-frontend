import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteService } from '../../../app/core/services/cliente.service';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cliente-form.html'
})
export class ClienteForm implements OnInit {

  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal(false);
  errorMessage = signal('');
  isEditing = signal(false);
  clienteId = signal<string | null>(null);

  form = this.fb.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', Validators.required]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing.set(true);
      this.clienteId.set(id);
      this.cargarCliente(id);
    }
  }

  cargarCliente(id: string): void {
    this.loading.set(true);
    this.clienteService.getById(id).subscribe({
      next: (cliente) => {
        this.form.patchValue({
          nombre: cliente.nombre,
          email: cliente.email,
          telefono: cliente.telefono
        });
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar el cliente.');
        this.loading.set(false);
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const { nombre, email, telefono } = this.form.value;

    if (this.isEditing()) {
      const id = this.clienteId()!;
      this.clienteService.update(id, { id, nombre: nombre!, email: email!, telefono: telefono! }).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/clientes']);
        },
        error: () => {
          this.errorMessage.set('Error al actualizar el cliente.');
          this.loading.set(false);
        }
      });
    } else {
      this.clienteService.create({ nombre: nombre!, email: email!, telefono: telefono! }).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/clientes']);
        },
        error: () => {
          this.errorMessage.set('Error al crear el cliente.');
          this.loading.set(false);
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/clientes']);
  }
}
