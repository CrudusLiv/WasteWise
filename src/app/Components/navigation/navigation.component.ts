import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NotificationComponent } from '../notification/notification.component';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
})
export class NavigationComponent {
  isMenuOpen = false;
  appTitle = 'WasteWise';

  constructor(private dialog: MatDialog) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
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
