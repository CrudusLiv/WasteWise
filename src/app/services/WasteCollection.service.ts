
// src/app/services/waste-collection.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WasteCollectionService {
  private apiUrl = 'http://localhost:5000/api/waste-collection';

  constructor(private http: HttpClient) {}

  createWasteCollection(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
