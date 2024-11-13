import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportService } from '../../services/report.service';

interface Report {
  id: string;
  date: Date;
  type: string;
  data: any;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html'
})
export class ReportsComponent {
  dateRange = {
    start: new Date(),
    end: new Date()
  };

  constructor(
    private reportService: ReportService,
    private snackBar: MatSnackBar
  ) {}

  generateFeedbackReport(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.reportService.generateFeedbackReport(userId, this.dateRange)
        .subscribe({
          next: (report: Report) => {
            this.downloadReport(report, 'feedback_report');
          },
          error: (error: Error) => {
            this.snackBar.open('Error generating feedback report', 'Close', {
              duration: 3000
            });
          }
        });
    }
  }

  generateScheduleReport(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.reportService.generateScheduleReport(userId, this.dateRange)
        .subscribe({
          next: (report: Report) => {
            this.downloadReport(report, 'schedule_report');
          },
          error: (error: Error) => {
            this.snackBar.open('Error generating schedule report', 'Close', {
              duration: 3000
            });
          }
        });
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
}