import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Notification {
  _id: string;
  title: string;
  message: string;
  status: string;
  createdAt: Date;
  responseText: string;
  feedbackId?: string;
}

interface FeedbackNotification {
  title: string;
  message: string;
  status: string;
  feedbackId?: string;
  adminResponse?: string;
}


@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  private readonly apiUrl = 'http://localhost:5000/api';
  notifications: Notification[] = [];
  displayedNotifications: Notification[] = [];
  unreadCount = 0;
  selectedNotification: string | null = null;
  currentIndex = 0;
  readonly maxDisplayed = 3;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadNotifications();
    this.updateUnreadCount();
  }

  toggleNotificationDetails(notificationId: string): void {
    this.selectedNotification = this.selectedNotification === notificationId ? null : notificationId;
  }

  updateUnreadCount() {
    this.unreadCount = this.notifications.filter(n => n.status === 'unread').length;
  }

  scrollNotifications(direction: 'up' | 'down') {
    if (direction === 'down' && this.currentIndex + this.maxDisplayed < this.notifications.length) {
      this.currentIndex++;
    } else if (direction === 'up' && this.currentIndex > 0) {
      this.currentIndex--;
    }
    this.updateDisplayedNotifications();
  }

  updateDisplayedNotifications() {
    this.displayedNotifications = this.notifications.slice(
      this.currentIndex,
      this.currentIndex + this.maxDisplayed
    );
  }

  loadNotifications() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
  
    this.http.get<Notification[]>(`${this.apiUrl}/notifications`)
      .subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          this.updateDisplayedNotifications();
          this.updateUnreadCount();
        },
        error: (error) => console.error('Error:', error)
      });
  }

  markAsRead(notificationId: string) {
    this.authService.markNotificationAsRead(notificationId).subscribe({
      next: () => {
        const notification = this.notifications.find(n => n._id === notificationId);
        if (notification) {
          notification.status = 'read';
          this.updateUnreadCount();
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
  
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'report':
        return 'description';
      case 'collection':
        return 'local_shipping';
      case 'feedback':
        return 'feedback';
      default:
        return 'notifications';
    }
  }

  displayFeedbackNotification(notification: FeedbackNotification) {
    const displayMessage = notification.adminResponse 
      ? `Admin Response: ${notification.adminResponse}`
      : 'Your feedback has been received and is being reviewed by our team.';

    return {
      title: 'Feedback Update',
      message: displayMessage,
      status: 'unread',
      type: 'feedback'
    };
  }
}