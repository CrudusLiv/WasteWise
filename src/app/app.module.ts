import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
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
import { ProfileSetupComponent } from './Components/profile-setup/profile-setup.component';
import { AuthGuard } from './guards/auth.guard';
import { FeedbackResponseDialogComponent } from './Components/feedback-response-dialog/feedback-response-dialog.component';
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
    ProfileSetupComponent,
    FeedbackResponseDialogComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MaterialModule,
    MatSnackBarModule,
    FormsModule
  ],
  providers: [
    AuthGuard,
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }