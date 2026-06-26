import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DivisionService } from '../../../inventory/services/division.service';
import { CategoryService } from '../../../inventory/services/category.service';
import { Division } from '../../../inventory/models/division.model';
import { Category } from '../../../inventory/models/category.model';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-master-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './master-data.component.html',
  styleUrls: ['./master-data.component.css']
})
export class MasterDataComponent implements OnInit {
  private divisionService = inject(DivisionService);
  private categoryService = inject(CategoryService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  activeTab: 'divisions' | 'categories' = 'divisions';
  
  divisions: Division[] = [];
  categories: Category[] = [];

  showForm = false;
  isEditing = false;
  editingId: number | null = null;
  
  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['']
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    if (this.activeTab === 'divisions') {
      this.divisionService.getAll().subscribe(data => this.divisions = data);
    } else {
      this.categoryService.getAll().subscribe(data => this.categories = data);
    }
  }

  switchTab(tab: 'divisions' | 'categories') {
    this.activeTab = tab;
    this.closeForm();
    this.loadData();
  }

  openAddForm() {
    this.isEditing = false;
    this.editingId = null;
    this.form.reset();
    this.showForm = true;
  }

  openEditForm(item: any) {
    this.isEditing = true;
    this.editingId = item.id;
    this.form.patchValue({
      name: item.name,
      description: item.description
    });
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.form.reset();
  }

  submitForm() {
    if (this.form.invalid) return;

    const data = this.form.value;
    const itemName = this.activeTab === 'divisions' ? 'Division' : 'Category';

    if (this.activeTab === 'divisions') {
      if (this.isEditing && this.editingId) {
        this.divisionService.update(this.editingId, data).subscribe({
          next: () => {
            this.toastService.show(`${itemName} updated successfully!`, 'success');
            this.closeForm();
            this.loadData();
          },
          error: (err) => {
            console.error(err);
            this.toastService.show(`Failed to update ${itemName}. Make sure backend is running.`, 'error');
          }
        });
      } else {
        this.divisionService.create(data).subscribe({
          next: () => {
            this.toastService.show(`${itemName} added successfully!`, 'success');
            this.closeForm();
            this.loadData();
          },
          error: (err) => {
            console.error(err);
            this.toastService.show(`Failed to add ${itemName}. Make sure backend is running.`, 'error');
          }
        });
      }
    } else {
      if (this.isEditing && this.editingId) {
        this.categoryService.update(this.editingId, data).subscribe({
          next: () => {
            this.toastService.show(`${itemName} updated successfully!`, 'success');
            this.closeForm();
            this.loadData();
          },
          error: (err) => {
            console.error(err);
            this.toastService.show(`Failed to update ${itemName}. Make sure backend is running.`, 'error');
          }
        });
      } else {
        this.categoryService.create(data).subscribe({
          next: () => {
            this.toastService.show(`${itemName} added successfully!`, 'success');
            this.closeForm();
            this.loadData();
          },
          error: (err) => {
            console.error(err);
            this.toastService.show(`Failed to add ${itemName}. Make sure backend is running.`, 'error');
          }
        });
      }
    }
  }

  deleteItem(id: number) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const itemName = this.activeTab === 'divisions' ? 'Division' : 'Category';

    if (this.activeTab === 'divisions') {
      this.divisionService.delete(id).subscribe(() => {
        this.toastService.show(`${itemName} deleted successfully!`, 'success');
        this.loadData();
      });
    } else {
      this.categoryService.delete(id).subscribe(() => {
        this.toastService.show(`${itemName} deleted successfully!`, 'success');
        this.loadData();
      });
    }
  }
}
