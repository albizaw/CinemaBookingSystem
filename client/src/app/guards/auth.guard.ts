import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NgToastService } from 'ng-angular-popup';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: NgToastService
  ) {}
  canActivate() {
    if (this.auth.isLoggedIn() && this.auth.getRoleFromToken() == 'Admin') {
      return true;
    } else if (this.auth.getRoleFromToken() == 'User') {
      this.toast.error({ detail: 'ERROR', summary: 'Access denied!' });
      this.router.navigate(['login']);
      return false;
    } else {
      this.toast.error({ detail: 'ERROR', summary: 'Login first!' });
      this.router.navigate(['login']);
      return false;
    }
  }
}
