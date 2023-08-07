import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddMovieComponent } from 'src/app/components/add-movie/add-movie.component';
import { AddSeanceComponent } from 'src/app/components/add-seance/add-seance.component';
import { AdminDashboardComponent } from 'src/app/components/admin-dashboard/admin-dashboard.component';
import { AllOrdersComponent } from 'src/app/components/all-orders/all-orders.component';
import { SettingsComponent } from 'src/app/components/settings/settings.component';

import { UsersListComponent } from 'src/app/components/users-list/users-list.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    children: [
      {
        path: 'users',
        component: UsersListComponent,
      },
      {
        path: 'addseance',
        component: AddSeanceComponent,
      },
      {
        path: 'addmovie',
        component: AddMovieComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
      {
        path: 'orders',
        component: AllOrdersComponent,
      },
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
