import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

interface UserProfile {
  address: string;
  city: string;
  state: string;
  postalCode: string;
}

@Component({
  selector: 'app-waste-collection',
  templateUrl: './waste-collection.component.html',
  styleUrls: ['./waste-collection.component.css']
})
export class WasteCollectionComponent implements OnInit {
  collectionForm!: FormGroup;
  userAddress: string = '';
  
  wasteTypes = [
    { id: 'household', name: 'Household Waste', icon: 'home' },
    { id: 'recyclable', name: 'Recyclable Waste', icon: 'recycling' },
    { id: 'hazardous', name: 'Hazardous Waste', icon: 'warning' },
    { id: 'green', name: 'Green Waste', icon: 'grass' },
    { id: 'electronic', name: 'Electronic Waste', icon: 'devices' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUserProfile();
    this.initializeForm();
  }

  loadUserProfile() {
    this.authService.getUserProfile().subscribe({
      next: (profile: UserProfile) => {
        this.userAddress = `${profile.address}, ${profile.city}, ${profile.state} ${profile.postalCode}`;
        this.collectionForm.patchValue({
          address: this.userAddress
        });
      },
      error: () => {
        this.snackBar.open('Error loading user profile', 'Close', {
          duration: 3000
        });
      }
    });
  }

  private initializeForm() {
    this.collectionForm = this.fb.group({
      address: ['', Validators.required],
      date: ['', Validators.required],
      wasteType: ['', Validators.required],
      notes: ['']
    });
  }

  onSubmit() {
    if (this.collectionForm.valid) {
      const userId = localStorage.getItem('userId');
      const scheduleData = {
        ...this.collectionForm.value,
        userId
      };

      this.http.post('http://localhost:5000/api/waste-collection/schedule', scheduleData)
        .subscribe({
          next: () => {
            this.snackBar.open('Collection scheduled successfully!', 'Close', {
              duration: 3000
            });
            this.collectionForm.reset();
          },
          error: () => {
            this.snackBar.open('Error scheduling collection', 'Close', {
              duration: 3000
            });
          }
        });
    }
  }
}