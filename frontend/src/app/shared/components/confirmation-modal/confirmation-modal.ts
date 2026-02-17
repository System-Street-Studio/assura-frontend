import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmationDialogData {
    title: string;
    message: string;
}

@Component({
    selector: 'app-confirmation-modal',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule],
    template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">Confirm</button>
    </mat-dialog-actions>
  `
})
export class ConfirmationModalComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmationModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
    ) { }
}
