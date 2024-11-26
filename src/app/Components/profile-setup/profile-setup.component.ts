import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';

enum ResidenceType {
  HOUSE = 'House',
  APARTMENT = 'Apartment',
  CONDO = 'Condo',
  OTHER = 'Other'
}

enum PickupTime {
  MORNING = 'Morning',
  AFTERNOON = 'Afternoon',
  EVENING = 'Evening'
}

interface ProfileData {
  fullName: string;
  username: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  residenceType: string;
  numberOfResidents: number;
  preferredPickupTime: string;
  userId?: string;
}

@Component({
  selector: 'app-profile-setup',
  templateUrl: './profile-setup.component.html',
  styleUrls: ['./profile-setup.component.css']
})
export class ProfileSetupComponent implements OnInit {
  private readonly apiUrl = 'http://localhost:5000/api';
  profileForm: FormGroup;
  loading = false;
  isNewUser: boolean = false;

  states = [
    'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan',
    'Pahang', 'Perak', 'Perlis', 'Pulau Pinang', 'Sabah',
    'Sarawak', 'Selangor', 'Terengganu', 'Kuala Lumpur',
    'Labuan', 'Putrajaya'
  ];

  residenceTypes = Object.values(ResidenceType);
  pickupTimes = Object.values(PickupTime);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[a-zA-Z0-9_]*'),



      ]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,11}$')]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
      residenceType: ['', Validators.required],
      numberOfResidents: ['', [Validators.required, Validators.min(1)]],
      preferredPickupTime: ['', Validators.required]
    });
  }

  private loadExistingProfile(): void {
    const userId = localStorage.getItem('userId');
    this.http.get<ProfileData>(`${this.apiUrl}/user/${userId}`).subscribe({
      next: (profile: ProfileData) => {
        this.profileForm.patchValue(profile);
      },
      error: (error: any) => {
        this.snackBar.open('Error loading profile data', 'Close', { duration: 3000 });
      }
    });
  }

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    this.isNewUser = navigation?.extras?.state?.['isNewUser'] || false;
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.router.navigate(['/access']);
      return;
    }

    if (!this.isNewUser) {
      this.loadExistingProfile();
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      const userId = localStorage.getItem('userId');
      const profileData: ProfileData = {
        ...this.profileForm.value,
        userId
      };

      this.authService.updateUserProfile(profileData).subscribe({
        next: (response) => {
          this.snackBar.open(this.isNewUser ? 'Profile setup completed!' : 'Profile updated successfully!', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          let errorMessage = 'Error updating profile. ';
          if (error.error?.errors) {
            Object.keys(error.error.errors).forEach(key => {
              errorMessage += `${error.error.errors[key].message} `;
            });
          }
          this.snackBar.open(errorMessage, 'Close', {
            duration: 3000
          });
          this.loading = false;
        }
      });
    }
  }
}