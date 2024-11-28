import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { NotificationComponent } from '../notification/notification.component';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  private readonly apiUrl = 'http://localhost:5000/api'; 
  isMenuOpen = false;
  isAdmin = false;
  appTitle = 'WasteWise';
  @ViewChild('sidenav') sidenav!: MatSidenav;
  unreadCount = 0;

  notifications: any[] = [
    { id: 1, message: 'New collection schedule available', type: 'info', date: new Date() },
    { id: 2, message: 'Recycling pickup tomorrow', type: 'reminder', date: new Date() },
    { id: 3, message: 'Monthly report ready', type: 'alert', date: new Date() }
  ];

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Subscribe to router events to close menu on navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeMenu();
    });
    this.checkAdminStatus();
    
    // Update notification count every 5 seconds
    setInterval(() => {
      this.fetchUnreadNotifications();
    }, 5000);
  }

  ngOnInit() {
    this.fetchUnreadNotifications();
  }

  fetchUnreadNotifications() {
    this.http.get<any[]>('http://localhost:5000/api/notifications')
      .subscribe(notifications => {
        const currentUnreadCount = notifications.filter(n => n.status === 'unread').length;
        if (this.unreadCount !== currentUnreadCount) {
          this.unreadCount = currentUnreadCount;
        }
      });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
    if (this.sidenav) {
      this.sidenav.close();
    }
  }

  openNotifications(): void {
    const dialogRef = this.dialog.open(NotificationComponent, {
      width: '400px',
      data: { notifications: this.notifications }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.handleNotificationAction(result);
      }
    });
  }

  private handleNotificationAction(action: any) {
    console.log('Notification action:', action);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('userId');
  }

  logout(): void {
    localStorage.removeItem('userId');
    localStorage.removeItem('lastLogin');
    localStorage.removeItem('profileCompleted');
    this.router.navigate(['/access']);
  }

  addScheduleNotification(scheduleData: any) {
    const notification = {
      id: this.notifications.length + 1,
      message: `Schedule confirmed for ${scheduleData.date} at ${scheduleData.time}`,
      type: 'success',
      date: new Date()
    };
    this.notifications.unshift(notification);
  }

  private checkAdminStatus() {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.http.get<any>(`${this.apiUrl}/user/${userId}`).subscribe({
        next: (user) => {
          this.isAdmin = user.isAdmin || false;
        },
        error: () => {
          this.isAdmin = false;
          localStorage.clear(); // Clear invalid session data
          this.router.navigate(['/access']); // Redirect to login
        }
      });
    }
  }
}