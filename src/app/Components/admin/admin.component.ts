import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;  // Added as top-level property
  profile: {
    fullName: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
  role: string;
  lastLogin: Date;
  isAdmin: boolean;
}
interface Feedback {
  _id: string;
  userId: string;
  message: string;
  createdAt: Date;
  subject: string;
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
  area: string;
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
  roles: string[] = ['user', 'admin'];
  private readonly apiUrl = 'http://localhost:5000/api';
  notifications: any[] = [];
  userForm: FormGroup = new FormGroup({});  // Initialize here

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }


  private initializeForm() {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      profile: this.fb.group({
        fullName: ['', Validators.required],
        phoneNumber: [''],
        address: [''],
        city: [''],
        state: [''],
        postalCode: ['']
      }),
      role: ['user', Validators.required]
    });
  }

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
            responseText: response
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
  
  updateScheduleStatus(scheduleId: string, status: 'completed' | 'cancelled'): void {
    const headers = this.getAuthHeaders();
  
    this.http.patch<Schedule>(`${this.apiUrl}/waste-collection/${scheduleId}`, { status }, { headers })
      .subscribe({
        next: (updatedSchedule) => {
          this.showSuccess(`Collection marked as ${status}`);
          this.loadSchedules();
        },
        error: (error) => this.handleError('updating collection status', error)
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
    
    // Auto-fill all form fields including fullName
    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      role: user.isAdmin ? 'admin' : 'user',
      profile: {
        fullName: user.fullName, // Direct access to fullName
        phoneNumber: user.profile?.phoneNumber || '',
        address: user.profile?.address || '',
        city: user.profile?.city || '',
        state: user.profile?.state || '',
        postalCode: user.profile?.postalCode || ''
      }
    });
    
    this.loadUserData();
  }
  loadUserData() {
    this.loading = true;
    this.loadFeedback();
    this.loadSchedules();
    this.loading = false;
  }

  saveUserChanges() {
    if (this.userForm.valid && this.selectedUser) {
      const formValues = this.userForm.getRawValue(); // Get all form values including disabled fields
      const updatedUser = {
        username: formValues.username,
        email: formValues.email,
        isAdmin: formValues.role === 'admin',
        fullName: formValues.profile.fullName, // Add fullName directly
        profile: {
          fullName: formValues.profile.fullName,
          phoneNumber: formValues.profile.phoneNumber,
          address: formValues.profile.address,
          city: formValues.profile.city,
          state: formValues.profile.state,
          postalCode: formValues.profile.postalCode
        }
      };
      
      const headers = this.getAuthHeaders();
      this.http.patch(`${this.apiUrl}/users/${this.selectedUser._id}`, updatedUser, { headers })
        .subscribe({
          next: () => {
            this.loadUsers();
            this.showSuccess('User information updated successfully');
            this.backToUsers();
          },
          error: (error) => this.handleError('updating user information', error)
        });
    }
  }

  backToUsers() {
    this.showUserList = true;
    this.selectedUser = null;
    this.userForm.reset();
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