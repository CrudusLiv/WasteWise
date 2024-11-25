import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FeedbackResponseDialogComponent } from '../feedback-response-dialog/feedback-response-dialog.component';

interface User {
  _id: string;
  username: string;
  email: string;
  profile: {
    fullName: string;
    phoneNumber: string;
    address: string;
  };
  isActive: boolean;
  role: string;
  lastLogin: Date;
}

interface Feedback {
  _id: string;
  userId: string;
  message: string;
  rating: number;
  createdAt: Date;
  subject: string;  // Added subject property
  response?: {
    response: string;
  };
}

interface Schedule {
  _id: string;
  userId: string;
  date: Date;
  time: string;
  status: string;
  wasteType: string;
  area: string;  // Added area property
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  users: User[] = [];
  feedback: Feedback[] = [];
  schedules: Schedule[] = [];
  loading = false;
  showUserList = true;
  selectedUserId: string = '';
  displayedUserColumns: string[] = ['username', 'email', 'role', 'lastLogin', 'actions'];
  selectedUser: User | null = null;
  roles: string[] = ['user', 'admin', 'moderator'];
  private readonly apiUrl = 'http://localhost:5000/api';
  notifications: any[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadAllData();
  }

  private loadAllData() {
    this.loading = true;
    this.loadUsers();
    this.loading = false;
  }

  private loadUsers() {
    const headers = new HttpHeaders().set(
      'Authorization', 'Bearer ' + this.authService.getAuthToken()
    );
    
    this.http.get<User[]>(`${this.apiUrl}/users`, { headers })
      .subscribe({
        next: (data) => this.users = data,
        error: (error) => this.handleError('loading users', error)
      });
  }

  private loadFeedback() {
    if (!this.selectedUserId) return;
    
    const headers = this.getAuthHeaders();
    this.http.get<Feedback[]>(`${this.apiUrl}/feedback/user/${this.selectedUserId}`, { headers })
      .subscribe({
        next: (data) => this.feedback = data,
        error: (error) => this.handleError('loading feedback', error)
      });
  }

  private loadSchedules() {
    if (!this.selectedUserId) return;
    
    const headers = this.getAuthHeaders();
    this.http.get<Schedule[]>(`${this.apiUrl}/waste-collection?userId=${this.selectedUserId}`, { headers })
      .subscribe({
        next: (data) => this.schedules = data,
        error: (error) => this.handleError('loading schedules', error)
      });
  }

  updateUserStatus(userId: string, isActive: boolean) {
    const headers = new HttpHeaders().set(
      'Authorization', 'Bearer ' + this.authService.getAuthToken()
    );

    this.http.patch(`${this.apiUrl}/users/${userId}/status`, { isActive }, { headers })
      .subscribe({
        next: () => {
          this.loadUsers();
          this.showSuccess('User status updated successfully');
        },
        error: (error) => this.handleError('updating user status', error)
      });
  }
  
  respondToFeedback(feedbackId: string, response: string): void {
    const headers = this.getAuthHeaders();
    console.log('Sending response:', response);
    
    this.http.post(`${this.apiUrl}/feedback/${feedbackId}/respond`, { response }, { headers })
      .subscribe({
        next: (feedback) => {
          console.log('Feedback updated:', feedback);
          const notificationData = {
            title: 'Feedback Response',
            message: 'Your feedback has received a response',
            userId: this.selectedUserId,
            status: 'unread',
            responseText: response // Store response directly
          };
  
          this.http.post(`${this.apiUrl}/notifications`, notificationData, { headers })
            .subscribe({
              next: (notification) => {
                console.log('Notification created:', notification);
                this.showSuccess('Response sent successfully');
                this.loadFeedback();
              },
              error: (error) => this.handleError('creating notification', error)
            });
        },
        error: (error) => this.handleError('responding to feedback', error)
      });
  }
  
  
  
  updateScheduleStatus(scheduleId: string, status: 'completed' | 'dropped'): void {
    const headers = this.getAuthHeaders();
    this.http.patch(`${this.apiUrl}/waste-collection/${scheduleId}`, { status }, { headers })
      .subscribe({
        next: () => {
          this.showSuccess(`Schedule marked as ${status}`);
          this.loadSchedules();
        },
        error: (error: any) => this.handleError('updating schedule status', error)
      });
  }

  deleteSchedule(scheduleId: string): void {
    const headers = this.getAuthHeaders();
    this.http.delete(`${this.apiUrl}/waste-collection/${scheduleId}`, { headers })
      .subscribe({
        next: () => {
          this.showSuccess('Schedule deleted successfully');
          this.loadSchedules();
        },
        error: (error: any) => this.handleError('deleting schedule', error)
      });
  }
  deleteFeedback(feedbackId: string) {
    const headers = new HttpHeaders().set(
      'Authorization', 'Bearer ' + this.authService.getAuthToken()
    );

    this.http.delete(`${this.apiUrl}/feedback/${feedbackId}`, { headers })
      .subscribe({
        next: () => {
          this.loadFeedback();
          this.showSuccess('Feedback deleted successfully');
        },
        error: (error) => this.handleError('deleting feedback', error)
      });
  }

  onUserSelect(user: User) {
    this.selectedUser = user;
    this.selectedUserId = user._id;
    this.showUserList = false;
    this.loadUserData();
  }

  loadUserData() {
    this.loading = true;
    this.loadFeedback();
    this.loadSchedules();
    this.loading = false;
  }

  backToUsers() {
    this.showUserList = true;
    this.selectedUser = null;
    this.feedback = [];
    this.schedules = [];
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  private handleError(action: string, error: any) {
    console.error(`Error ${action}:`, error);
    this.snackBar.open(`Error ${action}. Please try again.`, 'Close', { duration: 3000 });
  }

  editUser(user: User) {
    this.selectedUser = {...user};
  }

  saveUserChanges(user: User) {
    const headers = new HttpHeaders().set(
      'Authorization', 'Bearer ' + this.authService.getAuthToken()
    );

    this.http.put(`${this.apiUrl}/users/${user._id}`, user, { headers })
      .subscribe({
        next: () => {
          this.loadUsers();
          this.selectedUser = null;
          this.showSuccess('User updated successfully');
        },
        error: (error) => this.handleError('updating user', error)
      });
  }

  deleteUser(userId: string) {
    const headers = new HttpHeaders().set(
      'Authorization', 'Bearer ' + this.authService.getAuthToken()
    );

    this.http.delete(`${this.apiUrl}/users/${userId}`, { headers })
      .subscribe({
        next: () => {
          this.loadUsers();
          this.showSuccess('User deleted successfully');
        },
        error: (error) => this.handleError('deleting user', error)
      });
  }
  
  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders().set(
      'Authorization', 'Bearer ' + this.authService.getAuthToken()
    );
  }

  openResponseDialog(feedback: Feedback): void {
    const dialogRef = this.dialog.open(FeedbackResponseDialogComponent, {
      width: '500px',
      data: {
        feedback,
        existingResponse: feedback.response?.response || ''
      }
    });

    dialogRef.afterClosed().subscribe((response: string) => {
      if (response) {
        if (feedback.response) {
          this.editFeedbackResponse(feedback._id, response);
        } else {
          this.respondToFeedback(feedback._id, response);
        }
      }
    });
  }

  editFeedbackResponse(feedbackId: string, newResponse: string): void {
    const headers = this.getAuthHeaders();
    
    this.http.post(`${this.apiUrl}/feedback/${feedbackId}/respond`, 
      { response: newResponse }, 
      { headers }
    ).subscribe({
      next: () => {
        this.showSuccess('Response updated successfully');
        this.loadFeedback();
      },
      error: (error: any) => this.handleError('updating feedback response', error)
    });
  }

  deleteNotification(notificationId: string) {
    const headers = this.getAuthHeaders();
    this.http.delete(`${this.apiUrl}/notifications/${notificationId}`, { headers })
      .subscribe({
        next: () => {
          this.showSuccess('Notification deleted successfully');
          this.loadFeedback();
        },
        error: (error) => this.handleError('deleting notification', error)
      });
  }
}