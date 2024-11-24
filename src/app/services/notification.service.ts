import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:5000/api/notification';

  constructor(private http: HttpClient) {}

  addNotification(notification: any): Observable<any> {
    const payload = {
      title: notification.title,
      message: notification.message,
      adminId: notification.adminId,
      status: 'unread'
    };
    return this.http.post(this.apiUrl, payload);
  }

  getNotifications(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  markAsRead(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, { status: 'read' });
  }
}