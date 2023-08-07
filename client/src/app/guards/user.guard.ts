import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate() {
    if (this.auth.isLoggedIn() && this.auth.getRoleFromToken() == 'User') {
      return true;
    } else {
      this.router.navigate(['login']);
      return false;
    }
  }
}
