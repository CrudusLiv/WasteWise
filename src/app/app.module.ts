import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminComponent } from './Components/admin/admin.component';
import { ContactComponent } from './Components/contact/contact.component';
import { DashboardComponent } from './Components/dashboard/dashboard.component';
import { DisposalComponent } from './Components/disposal/disposal.component';
import { AccessComponent } from './Components/access/access.component';
import { NavigationComponent } from './Components/navigation/navigation.component';
import { NotificationComponent } from './Components/notification/notification.component';
import { ProfileComponent } from './Components/profile/profile.component';
import { ReportsComponent } from './Components/reports/reports.component';
import { WasteCollectionComponent } from './Components/waste-collection/waste-collection.component';
import { RecyclingComponent } from './Components/recycling/recycling.component';
import { PickupHistoryComponent } from './Components/pickup-history/pickup-history.component';
import { MaterialModule } from './material/material.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

@NgModule({
  declarations: [
    AppComponent,
    ReportsComponent, 
    AdminComponent,
    ContactComponent,
    DashboardComponent,
    DisposalComponent,
    AccessComponent,
    NavigationComponent,
    NotificationComponent,
    ProfileComponent,
    WasteCollectionComponent,
    RecyclingComponent,
    PickupHistoryComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
    
    
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
