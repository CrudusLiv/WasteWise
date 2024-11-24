import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

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
    private snackBar: MatSnackBar,
    private authService: AuthService
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

    // Get feedback data
    this.http.get<any[]>(`http://localhost:5000/api/feedback/user/${userId}`)
      .subscribe({
        next: (feedbackData) => {
          const userFeedback = feedbackData.filter(feedback => feedback.userId === userId);
          const feedbackReports = userFeedback.map(feedback => ({
            id: feedback._id,
            date: new Date(feedback.createdAt),
            type: 'feedback',
            data: {
              fullName: feedback.fullName,
              email: feedback.email,
              subject: feedback.subject,
              message: feedback.message,
              createdAt: feedback.createdAt
            }
          }));
          this.reports = [...this.reports, ...feedbackReports];
        },
        error: () => {
          this.snackBar.open('Error loading feedback', 'Close', { duration: 3000 });
        }
      });
  }

  private loadWasteCollectionData(userId: string): void {
    this.http.get<any[]>(`http://localhost:5000/api/waste-collection`)
      .subscribe({
        next: (scheduleData) => {
          const userSchedules = scheduleData.filter(schedule => schedule.userId === userId);
          const scheduleReports = userSchedules.map(schedule => ({
            id: schedule._id,
            date: new Date(schedule.date),
            type: 'schedule',
            data: schedule
          }));
          this.reports = [...this.reports, ...scheduleReports];
          this.loading = false;
        },
        error: () => {
          this.snackBar.open('Error loading schedules', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  generateFeedbackReport(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    
    this.loading = true;
    const feedbackReport: Report = {
      id: 'feedback_' + new Date().getTime(),
      date: new Date(),
      type: 'feedback_report',
      data: {
        feedbacks: this.reports
          .filter((report: Report) => report.type === 'feedback')
          .map(report => ({
            submissionDate: this.getFormattedDate(new Date(report.date)),
            fullName: report.data.fullName,
            email: report.data.email,
            subject: report.data.subject,
            message: report.data.message
          }))
      }
    };
  
    this.downloadReport(feedbackReport, 'feedback_report');
    this.loading = false;
  }

  generateScheduleReport(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.loading = true;
    const scheduleData = this.reports
      .filter((report: Report) => report.type === 'schedule')
      .map(report => ({
        date: new Date(report.date).toLocaleDateString(),
        wasteType: report.data.wasteType,
        area: report.data.area,
        notes: report.data.notes || 'No notes provided',
        status: report.data.status || 'Scheduled'
      }));

    const reportContent: Report = {
      id: 'schedule_' + new Date().getTime(),
      type: 'Schedule Report',
      date: new Date(),
      data: scheduleData
    };

    this.downloadReport(reportContent, 'schedule_report');
    this.loading = false;
  }

    downloadReport(data: Report, filename: string): void {
      const reportContent = {
        reportType: data.type,
        generatedOn: this.getFormattedDate(new Date()),
        details: data.data
      };

      const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}_${new Date().toISOString()}.json`;
      link.click();
      window.URL.revokeObjectURL(url);

      // Create notification for the generated report
      const userId = localStorage.getItem('userId');
      if (userId) {
        const notificationData = {
          title: 'Report Generated',
          message: `A new ${data.type} report has been generated`,
          userId: userId,
          status: 'unread',
          type: 'report'
        };

        this.http.post('http://localhost:5000/api/notifications', notificationData)
          .subscribe({
            next: () => {
              this.snackBar.open('Report generated and notification sent', 'Close', { duration: 3000 });
            },
            error: (error) => {
              console.error('Error creating notification:', error);
            }
          });
      }

      this.authService.emitReportEvent(data.type);
    }
  getFormattedDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
}