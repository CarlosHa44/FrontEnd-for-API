import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Category } from '../models/category.model';
import { environment } from '../environment/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private apiUrl = environment.apiUrl.categories; // URL del backend

  // Señales
  private categories = signal<Category[]>([]);
  private loading = signal(false);
  private error = signal<string | null>(null);

  constructor(private http: HttpClient) {
    this.fetchCategories();
  }

  // Manejo de errores reutilizable
  private handleError(error: HttpErrorResponse) {
    let message = 'Error al procesar la solicitud';
    if (error.error instanceof ErrorEvent) {
      message = `Error del cliente: ${error.error.message}`;
    } else {
      message = `Error del servidor (${error.status}): ${error.message}`;
    }
    this.error.set(message);
    return throwError(() => new Error(message));
  }

  // Obtener todas las categorías desde el backend
  fetchCategories() {
    this.loading.set(true);
    this.http.get<Category[]>(this.apiUrl)
      .pipe(catchError(this.handleError.bind(this)))
      .subscribe({
        next: (data) => {
          this.categories.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  // Crear una categoría y actualizar localmente
  addCategory(category: Omit<Category, 'id' | 'createdAt'>) {
    this.loading.set(true);
    this.http.post<Category>(this.apiUrl, category)
      .pipe(catchError(this.handleError.bind(this)))
      .subscribe({
        next: (newCategory) => {
          this.categories.update((list) => [...list, newCategory]);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  // Actualizar una categoría
  updateCategory(id: number, category: Partial<Category>) {
    this.loading.set(true);
    this.http.put<Category>(`${this.apiUrl}/${id}`, category)
      .pipe(catchError(this.handleError.bind(this)))
      .subscribe({
        next: (updated) => {
          this.categories.update((list) =>
            list.map((c) => (c.id === id ? updated : c))
          );
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  // Eliminar una categoría
  deleteCategory(id: number) {
    this.loading.set(true);
    this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError.bind(this)))
      .subscribe({
        next: () => {
          this.categories.update((list) => list.filter((c) => c.id !== id));
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  // Métodos públicos para usar las señales
  getCategories() {
    return this.categories.asReadonly();
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
