import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NotificationComponent } from '../notification/notification.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  user: any;
  notifications: any[] = [];
  showNotifications = false;
  email: string = 'userabc@gmail.com';

  
  constructor(private dialog: MatDialog) {
    this.user = {
      name: 'John Doe',
      email: 'userabc@gmail.com',
      phone: '1234567890',
      address: '123 Main St, City, Country',
      wasteType: 'Paper',
      wasteQuantity: 10,
      pickupDate: '2023-01-01',
      pickupTime: '10:00 AM',
      pickupLocation: 'Location A'
    };
  }

  openNotificationsDialog() {
    const dialogRef = this.dialog.open(NotificationComponent, {
      width: '400px',
      data: { notifications: this.notifications } // Pass notifications data
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
