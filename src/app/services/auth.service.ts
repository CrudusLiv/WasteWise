import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';

interface LoginResponse {
  userId: string;
  lastLogin: string;
  profileCompleted: boolean;
  username: string;
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

interface NotificationData {
  date?: string;
  time?: string;
  reportType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api';
  
  // Event emitters
  public signupEvent = new Subject<void>();
  public collectionEvent = new Subject<NotificationData>();
  public feedbackEvent = new Subject<void>();
  public profileEvent = new Subject<void>();
  public reportEvent = new Subject<string>();

  constructor(private http: HttpClient) {}

  getAuthToken(): string {
    return localStorage.getItem('token') || '';
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

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
        
        return this.http.post(`${this.apiUrl}/signup`, signupData).pipe(
          catchError(this.handleError)
        );
      })
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
          localStorage.setItem('username', response.username);
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

  saveNotification(notification: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/notifications`, notification);
  }

  getNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notifications`);
  }

  markNotificationAsRead(notificationId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/notifications/${notificationId}`, {
      status: 'read'
    });
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
    return 'someUserId';
  }

  getCurrentUserId(): string | null {
    return localStorage.getItem('userId');
  }

  // Trigger notification events
  emitSignupEvent(): void {
    this.signupEvent.next();
  }

  emitCollectionEvent(data: NotificationData): void {
    this.collectionEvent.next(data);
  }

  emitFeedbackEvent(): void {
    this.feedbackEvent.next();
  }

  emitProfileEvent(): void {
    this.profileEvent.next();
  }

  emitReportEvent(reportType: string): void {
    this.reportEvent.next(reportType);
  }
}