import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

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

  constructor(private http: HttpClient, private authService: AuthService) {
    this.userId = this.authService.getUserId(); // Get the user ID from AuthService
  }

  submitFeedback(): void {
    const userId = this.authService.getCurrentUserId();

    if (!userId) {
      console.error('User is not logged in');
      return;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const feedbackData = {
      userId: userId,
      fullName: this.fullName,
      email: this.email,
      subject: this.subject,
      message: this.message
    };

    this.http.post('http://localhost:5000/api/feedback', feedbackData, { headers })
      .subscribe({
        next: (response) => {
          console.log('Feedback submitted successfully', response);
          this.clearForm();
        },
        error: (error) => {
          console.error('Error submitting feedback:', error);
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
