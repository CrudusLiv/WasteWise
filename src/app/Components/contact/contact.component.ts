import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from '../../services/notification.service';

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
    private snackBar: MatSnackBar,
    private notificationService: NotificationService
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
      userId,
      fullName: this.fullName,
      email: this.email,
      subject: this.subject,
      message: this.message
    };

    this.http.post('http://localhost:5000/api/feedback', feedbackData).subscribe({
      next: () => {
        // Create notification with required fields matching the schema
        const notificationData = {
          title: 'New Feedback Received',
          message: `${this.subject} - ${this.message.substring(0, 100)}`,
          userId: userId,
          status: 'unread'
        };

        this.http.post('http://localhost:5000/api/notifications', notificationData).subscribe({
          next: () => {
            this.snackBar.open('Feedback submitted successfully', 'Close', { duration: 3000 });
            this.clearForm();
          },
          error: (error) => {
            console.error('Notification error:', error);
            this.clearForm();
          }
        });
      },
      error: () => {
        this.snackBar.open('Error submitting feedback', 'Close', { duration: 3000 });
      }
    });
  }  clearForm(): void {
    this.fullName = '';
    this.email = '';
    this.subject = '';
    this.message = '';
  }
}