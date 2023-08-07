import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { NgToastService } from 'ng-angular-popup';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl: string = 'http://localhost:5295/';
  private userPayload: any;
  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: NgToastService
  ) {
    this.userPayload = this.decodedToken();
  }

  ngOnInit() {
    console.log(this.userPayload);
  }

  getAllUsers() {
    return this.http.get<any>(`${this.baseUrl}allUsers`);
  }

  signUp(userObj: any) {
    return this.http.post<any>(`${this.baseUrl}signup`, userObj);
  }

  login(loginObj: any) {
    return this.http.post<any>(`${this.baseUrl}login`, loginObj);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
    this.toast.success({
      detail: 'SUCCESS',
      summary: 'Logged Out',
      duration: 5000,
    });
  }

  getUserById(userId: number) {
    return this.http.get<any>(`${this.baseUrl}user/${userId}`);
  }

  updateUser(id: number, userObj: any) {
    const token = this.getToken();

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.baseUrl}updateUser/${id}`, userObj, {
      headers,
    });
  }

  storeToken(tokenValue: string) {
    localStorage.setItem('token', tokenValue);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  decodedToken() {
    const jwtHelper = new JwtHelperService();
    const token = this.getToken();
    if (token) {
      return jwtHelper.decodeToken(token);
    } else {
      return null;
    }
  }

  getRoleFromToken() {
    const userPayload = this.decodedToken();
    if (userPayload) {
      console.log(userPayload);
      return userPayload.role;
    } else {
      return null;
    }
  }

  getUserIdFromToken() {
    const userPayload = this.decodedToken();
    if (userPayload) {
      return userPayload.UserId;
    } else {
      return null;
    }
  }
}
