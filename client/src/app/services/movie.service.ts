import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private baseUrl: string = 'http://localhost:5295/';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  getAllMovies() {
    return this.http.get<any>(`${this.baseUrl}movies`);
  }

  getAllSeances() {
    return this.http.get<any>(`${this.baseUrl}seances`);
  }

  getUniqueMovies() {
    return this.http.get<any>(`${this.baseUrl}uniquemovies`);
  }

  addMovie(movie: any) {
    return this.http.post<any>(`${this.baseUrl}movies/add`, movie);
  }

  deleteMovie(id: number) {
    return this.http.delete<any>(`${this.baseUrl}movies/delete/${id}`);
  }

  addSeance(seance: any) {
    return this.http.post<any>(`${this.baseUrl}seance/add`, seance);
  }

  addOrder(order: any) {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${this.baseUrl}order/add/`, order, {
      headers,
    });
  }

  deleteOrder(orderId: number) {
    return this.http.delete<any>(`${this.baseUrl}order/${orderId}`);
  }

  getOrdersForSeance(seanceId: number) {
    return this.http.get<any>(`${this.baseUrl}orders/${seanceId}`);
  }

  getMyOrders() {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.baseUrl}myorders`, {
      headers,
    });
  }

  getAllOrders() {
    return this.http.get<any>(`${this.baseUrl}orders`);
  }

  getMovieById(id: number) {
    return this.http.get<any>(`${this.baseUrl}movies/${id}`);
  }
}
