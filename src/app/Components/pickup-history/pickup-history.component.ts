import { Component } from '@angular/core';

@Component({
  selector: 'app-pickup-history',
  templateUrl: './pickup-history.component.html',
  styleUrl: './pickup-history.component.css'
})
export class PickupHistoryComponent {
  history: any[] = [];
  filteredHistory: any[] = [];
  filter = { wasteType: '', startDate: '', endDate: '' };
  constructor() {
    this.history = [
      { date: '2023-01-01', wasteType: 'Paper', quantity: 10, location: 'Location A' },
      { date: '2023-01-02', wasteType: 'Plastic', quantity: 5, location: 'Location B' },
      { date: '2023-01-03', wasteType: 'Glass', quantity: 8, location: 'Location C' },
      { date: '2023-01-04', wasteType: 'Paper', quantity: 12, location: 'Location D' },
      { date: '2023-01-05', wasteType: 'Plastic', quantity: 7, location: 'Location E' },
      { date: '2023-01-06', wasteType: 'Glass', quantity: 9, location: 'Location F' },
      { date: '2023-01-07', wasteType: 'Paper', quantity: 11, location: 'Location G' },
      { date: '2023-01-08', wasteType: 'Plastic', quantity: 6, location: 'Location H' },
    ];
  }

  filterHistory() {
    this.filteredHistory = this.history.filter(pickup => {
      return (!this.filter.wasteType || pickup.wasteType === this.filter.wasteType) &&
             (!this.filter.startDate || new Date(pickup.date) >= new Date(this.filter.startDate)) &&
             (!this.filter.endDate || new Date(pickup.date) <= new Date(this.filter.endDate));
    });
  }
}
