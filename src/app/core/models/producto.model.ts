export interface Producto { id: string; nombre: string; codigo: string; precio: number; stock: number; }
export interface CreateProductoDto { nombre: string; codigo: string; precio: number; stock: number; }
export interface UpdateProductoDto { id: string; nombre: string; codigo: string; precio: number; stock: number; }
