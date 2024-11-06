import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { NotificationComponent } from '../notification/notification.component';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
})
export class NavigationComponent {
  isMenuOpen = false;
  appTitle = 'WasteWise';
  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(
    private dialog: MatDialog,
    private router: Router
  ) {
    // Subscribe to router events to close menu on navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeMenu();
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
      data: {
        notifications: [
          { id: 1, message: 'New collection schedule available', type: 'info', date: new Date() },
          { id: 2, message: 'Recycling pickup tomorrow', type: 'reminder', date: new Date() },
          { id: 3, message: 'Monthly report ready', type: 'alert', date: new Date() }
        ]
      }
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
}
