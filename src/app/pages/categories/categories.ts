import { Component, effect, OnInit, signal } from '@angular/core';
import { Category } from '../../core/models/category.model';
import { CategoryService } from '../../core/services/category.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
  standalone: true
})
export class Categories {
  categories: ReturnType<CategoryService['getCategories']>;
  isLoading: ReturnType<CategoryService['isLoading']>;
  errorMessage: ReturnType<CategoryService['getError']>;

  form = signal<Category>({ name: '', description: '' });

  constructor(private categoryService: CategoryService) {
    this.categories = this.categoryService.getCategories();
    this.isLoading = this.categoryService.isLoading();
    this.errorMessage = this.categoryService.getError();

    effect(() => {
      const error = this.errorMessage();
      if (!error) {
        this.resetForm();
      }
    });
  }

  save(): void {
    const data = this.form();

    if (data.id) {
      this.categoryService.updateCategory(data.id, data);
    } else {
      this.categoryService.addCategory(data);
    }
  }

  edit(c: Category): void {
    this.form.set({ ...c });
    this.categoryService.clearError();
  }

  delete(id: number): void {
    this.categoryService.deleteCategory(id);
  }

  resetForm(): void {
    this.form.set({ name: '', description: '' });
  }
}
