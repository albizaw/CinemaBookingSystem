import { Component, ViewChild, OnInit } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MovieService } from 'src/app/services/movie.service';
import { NgToastService } from 'ng-angular-popup';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-all-orders',
  templateUrl: './all-orders.component.html',
  styleUrls: ['./all-orders.component.scss'],
})
export class AllOrdersComponent implements OnInit {
  displayedColumns: string[] = [
    'orderId',
    'email',
    'seanceTitle',
    'date',
    'actions',
  ];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(
    private movieService: MovieService,
    private toast: NgToastService,
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource<any>([]);
  }

  ngOnInit(): void {
    this.loadAllOrders();
  }

  loadAllOrders() {
    this.movieService.getAllOrders().subscribe(
      (orders: any[]) => {
        this.dataSource.data = orders;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sortingDataAccessor = (item, property) => {
          switch (property) {
            case 'orderId':
              return item.id;
            case 'email':
              return item.orderedUser.email;
            case 'seanceTitle':
              return item.orderedSeance.movie.title;
            case 'date':
              return item.orderedSeance.dateStart;
            default:
              return item[property];
          }
        };
      },
      (error) => {
        console.error('Error fetching orders:', error);
      }
    );
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

            this.loadAllOrders();
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
