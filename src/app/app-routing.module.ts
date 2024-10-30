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
import { PickupHistoryComponent } from './Components/pickup-history/pickup-history.component';
import { ProfileComponent } from './Components/profile/profile.component';
import { RecyclingComponent } from './Components/recycling/recycling.component';
import { WasteCollectionComponent } from './Components/waste-collection/waste-collection.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'access', component: AccessComponent },
  { path: 'admin', component: AdminComponent },
  { path: ' contact', component: ContactComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'disposal', component: DisposalComponent },
  { path: 'naviggation', component: NavigationComponent },
  { path: 'notification', component: NotificationComponent },
  { path: 'pickup-history', component: PickupHistoryComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'recycling', component: RecyclingComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'waste-collection', component: WasteCollectionComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
