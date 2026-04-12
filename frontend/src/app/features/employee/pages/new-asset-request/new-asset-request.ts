import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssetService } from '../../services/asset-request.service';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/auth/auth.service';
import { CategoryService } from '../../../inventory/services/category.service';
import { Category } from '../../../inventory/models/category.model';


@Component({
  selector: 'app-new-asset-request',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  templateUrl: './new-asset-request.html',
  styleUrl: './new-asset-request.css',
})
export class NewAssetRequestComponent implements OnInit {
  private authService = inject(AuthService);
  private categoryService = inject(CategoryService);

  categories = signal<Category[]>([]);

  requestData = {
    id: 0,
    employeeId: this.authService.getUserId() || '',
    assetCategory: '',
    assetName: '',
    description: '',
    quantity: 1,
    priority: 'Normal',
    reason: '',
    status: 'Pending',
    requestType: 'New Asset',
    submittedDate: new Date(),
    submittedBy: this.authService.getUserName() || 'Employee'
  };

  constructor(private router: Router, private assetService: AssetService) { }

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: (cats) => this.categories.set(cats),
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  onSubmit() {
    this.assetService.createRequest(this.requestData).subscribe({
      next: (res: any) => {
        console.log('Backend Response:', res);
        alert(res.message || 'Request submitted successfully!');
        this.router.navigate(['/employee/requests-main']);
      },
      error: (err: any) => console.error('Save failed', err)
    });
  }
}