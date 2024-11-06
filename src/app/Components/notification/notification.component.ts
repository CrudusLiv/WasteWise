import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Notification {
  _id: string;
  title: string;
  message: string;
  adminId: {
    username: string;
  };
  status: 'read' | 'unread';
  createdAt: Date;
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
}
