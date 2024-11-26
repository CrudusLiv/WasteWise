import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface Collection {
  _id: string;
  userId: string;  // Added this property
  date: Date;
  status: string;
  wasteType: string;
  area: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  recentCollections: Collection[] = [];
  upcomingCollections: Collection[] = [];
  private readonly apiUrl = 'http://localhost:5000/api';

    constructor(
      private http: HttpClient,
      private authService: AuthService
    ) {
      // Subscribe to collection status changes
      this.authService.collectionEvent.subscribe(() => {
        this.loadCollectionHistory();
        this.loadUpcomingCollections();
      });
    }

    ngOnInit(): void {
      this.loadCollectionHistory();
      this.loadUpcomingCollections();
    }

    loadCollectionHistory(): void {
      const userId = localStorage.getItem('userId');
      this.http.get<Collection[]>(`${this.apiUrl}/waste-collection?userId=${userId}`)
        .subscribe({
          next: (collections) => {
            this.recentCollections = collections
              .filter(c => c.status === 'completed')
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5);
          },
          error: (error) => console.error('Error loading recent collections:', error)
        });
    }

    loadUpcomingCollections(): void {
      const userId = localStorage.getItem('userId');
      this.http.get<Collection[]>(`${this.apiUrl}/waste-collection?userId=${userId}`)
        .subscribe({
          next: (collections) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to start of day
            
            this.upcomingCollections = collections
              .filter(c => {
                const collectionDate = new Date(c.date);
                collectionDate.setHours(0, 0, 0, 0);
                return collectionDate >= today && c.status === 'pending';
              })
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 5);
          },
          error: (error) => console.error('Error loading upcoming collections:', error)
        });
    }
  }