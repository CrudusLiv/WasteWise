import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Notification {
  _id: string;
  title: string;
  message: string;
  userId: {
    username: string;
  };
  status: 'read' | 'unread';
  createdAt: Date;
  type: string;  // Adding the type property
}

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];
  loading = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.loading = true;
    this.authService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading notifications', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  markAsRead(notificationId: string) {
    this.authService.markNotificationAsRead(notificationId).subscribe({
      next: () => {
        const notification = this.notifications.find(n => n._id === notificationId);
        if (notification) {
          notification.status = 'read';
        }
      },
      error: (error) => {
        this.snackBar.open('Error updating notification', 'Close', { duration: 3000 });
      }
    });
  }

  deleteNotification(id: string) {
    this.http.delete(`http://localhost:5000/api/notifications/${id}`).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n._id !== id);
        this.snackBar.open('Notification deleted', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Error deleting notification', 'Close', { duration: 3000 });
      }
    });
  }

  deleteAllNotifications() {
    this.http.delete('http://localhost:5000/api/notifications').subscribe({
      next: () => {
        this.notifications = [];
        this.snackBar.open('All notifications deleted', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Error deleting notifications', 'Close', { duration: 3000 });
      }
    });
  }

  markAllAsRead() {
    this.http.patch('http://localhost:5000/api/notifications-mark-all-read', {}).subscribe({
      next: () => {
        this.notifications.forEach(n => n.status = 'read');
        this.snackBar.open('All notifications marked as read', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Error updating notifications', 'Close', { duration: 3000 });
      }
    });
  }
}