import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoService } from '../../../app/core/services/producto.service';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './producto-form.html'
})
export class ProductoForm implements OnInit {
  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal(false);
  errorMessage = signal('');
  isEditing = signal(false);
  productoId = signal<string | null>(null);

  form = this.fb.group({
    nombre: ['', Validators.required],
    codigo: ['', Validators.required],
    precio: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing.set(true);
      this.productoId.set(id);
      this.loading.set(true);
      this.productoService.getById(id).subscribe({
        next: (p) => { this.form.patchValue({ nombre: p.nombre, codigo: p.codigo, precio: p.precio, stock: p.stock }); this.loading.set(false); },
        error: () => { this.errorMessage.set('Error al cargar el producto.'); this.loading.set(false); }
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');
    const { nombre, codigo, precio, stock } = this.form.value;
    const dto = { nombre: nombre!, codigo: codigo!, precio: precio!, stock: stock! };

    if (this.isEditing()) {
      const id = this.productoId()!;
      this.productoService.update(id, { id, ...dto }).subscribe({
        next: () => { this.loading.set(false); this.router.navigate(['/productos']); },
        error: () => { this.errorMessage.set('Error al actualizar el producto.'); this.loading.set(false); }
      });
    } else {
      this.productoService.create(dto).subscribe({
        next: () => { this.loading.set(false); this.router.navigate(['/productos']); },
        error: () => { this.errorMessage.set('Error al crear el producto.'); this.loading.set(false); }
      });
    }
  }

  cancelar(): void { this.router.navigate(['/productos']); }
}
