import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:8081/api/products';

  private products = signal<Product[]>([]);
  private loading = signal(false);
  private error = signal<string | null>(null);

  constructor(private http: HttpClient) {
    this.fetchProducts();
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error al cargar productos';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
    }
    this.error.set(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  fetchProducts() {
    this.loading.set(true);
    this.http.get<Product[]>(this.apiUrl)
      .pipe(catchError(this.handleError.bind(this)))
      .subscribe({
        next: (data) => {
          this.products.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  getProducts() {
    return this.products.asReadonly();
  }

  addProduct(product: Omit<Product, 'id' | 'createdAt'>) {
    this.loading.set(true);
    return this.http.post<Product>(this.apiUrl, product)
      .pipe(catchError(this.handleError.bind(this)))
      .subscribe({
        next: (newProduct) => {
          this.products.update(products => [...products, newProduct]);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  updateProduct(id: number, product: Partial<Product>) {
    this.loading.set(true);
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product)
      .pipe(catchError(this.handleError.bind(this)))
      .subscribe({
        next: (updatedProduct) => {
          this.products.update(products =>
            products.map(p => p.id === id ? updatedProduct : p)
          );
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  deleteProduct(id: number) {
    this.loading.set(true);
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError.bind(this)))
      .subscribe({
        next: () => {
          this.products.update(products => products.filter(p => p.id !== id));
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  isLoading() {
    return this.loading.asReadonly();
  }

  getError() {
    return this.error.asReadonly();
  }

  clearError() {
    this.error.set(null);
  }
}
