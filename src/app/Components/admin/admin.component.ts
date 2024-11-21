import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  users: any[] = [];
  feedback: any[] = [];
  schedules: any[] = [];
  loading = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.checkAdminAccess();
    this.loadAllData();
  }

  private checkAdminAccess() {
    const userId = localStorage.getItem('userId');
    this.http.get<any>(`http://localhost:5000/api/user/${userId}`).subscribe({
      next: (user) => {
        if (!user.isAdmin) {
          this.router.navigate(['/']);
          this.snackBar.open('Access denied: Admin privileges required', 'Close', { duration: 3000 });
        }
      },
      error: () => this.router.navigate(['/'])
    });
  }

  private loadAllData() {
    this.loading = true;
    this.loadUsers();
    this.loadFeedback();
    this.loadSchedules();
    this.loading = false;
  }

  private loadUsers() {
    this.http.get<any[]>('http://localhost:5000/api/users').subscribe({
      next: (data) => this.users = data,
      error: (error) => this.handleError('loading users', error)
    });
  }

  private loadFeedback() {
    this.http.get<any[]>('http://localhost:5000/api/feedback').subscribe({
      next: (data) => this.feedback = data,
      error: (error) => this.handleError('loading feedback', error)
    });
  }

  private loadSchedules() {
    this.http.get<any[]>('http://localhost:5000/api/waste-collection').subscribe({
      next: (data) => this.schedules = data,
      error: (error) => this.handleError('loading schedules', error)
    });
  }

  updateUserStatus(userId: string, isActive: boolean) {
    this.http.patch(`http://localhost:5000/api/user/${userId}/status`, { isActive }).subscribe({
      next: () => {
        this.loadUsers();
        this.snackBar.open('User status updated successfully', 'Close', { duration: 3000 });
      },
      error: (error) => this.handleError('updating user status', error)
    });
  }

  updateScheduleStatus(scheduleId: string, status: string) {
    this.http.patch(`http://localhost:5000/api/waste-collection/${scheduleId}`, { status }).subscribe({
      next: () => {
        this.loadSchedules();
        this.snackBar.open('Schedule status updated successfully', 'Close', { duration: 3000 });
      },
      error: (error) => this.handleError('updating schedule status', error)
    });
  }

  deleteFeedback(feedbackId: string) {
    this.http.delete(`http://localhost:5000/api/feedback/${feedbackId}`).subscribe({
      next: () => {
        this.loadFeedback();
        this.snackBar.open('Feedback deleted successfully', 'Close', { duration: 3000 });
      },
      error: (error) => this.handleError('deleting feedback', error)
    });
  }

  private handleError(action: string, error: any) {
    console.error(`Error ${action}:`, error);
    this.snackBar.open(`Error ${action}`, 'Close', { duration: 3000 });
  }
}