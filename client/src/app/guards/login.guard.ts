import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate() {
    if (this.auth.isLoggedIn()) {
      if (this.auth.getRoleFromToken() == 'User') {
        this.router.navigate(['user/dashboard']);
        return false;
      } else {
        this.router.navigate(['admin/dashboard']);
        return false;
      }
    } else {
      return true;
    }
  }
}
