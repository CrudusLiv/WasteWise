import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-waste-collection',
  templateUrl: './waste-collection.component.html',
  styleUrls: ['./waste-collection.component.css']
})
export class WasteCollectionComponent implements OnInit {
  collectionForm!: FormGroup;
  
  areas = [
    { id: 'area1', name: 'Area 1 - Downtown' },
    { id: 'area2', name: 'Area 2 - Suburbs' },
    { id: 'area3', name: 'Area 3 - Industrial' },
    { id: 'area4', name: 'Area 4 - Commercial' }
  ];
  
  wasteTypes = [
    { id: 'household', name: 'Household Waste', icon: 'home' },
    { id: 'recyclable', name: 'Recyclable Waste', icon: 'recycling' },
    { id: 'hazardous', name: 'Hazardous Waste', icon: 'warning' },
    { id: 'green', name: 'Green Waste', icon: 'grass' },
    { id: 'electronic', name: 'Electronic Waste', icon: 'devices' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.collectionForm = this.fb.group({
      area: ['', Validators.required],
      date: ['', Validators.required],
      wasteType: ['', Validators.required],
      notes: ['']
    });
  }

  onSubmit() {
    if (this.collectionForm.valid) {
      this.http.post('http://localhost:5000/waste-collection', this.collectionForm.value)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            let errorMessage = 'An unknown error occurred';
            
            if (error.error instanceof ErrorEvent) {
              // Client-side error
              errorMessage = `Error: ${error.error.message}`;
            } else {
              // Server-side error
              errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
            }
            
            this.snackBar.open(errorMessage, 'Close', {
              duration: 5000
            });
            
            return throwError(() => new Error(errorMessage));
          })
        )
        .subscribe({
          next: (response) => {
            this.snackBar.open('Waste collection submitted successfully', 'Close', {
              duration: 3000
            });
            this.collectionForm.reset();
          }
        });
    }
  }
}