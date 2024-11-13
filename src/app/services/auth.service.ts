import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';

interface LoginResponse {
  userId: string;
  lastLogin: string;
  profileCompleted: boolean;
  message: string;
}

interface UserProfileData {
  username: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  residenceType: string;
  numberOfResidents: number;
  preferredPickupTime: string;
  email: string;
}

interface ProfileUpdateResponse {
  message: string;
  user: UserProfileData;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  checkUsername(username: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-username?username=${username}`)
      .pipe(catchError(this.handleError));
  }

  signup(userData: { 
    name: string; 
    email: string; 
    password: string; 
  }): Observable<any> {
    return this.checkUsername(userData.name).pipe(
      switchMap((exists: boolean) => {
        if (exists) {
          return throwError(() => 'Username already exists. Please choose a different username.');
        }
        
        const signupData = {
          username: userData.name,
          email: userData.email,
          password: userData.password,
          profileCompleted: false
        };
        
        return this.http.post(`${this.apiUrl}/signup`, signupData);
      }),
      catchError(this.handleError)
    );
  }

  login(credentials: { 
    email: string; 
    password: string; 
  }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('userId', response.userId);
          localStorage.setItem('lastLogin', response.lastLogin);
          localStorage.setItem('profileCompleted', String(response.profileCompleted));
        }),
        catchError(this.handleError)
      );
  }

  updateUserProfile(profileData: {
    fullName: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    residenceType: string;
    numberOfResidents: number;
    preferredPickupTime: string;
    userId?: string;
  }): Observable<ProfileUpdateResponse> {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      return throwError(() => 'User ID not found');
    }

    return this.http.put<ProfileUpdateResponse>(`${this.apiUrl}/user/${userId}/profile`, {
      ...profileData,
      profileCompleted: true
    }).pipe(
      tap(response => {
        localStorage.setItem('profileCompleted', 'true');
        localStorage.setItem('userProfile', JSON.stringify(response.user));
      }),
      catchError(error => {
        console.error('Profile update error:', error);
        return throwError(() => error.error?.message || 'Failed to update profile');
      })
    );
  }

  getNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notifications`)
      .pipe(catchError(this.handleError));
  }

  markNotificationAsRead(notificationId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/notifications/${notificationId}`, { status: 'read' })
      .pipe(catchError(this.handleError));
  }

  getUserProfile(): Observable<UserProfileData> {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      return throwError(() => 'User ID not found');
    }

    return this.http.get<UserProfileData>(`${this.apiUrl}/user/${userId}/profile`).pipe(
      tap(profile => {
        localStorage.setItem('userProfile', JSON.stringify(profile));
      }),
      catchError(error => {
        console.error('Profile fetch error:', error);
        return throwError(() => error.error?.message || 'Failed to fetch profile');
      })
    );
  }

  getUserId(): string {
    // Implement logic to return the user ID
    return 'someUserId'; // Replace with actual logic
  }

  getCurrentUserId(): string | null {
    // Assuming you store the user ID in local storage after login
    return localStorage.getItem('userId'); // Replace with your actual logic
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error.message || error.statusText;
    }
    return throwError(() => errorMessage);
  }
}
