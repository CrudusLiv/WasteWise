import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';

interface Report {
  id: string;
  date: Date;
  type: string;
  data: any;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  reports: Report[] = [];
  loading = false;
  dateRange = {
    start: new Date(),
    end: new Date()
  };

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading = true;
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.snackBar.open('User not authenticated', 'Close', { duration: 3000 });
      return;
    }

    // Get waste collection schedules
    this.http.get<any[]>(`http://localhost:5000/api/waste-collection/schedule`)
      .subscribe({
        next: (scheduleData) => {
          const userSchedules = scheduleData.filter(schedule => schedule.userId === userId);
          this.reports = userSchedules.map(schedule => ({
            id: schedule._id,
            date: new Date(schedule.date),
            type: 'schedule',
            data: schedule
          }));
          this.loading = false;
        },
        error: () => {
          this.snackBar.open('Error loading schedules', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });

    // Get feedback data
    this.http.get<any[]>(`http://localhost:5000/api/feedback`)
      .subscribe({
        next: (feedbackData) => {
          const userFeedback = feedbackData.filter(feedback => feedback.userId === userId);
          const feedbackReports = userFeedback.map(feedback => ({
            id: feedback._id,
            date: new Date(feedback.createdAt),
            type: 'feedback',
            data: feedback
          }));
          this.reports = [...this.reports, ...feedbackReports];
        },
        error: () => {
          this.snackBar.open('Error loading feedback', 'Close', { duration: 3000 });
        }
      });
  }  generateFeedbackReport(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.loading = true;
      const feedbackReport = this.reports.filter(report => report.type === 'feedback');
      this.downloadReport({ 
        id: 'feedback_report',
        date: new Date(),
        type: 'feedback_report',
        data: feedbackReport
      }, 'feedback_report');
      this.loading = false;
    }
  }

  generateScheduleReport(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.loading = true;
      const scheduleReport = this.reports.filter(report => report.type === 'schedule');
      this.downloadReport({
        id: 'schedule_report',
        date: new Date(),
        type: 'schedule_report',
        data: scheduleReport
      }, 'schedule_report');
      this.loading = false;
    }
  }

  private downloadReport(data: Report, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString()}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  getFormattedDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
}
