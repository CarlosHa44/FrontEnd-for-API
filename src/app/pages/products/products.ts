import { Component, effect, signal } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products {
  products!: ReturnType<ProductService['getProducts']>;
  isLoading!: ReturnType<ProductService['isLoading']>;
  errorMessage!: ReturnType<ProductService['getError']>;

  categories!: ReturnType<CategoryService['getCategories']>;
  categoriesLoading!: ReturnType<CategoryService['isLoading']>;

  form = signal<Omit<Product, 'id' | 'createdAt'>>({
    name: '',
    description: '',
    price: 0,
    categoryId: 0,
  });

  editingId: number | null = null;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService // inyectar servicio categorías
  ) {
    this.products = this.productService.getProducts();
    this.isLoading = this.productService.isLoading();
    this.errorMessage = this.productService.getError();

    this.categories = this.categoryService.getCategories();
    this.categoriesLoading = this.categoryService.isLoading();

    effect(() => {
      const error = this.errorMessage();
      if (!error) {
        this.resetForm();
      }
    });
  }

  save(): void {
    const data = this.form();
    if (this.editingId !== null) {
      this.productService.updateProduct(this.editingId, data);
    } else {
      this.productService.addProduct(data);
    }
  }

  edit(p: Product): void {
    this.editingId = p.id ?? null;
    this.form.set({
      name: p.name,
      description: p.description,
      price: p.price,
      categoryId: p.categoryId,
    });
    this.productService.clearError();
  }

  delete(id: number): void {
    this.productService.deleteProduct(id);
    if (this.editingId === id) this.resetForm();
  }

  resetForm(): void {
    this.editingId = null;
    this.form.set({ name: '', description: '', price: 0, categoryId: 0 });
  }
  getCategoryName(categoryId: number): string {
    const category = this.categories().find(c => c.id === categoryId);
    return category ? category.name : 'Sin categoría';
  }
  updateCategoryId(categoryId: string | number) {
    this.form.update(f => ({
      ...f,
      categoryId: Number(categoryId)
    }));
  }
}
