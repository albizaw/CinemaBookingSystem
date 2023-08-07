import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MoviesComponent } from 'src/app/components/movies/movies.component';
import { OrdersComponent } from 'src/app/components/orders/orders.component';
import { SettingsComponent } from 'src/app/components/settings/settings.component';
import { UserDashboardComponent } from 'src/app/components/user-dashboard/user-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: UserDashboardComponent,
    children: [
      {
        path: 'movies',
        component: MoviesComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
      {
        path: 'orders',
        component: OrdersComponent,
      },
      {
        path: '',
        redirectTo: 'movies',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule {}
