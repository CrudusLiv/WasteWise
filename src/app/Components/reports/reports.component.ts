import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  previewFeedback: any[] = [];
  previewCollections: any[] = [];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadPreviews(): void {
    // Set start date to beginning of day (00:00:00)
    const startDate = new Date(this.dateRange.start);
    startDate.setHours(0, 0, 0, 0);
    
    // Set end date to end of day (23:59:59)
    const endDate = new Date(this.dateRange.end);
    endDate.setHours(23, 59, 59, 999);
    
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.http.get<any[]>(`http://localhost:5000/api/feedback?userId=${userId}`)
      .subscribe({
        next: (feedback) => {
          this.previewFeedback = feedback.filter(item => {
            const itemDate = new Date(item.createdAt);
            return itemDate >= startDate && itemDate <= endDate;
          });
        },
        error: () => {
          this.snackBar.open('Error loading feedback preview', 'Close', { duration: 3000 });
        }
      });

    this.http.get<any[]>(`http://localhost:5000/api/waste-collection`)
      .subscribe({
        next: (collections) => {
          this.previewCollections = collections.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= startDate && itemDate <= endDate;
          });
        },
        error: () => {
          this.snackBar.open('Error loading collections preview', 'Close', { duration: 3000 });
        }
      });
  }   loadReports(): void {
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
    this.http.get<any[]>(`http://localhost:5000/api/feedback?userId=${userId}`)
      .subscribe({
        next: (feedback) => {
          const filteredFeedback = feedback.filter(item => {
            const feedbackDate = new Date(item.createdAt);
            return feedbackDate >= this.dateRange.start && feedbackDate <= this.dateRange.end;
          });

          const feedbackReport: Report = {
            id: 'feedback_' + new Date().getTime(),
            date: new Date(),
            type: 'feedback_report',
            data: {
              feedbacks: filteredFeedback.map(item => ({
                submissionDate: this.getFormattedDate(new Date(item.createdAt)),
                fullName: item.fullName,
                email: item.email,
                subject: item.subject,
                message: item.message
              })),
              totalFeedback: filteredFeedback.length,
              dateRange: {
                start: this.getFormattedDate(this.dateRange.start),
                end: this.getFormattedDate(this.dateRange.end)
              }
            }
          };

          this.downloadReport(feedbackReport, 'feedback_report');
          this.loading = false;
        },
        error: (error) => {
          this.snackBar.open('Error generating feedback report', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
  }
  generateScheduleReport(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const reportData: Report = {
      id: 'schedule_' + new Date().getTime(),
      type: 'schedule_report',
      date: new Date(),
      data: {
        schedules: this.previewCollections.map(schedule => ({
          date: this.getFormattedDate(new Date(schedule.date)),
          wasteType: schedule.wasteType,
          status: schedule.status || 'Pending',
          area: schedule.area
        }))
      }
    };

    this.downloadReport(reportData, 'waste_collection_schedule');
  }

    downloadReport(data: Report, filename: string): void {
      const doc = new jsPDF();
      const reportDate = new Date().toLocaleDateString();
      
      // Add header with logo
      doc.setFontSize(20);
      doc.setTextColor(46, 125, 50); // Green color
      doc.text('WasteWise Report', 105, 20, { align: 'center' });
      
      // Add report info
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Generated on: ${reportDate}`, 20, 40);
      doc.text(`Report Type: ${data.type}`, 20, 50);

      if (data.type === 'feedback_report') {

        interface FeedbackReport {
          submissionDate: string;
          subject: string;
          message: string;
        }

        const feedbackData = data.data.feedbacks.map((fb: FeedbackReport) => [
          fb.submissionDate,
          fb.subject,
          fb.message
        ]);

        autoTable(doc, {
          head: [['Date', 'Subject', 'Message']],
          body: feedbackData,
          startY: 60,
          styles: {
            fontSize: 10,
            cellPadding: 5
          },
          headStyles: {
            fillColor: [46, 125, 50]
          }
        });
      } else {
        // Add interfaces for type safety
        interface FeedbackItem {
          submissionDate: string;
          subject: string;
          message: string;
        }

        interface ScheduleItem {
          date: string;
          wasteType: string;
          status: string;
          area: string;
        }

        // Update the mapping functions with proper typing
        const scheduleData = data.data.schedules.map((sch: ScheduleItem) => [
          sch.date,
          sch.wasteType,
          sch.status,
          sch.area
        ]);
        autoTable(doc, {
          head: [['Date', 'Waste Type', 'Status', 'Area']],
          body: scheduleData,
          startY: 60,
          styles: {
            fontSize: 10,
            cellPadding: 5
          },
          headStyles: {
            fillColor: [46, 125, 50]
          }
        });
      }

      doc.save(`${filename}_${reportDate}.pdf`);

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