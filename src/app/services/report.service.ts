import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  generateFeedbackReport(userId: string, dateRange: {start: Date, end: Date}): Observable<any> {
    return this.http.post(`${this.apiUrl}/reports/feedback`, {
      userId,
      startDate: dateRange.start,
      endDate: dateRange.end
    });
  }

  generateScheduleReport(userId: string, dateRange: {start: Date, end: Date}): Observable<any> {
    return this.http.post(`${this.apiUrl}/reports/schedules`, {
      userId,
      startDate: dateRange.start,
      endDate: dateRange.end
    });
  }
}
