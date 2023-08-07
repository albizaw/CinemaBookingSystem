import { Component, OnInit } from '@angular/core';
import { NgToastService } from 'ng-angular-popup';
import { MovieService } from 'src/app/services/movie.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit {
  displayedColumns: string[] = [
    'orderId',
    'movieTitle',
    'dateStart',
    'seats',
    'actions',
  ];
  orders: any[] = [];

  constructor(
    private movieService: MovieService,
    private toast: NgToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadMyOrders();
  }

  loadMyOrders() {
    this.movieService.getMyOrders().subscribe((orders) => {
      this.orders = orders;
      this.loadMoviesForOrders();
    });
  }

  loadMoviesForOrders() {
    const movieIds = [
      ...new Set(this.orders.map((order) => order.orderedSeance?.movieId)),
    ];

    movieIds.forEach((movieId) => {
      this.movieService.getMovieById(movieId).subscribe((data) => {
        this.orders.forEach((order) => {
          if (order.orderedSeance?.movieId === movieId) {
            order.orderedSeance.movie = data;
          }
        });
      });
    });
  }

  getSeatNumbers(seats: any) {
    return seats.map((seat: any) => seat.seatNumber).join(', ');
  }

  deleteOrder(order: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '250px',
      data: {
        message: 'Are you sure you want to delete this order?',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.movieService.deleteOrder(order.id).subscribe(
          (res) => {
            this.toast.success({
              detail: 'SUCCESS',
              summary: res.message,
              duration: 5000,
            });

            this.loadMyOrders();
          },
          (err) => {
            this.toast.error({
              detail: 'ERROR',
              summary: err.error.message,
              duration: 2000,
            });
          }
        );
      }
    });
  }
}
