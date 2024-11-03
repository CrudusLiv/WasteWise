import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  constructor(private fb: FormBuilder) {}

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
      console.log('Form submitted:', this.collectionForm.value);
      // Add your form submission logic here
    }
  }
}
