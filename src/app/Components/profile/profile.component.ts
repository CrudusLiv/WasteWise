import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NotificationComponent } from '../notification/notification.component';

interface UserProfile {
  fullName: string;
  communityName: string;
  email: string;
  contactNumber: string;
  residentialAddress: string;
}

interface Notification {
  message: string;
  date: Date;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: UserProfile = {
    fullName: 'John Doe',
    communityName: 'Subang Jaya',
    email: 'john.doe@example.com',
    contactNumber: '+60 12-345-6789',
    residentialAddress: 'Bandar Sunway, Subang Jaya, Selangor, 47500'
  };
  
  notifications: Notification[] = [
    { message: 'New pickup scheduled', date: new Date() },
    { message: 'Collection completed', date: new Date() }
  ];

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    // Initialize any necessary data
  }

  openNotificationsDialog(): void {
    const dialogRef = this.dialog.open(NotificationComponent, {
      width: '400px',
      data: { notifications: this.notifications },
      ariaLabel: 'Notifications dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
  }

  onEditProfile(): void {
    console.log('Edit profile clicked');
    // Implement edit profile logic here
  }

  getNotificationsLabel(): string {
    const count = this.notifications.length;
    return `You have ${count} ${count === 1 ? 'notification' : 'notifications'}`;
  }
}
