import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsComponent } from './Components/reports/reports.component';
import { DashboardComponent } from './Components/dashboard/dashboard.component';
import { AccessComponent } from './Components/access/access.component';
import { AdminComponent } from './Components/admin/admin.component';
import { ContactComponent } from './Components/contact/contact.component';
import { DisposalComponent } from './Components/disposal/disposal.component';
import { NavigationComponent } from './Components/navigation/navigation.component';
import { NotificationComponent } from './Components/notification/notification.component';
import { ProfileComponent } from './Components/profile/profile.component';
import { RecyclingComponent } from './Components/recycling/recycling.component';
import { WasteCollectionComponent } from './Components/waste-collection/waste-collection.component';
import { ProfileSetupComponent } from './Components/profile-setup/profile-setup.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'access', component: AccessComponent },
  { 
    path: '', 
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'profile-setup', component: ProfileSetupComponent },
      { path: 'waste-collection', component: WasteCollectionComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'admin', component: AdminComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'recycling', component: RecyclingComponent },
      { path: 'disposal', component: DisposalComponent },
      { path: 'navigation', component: NavigationComponent },
      { path: 'notification', component: NotificationComponent }
    ]
  },
  { path: '**', redirectTo: 'access' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }