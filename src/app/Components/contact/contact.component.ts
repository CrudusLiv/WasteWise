import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  fullName: string = '';
  email: string = '';
  subject: string = '';
  message: string = '';
  userId: string = '';

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.userId = this.authService.getUserId();
  }

  submitFeedback(): void {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.snackBar.open('Please log in to submit feedback', 'Close', { duration: 3000 });
      return;
    }

    const feedbackData = {
      userId: userId,  // This will be a valid MongoDB ObjectId from localStorage
      fullName: this.fullName,
      email: this.email,
      subject: this.subject,
      message: this.message
    };

    this.http.post('http://localhost:5000/api/feedback', feedbackData)
      .subscribe({
        next: (response) => {
          this.snackBar.open('Feedback submitted successfully', 'Close', { duration: 3000 });
          this.clearForm();
        },
        error: (error) => {
          console.log('Feedback Data:', feedbackData);
          this.snackBar.open('Error submitting feedback', 'Close', { duration: 3000 });
        }
      });
  }
  clearForm(): void {
    this.fullName = '';
    this.email = '';
    this.subject = '';
    this.message = '';
  }
}
