import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-feedback-response-dialog',
  templateUrl: './feedback-response-dialog.component.html',
  styleUrls: ['./feedback-response-dialog.component.css']
})
export class FeedbackResponseDialogComponent {
  response: string;

  constructor(
    public dialogRef: MatDialogRef<FeedbackResponseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.response = data.existingResponse;
  }
}