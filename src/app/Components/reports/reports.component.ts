import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import * as XLSX from 'xlsx';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  feedbackReports: any[] = [];
  pickupReports: any[] = [];
  userId: string;
  isLoading = false;

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.userId = this.authService.getUserId();
  }

  ngOnInit() {
    this.loadFeedbackReports();
    this.loadPickupReports();
  }

  generateFeedbackReport() {
    const reportData = this.feedbackReports.map(feedback => ({
      'Subject': feedback.subject,
      'Message': feedback.message,
      'Date Submitted': new Date(feedback.createdAt).toLocaleDateString()
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Feedback History');
    XLSX.writeFile(workbook, `feedback_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    this.snackBar.open('Feedback report generated successfully!', 'Close', {
      duration: 3000
    });
  }

  generatePickupReport() {
    const reportData = this.pickupReports.map(pickup => ({
      'Waste Type': pickup.wasteType,
      'Collection Date': new Date(pickup.date).toLocaleDateString(),
      'Status': pickup.status,
      'Location': pickup.location
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pickup History');
    XLSX.writeFile(workbook, `pickup_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    this.snackBar.open('Pickup report generated successfully!', 'Close', {
      duration: 3000
    });
  }
}