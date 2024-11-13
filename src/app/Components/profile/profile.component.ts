import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationComponent } from '../notification/notification.component';

interface UserProfile {
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  residenceType: string;
  numberOfResidents: number;
  preferredPickupTime: string;
}

interface Notification {
  message: string;
  date: Date;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: UserProfile = {
    username: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    residenceType: '',
    numberOfResidents: 0,
    preferredPickupTime: ''
  };
  
  loading = true;
  notifications: Notification[] = [
    { message: 'New pickup scheduled', date: new Date() },
    { message: 'Collection completed', date: new Date() }
  ];

  @ViewChild('fileInput') fileInput!: ElementRef;
  profileImageUrl: string | null = null;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.loading = true;
    this.authService.getUserProfile().subscribe({
      next: (profileData) => {
        this.user = {
          ...profileData,
          username: profileData.username || '',
          email: localStorage.getItem('userEmail') || ''
        };
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading profile. Please try again.', 'Close', {
          duration: 3000
        });
        this.loading = false;
      }
    });
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
    this.router.navigate(['/profile-setup']);
  }

  getFormattedAddress(): string {
    return `${this.user.address}, ${this.user.city}, ${this.user.state} ${this.user.postalCode}`;
  }

  getResidenceInfo(): string {
    return `${this.user.residenceType} - ${this.user.numberOfResidents} residents`;
  }

  getPickupTimeLabel(): string {
    const times: { [key: string]: string } = {
      'morning': 'Morning (6AM - 10AM)',
      'afternoon': 'Afternoon (11AM - 3PM)',
      'evening': 'Evening (4PM - 8PM)'
    };
    return times[this.user.preferredPickupTime] || this.user.preferredPickupTime;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profileImage', file);
      formData.append('userId', this.authService.getUserId());

      this.http.post('http://localhost:5000/api/upload-profile-image', formData)
        .subscribe({
          next: (response: any) => {
            this.profileImageUrl = response.imageUrl;
            this.snackBar.open('Profile picture updated successfully', 'Close', {
              duration: 3000
            });
          },
          error: (error: Error) => {
            console.error('Error uploading profile picture:', error);
            this.snackBar.open('Error uploading profile picture', 'Close', {
              duration: 3000
            });
          }
        });
    }
  }
}