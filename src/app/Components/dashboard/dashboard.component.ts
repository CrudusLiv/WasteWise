import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  recentCollections: any[] = [];
  upcomingCollections: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCollectionHistory();
    this.loadUpcomingCollections();
  }

  loadCollectionHistory(): void {
    const userId = localStorage.getItem('userId');
    this.http.get<any[]>(`http://localhost:5000/api/waste-collection`)
      .subscribe(collections => {
        this.recentCollections = collections
          .filter(c => c.status === 'completed')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
      });
  }

  loadUpcomingCollections(): void {
    const userId = localStorage.getItem('userId');
    this.http.get<any[]>(`http://localhost:5000/api/waste-collection`)
      .subscribe(collections => {
        const today = new Date();
        this.upcomingCollections = collections
          .filter(c => new Date(c.date) >= today && c.status !== 'completed')
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5);
      });
  }
}